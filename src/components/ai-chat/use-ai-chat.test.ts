import { act, renderHook, waitFor } from "@testing-library/react"
import { TextDecoder as NodeTextDecoder, TextEncoder as NodeTextEncoder } from "util"
import {
  ACTIVE_CONV_STORAGE_KEY,
  CHAT_ENDPOINT,
  CHAT_MESSAGES_PREFIX,
  CONVERSATIONS_ENDPOINT,
  useAiChat,
} from "./use-ai-chat"

const g = globalThis as Record<string, unknown>
if (typeof g.TextEncoder === "undefined") g.TextEncoder = NodeTextEncoder
if (typeof g.TextDecoder === "undefined") g.TextDecoder = NodeTextDecoder

interface FakeReader {
  read: () => Promise<{ done: boolean; value?: Uint8Array }>
}
interface FakeResponse {
  ok: boolean
  status: number
  body: { getReader: () => FakeReader } | null
  json?: () => Promise<unknown>
}

function streamingFakeResponse(chunks: string[]): FakeResponse {
  const encoder = new NodeTextEncoder()
  const queue = chunks.map((c) => encoder.encode(c))
  return {
    ok: true,
    status: 200,
    body: {
      getReader: () => ({
        read: async () => {
          const next = queue.shift()
          if (next === undefined) return { done: true }
          return { done: false, value: next }
        },
      }),
    },
  }
}

function jsonFakeResponse(payload: unknown, status = 200): FakeResponse {
  return {
    ok: status >= 200 && status < 300,
    status,
    body: null,
    json: () => Promise.resolve(payload),
  }
}

describe("useAiChat", () => {
  const fetchMock = jest.fn<Promise<FakeResponse>, [RequestInfo | URL, RequestInit?]>()

  beforeEach(() => {
    fetchMock.mockReset()
    window.localStorage.clear()
    Object.defineProperty(globalThis, "fetch", {
      value: fetchMock,
      writable: true,
      configurable: true,
    })
  })

  const convRow = (id: string, title = "New chat") => ({
    id,
    title,
    lastMessagePreview: null,
    updatedAt: "2026-05-04T12:34:56.789Z",
  })

  async function settleInitialHydrate(conversationsPayload: unknown) {
    fetchMock.mockResolvedValueOnce(jsonFakeResponse({ conversations: conversationsPayload }))
    const { result } = renderHook(() => useAiChat())
    await act(async () => {})
    await waitFor(() =>
      expect(fetchMock.mock.calls[0]?.[0]).toBe(CONVERSATIONS_ENDPOINT),
    )
    await waitFor(() => expect(result.current.listLoading).toBe(false))
    return result
  }

  it("starts with listLoading until the first inbox fetch completes", async () => {
    fetchMock.mockResolvedValueOnce(jsonFakeResponse({ conversations: [] }))
    const { result } = renderHook(() => useAiChat())
    expect(result.current.listLoading).toBe(true)
    await waitFor(() => expect(result.current.listLoading).toBe(false))
  })

  it("sets messagesLoading until openThread finishes fetching messages", async () => {
    const resultRef = await settleInitialHydrate([])
    fetchMock.mockResolvedValueOnce(jsonFakeResponse({ conversations: [convRow("c99")] }))
    let release!: (value: FakeResponse) => void
    const barrier = new Promise<FakeResponse>((res) => {
      release = res
    })
    fetchMock.mockImplementationOnce(() => barrier)

    let done!: Promise<void>
    await act(() => {
      done = resultRef.current.openThread("c99")
    })

    await waitFor(() => expect(resultRef.current.messagesLoading).toBe(true))

    await act(async () => {
      release(jsonFakeResponse({ messages: [{ id: "m1", role: "user", content: "hi" }] }))
      await done
    })

    expect(resultRef.current.messagesLoading).toBe(false)
    expect(resultRef.current.messages).toHaveLength(1)
  })

  it("refreshes the inbox on mount without opening a stale thread", async () => {
    await settleInitialHydrate([])
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("creates a conversation, sends NDJSON, and appends streamed assistant output", async () => {
    const resultRef = await settleInitialHydrate([])

    fetchMock.mockResolvedValueOnce(jsonFakeResponse({ id: "new-1", title: "New chat" }))
    fetchMock.mockResolvedValueOnce(jsonFakeResponse({ conversations: [convRow("new-1")] }))
    fetchMock.mockResolvedValueOnce(
      streamingFakeResponse([
        '{"type":"step","id":"recipes","label":"Loaded","status":"complete"}\n',
        '{"type":"token","text":"Hi"}\n',
        '{"type":"done","conversationId":"new-1"}\n',
      ]),
    )
    fetchMock.mockResolvedValueOnce(jsonFakeResponse({ conversations: [convRow("new-1")] }))

    await act(async () => {
      await resultRef.current.send("Hello")
    })

    await waitFor(() => expect(resultRef.current.streaming).toBe(false))
    expect(resultRef.current.error).toBeNull()
    expect(window.localStorage.getItem(ACTIVE_CONV_STORAGE_KEY)).toBe("new-1")

    const chatCall = fetchMock.mock.calls.find(([url]) => {
      const u = typeof url === "string" ? url : url.toString()
      return u === CHAT_ENDPOINT || u.endsWith(CHAT_ENDPOINT)
    })
    expect(chatCall).toBeTruthy()
    const [, init] = chatCall as [string, RequestInit]
    const body = JSON.parse((init.body as string) ?? "{}") as {
      conversationId: string
      content: string
    }
    expect(body).toEqual({ conversationId: "new-1", content: "Hello" })

    expect(resultRef.current.messages).toEqual([
      { id: expect.stringMatching(/^u-/), role: "user", content: "Hello" },
      { id: expect.stringMatching(/^a-/), role: "assistant", content: "Hi" },
    ])
  })

  it("clears stored active conversation when messages 404", async () => {
    window.localStorage.setItem(ACTIVE_CONV_STORAGE_KEY, "missing")
    fetchMock.mockResolvedValueOnce(jsonFakeResponse({ conversations: [] }))
    fetchMock.mockResolvedValueOnce(jsonFakeResponse({ conversations: [] }))
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 404,
      body: null,
      json: () => Promise.resolve({ error: "Not found" }),
    })

    const { result } = renderHook(() => useAiChat())
    await act(async () => {})
    await waitFor(() => expect(result.current.error).toBe("Could not load messages."))
    expect(window.localStorage.getItem(ACTIVE_CONV_STORAGE_KEY)).toBeNull()
  })

  it("surfaces server errors on chat and removes the placeholder assistant bubble", async () => {
    const resultRef = await settleInitialHydrate([])
    fetchMock.mockResolvedValueOnce(jsonFakeResponse({ id: "c1", title: "New chat" }))
    fetchMock.mockResolvedValueOnce(jsonFakeResponse({ conversations: [convRow("c1")] }))
    fetchMock.mockResolvedValueOnce(jsonFakeResponse({ error: "Bad" }, 500))

    await act(async () => {
      await resultRef.current.send("hi")
    })

    await waitFor(() => expect(resultRef.current.streaming).toBe(false))
    expect(resultRef.current.error).toBe("Bad")
    expect(resultRef.current.messages).toEqual([])
  })

  it("ignores empty input and does not call fetch beyond hydrate", async () => {
    const resultRef = await settleInitialHydrate([])
    expect(fetchMock).toHaveBeenCalledTimes(1)

    await act(async () => {
      await resultRef.current.send("   ")
    })

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("deleteConversation calls delete endpoint and returns to list when active", async () => {
    const resultRef = await settleInitialHydrate([convRow("c1")])
    fetchMock.mockResolvedValueOnce(jsonFakeResponse({ conversations: [convRow("c1")] }))
    fetchMock.mockResolvedValueOnce(jsonFakeResponse({ messages: [] }))

    await act(async () => {
      await resultRef.current.openThread("c1")
    })

    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 204,
      body: null,
    })
    fetchMock.mockResolvedValueOnce(jsonFakeResponse({ conversations: [] }))

    await act(async () => {
      await resultRef.current.deleteConversation("c1")
    })

    await waitFor(() =>
      expect(
        fetchMock.mock.calls.some(
          ([url, init]) =>
            init?.method === "DELETE" &&
            (typeof url === "string" ? url : url.toString()).startsWith(`${CONVERSATIONS_ENDPOINT}/`),
        ),
      ).toBe(true),
    )

    await waitFor(() => expect(resultRef.current.view).toBe("list"))
  })

  it("loads messages via the messages route when opening a thread", async () => {
    const resultRef = await settleInitialHydrate([convRow("c99")])
    fetchMock.mockResolvedValueOnce(jsonFakeResponse({ conversations: [convRow("c99")] }))
    fetchMock.mockResolvedValueOnce(
      jsonFakeResponse({
        messages: [{ id: "m1", role: "user", content: "hi" }],
      }),
    )

    await act(async () => {
      await resultRef.current.openThread("c99")
    })

    await waitFor(() => expect(resultRef.current.messages.length).toBeGreaterThan(0))
    expect(fetchMock.mock.calls.some(([url]) => url.toString().includes(`${CHAT_MESSAGES_PREFIX}/c99/messages`)))
      .toBe(true)
    expect(window.localStorage.getItem(ACTIVE_CONV_STORAGE_KEY)).toBe("c99")
  })

  it("ignores stale thread loads when a newer thread opens first", async () => {
    const slow = convRow("slow", "Slow chat")
    const fast = convRow("fast", "Fast chat")
    const resultRef = await settleInitialHydrate([slow, fast])

    let releaseSlowMessages!: (value: FakeResponse) => void
    const slowMessages = new Promise<FakeResponse>((resolve) => {
      releaseSlowMessages = resolve
    })

    fetchMock.mockResolvedValueOnce(jsonFakeResponse({ conversations: [slow, fast] }))
    fetchMock.mockImplementationOnce(() => slowMessages)
    fetchMock.mockResolvedValueOnce(jsonFakeResponse({ conversations: [slow, fast] }))
    fetchMock.mockResolvedValueOnce(
      jsonFakeResponse({
        messages: [{ id: "fast-m1", role: "user", content: "fast thread" }],
      }),
    )

    let slowDone!: Promise<void>
    await act(() => {
      slowDone = resultRef.current.openThread("slow")
    })

    await waitFor(() =>
      expect(
        fetchMock.mock.calls.some(([url]) => url.toString().includes(`${CHAT_MESSAGES_PREFIX}/slow/messages`)),
      ).toBe(true),
    )

    await act(async () => {
      await resultRef.current.openThread("fast")
    })

    expect(resultRef.current.activeConversationId).toBe("fast")
    expect(resultRef.current.activeTitle).toBe("Fast chat")
    expect(resultRef.current.messages).toEqual([
      { id: "fast-m1", role: "user", content: "fast thread" },
    ])

    await act(async () => {
      releaseSlowMessages(
        jsonFakeResponse({
          messages: [{ id: "slow-m1", role: "user", content: "slow thread" }],
        }),
      )
      await slowDone
    })

    expect(resultRef.current.activeConversationId).toBe("fast")
    expect(resultRef.current.activeTitle).toBe("Fast chat")
    expect(resultRef.current.messages).toEqual([
      { id: "fast-m1", role: "user", content: "fast thread" },
    ])
    expect(window.localStorage.getItem(ACTIVE_CONV_STORAGE_KEY)).toBe("fast")
  })
})
