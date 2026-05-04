/**
 * @jest-environment node
 */
import { TextDecoder as NodeTextDecoder } from "util"
import Replicate from "replicate"
import * as conversationStore from "@/lib/ai/conversation-store"
import * as contextLoader from "@/lib/ai/context-loader"
import { parseNdjsonLines } from "@/lib/ai/chat-stream"
import { createNdjsonChatStream, MODEL } from "@/lib/ai/process-chat-turn"

jest.mock("replicate", () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock("@/lib/ai/conversation-store", () => ({
  __esModule: true,
  NEW_CHAT_TITLE: "New chat",
  createConversation: jest.fn(),
  getConversation: jest.fn(),
  appendMessage: jest.fn(),
  countMessages: jest.fn(),
  getRecentMessagesForPrompt: jest.fn(),
  updateConversationMeta: jest.fn(),
  getMessagesAfterCount: jest.fn(),
}))

jest.mock("@/lib/ai/context-loader", () => ({
  loadUserContext: jest.fn(),
  findRelevantDeveloperRows: jest.fn(() => []),
}))

jest.mock("@/lib/ai/system-prompt", () => ({
  buildSystemPrompt: jest.fn(() => "<<SYS>>"),
}))

async function readAllNdjson(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader()
  const decoder = new NodeTextDecoder()
  let out = ""
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    out += decoder.decode(value, { stream: true })
  }
  out += decoder.decode()
  return out
}

describe("createNdjsonChatStream", () => {
  const supabase = {} as never
  const mockStream = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(contextLoader.loadUserContext).mockResolvedValue({
      recipes: [],
      favorites: [],
      recentLogs: [],
    })
    jest.mocked(conversationStore.createConversation).mockResolvedValue({
      id: "conv-new",
      title: "New chat",
    })
    jest.mocked(conversationStore.getConversation).mockResolvedValue({
      id: "conv-new",
      user_id: "user-1",
      title: "New chat",
      summary: null,
      summary_message_count: 0,
      last_message_preview: null,
      updated_at: "2026-05-04T00:00:00.000Z",
    })
    jest.mocked(conversationStore.appendMessage).mockResolvedValue({ id: "m1" })
    let countCalls = 0
    jest.mocked(conversationStore.countMessages).mockImplementation(async () => {
      countCalls += 1
      return countCalls === 1 ? 1 : 2
    })
    jest.mocked(conversationStore.getRecentMessagesForPrompt).mockResolvedValue([
      { role: "user", content: "Tell me about HC-110 dilution B." },
    ])
    jest.mocked(conversationStore.updateConversationMeta).mockResolvedValue()

    async function* gen() {
      yield { event: "output" as const, data: "Hel" }
      yield { event: "output" as const, data: "lo" }
      yield { event: "done" as const }
    }
    mockStream.mockReturnValue(gen())

    ;(Replicate as unknown as jest.Mock).mockImplementation(() => ({
      stream: mockStream,
      run: jest.fn().mockResolvedValue(""),
    }))
  })

  it("creates a conversation when none is provided and streams ndjson in order", async () => {
    const stream = createNdjsonChatStream({
      supabase,
      userId: "user-1",
      replicateToken: "tok",
      conversationId: undefined,
      content: "Tell me about HC-110 dilution B.",
    })
    const body = await readAllNdjson(stream)
    const lines = parseNdjsonLines(body)

    expect(conversationStore.createConversation).toHaveBeenCalledWith(supabase, "user-1")
    expect(conversationStore.appendMessage).toHaveBeenCalledTimes(2)

    expect(lines.some((l) => l.type === "step" && l.id === "recipes")).toBe(true)
    expect(lines.some((l) => l.type === "step" && l.id === "chart")).toBe(true)
    const compose = lines.filter((l) => l.type === "step" && l.id === "compose")
    expect(compose.some((s) => s.status === "active")).toBe(true)
    expect(compose.some((s) => s.status === "complete")).toBe(true)
    expect(lines.filter((l) => l.type === "token").map((l) => l.text).join("")).toBe("Hello")

    const doneLine = lines.find((l) => l.type === "done")
    expect(doneLine?.type === "done" && doneLine.conversationId.length > 0).toBe(true)

    expect(mockStream).toHaveBeenCalledTimes(1)
    const [model, opts] = mockStream.mock.calls[0] as [
      typeof MODEL,
      { input: { prompt: string; system_prompt: string } },
    ]
    expect(model).toBe(MODEL)
    expect(opts.input.prompt).toContain("Most recent messages (verbatim):")
    expect(opts.input.prompt).toContain("Human: Tell me about HC-110 dilution B.")
    expect(opts.input.system_prompt).toBe("<<SYS>>")
    expect(opts.input.prompt).not.toContain("Earlier in this thread")
  })

  it("does not create a conversation when conversationId is provided", async () => {
    jest.mocked(conversationStore.getConversation).mockResolvedValue({
      id: "existing",
      user_id: "user-1",
      title: "Existing",
      summary: "Earlier summary snippet",
      summary_message_count: 4,
      last_message_preview: "hi",
      updated_at: "2026-05-04T00:00:00.000Z",
    })

    const stream = createNdjsonChatStream({
      supabase,
      userId: "user-1",
      replicateToken: "tok",
      conversationId: "existing",
      content: "Next question",
    })
    await readAllNdjson(stream)

    expect(conversationStore.createConversation).not.toHaveBeenCalled()
    const [, opts] = mockStream.mock.calls[0] as [
      typeof MODEL,
      { input: { prompt: string } },
    ]
    expect(opts.input.prompt).toContain("Earlier in this thread")
  })
})
