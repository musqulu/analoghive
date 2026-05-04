/**
 * @jest-environment node
 */
const mockCreateNdjson = jest.fn()
const mockGetConversation = jest.fn()
const mockGetUser = jest.fn<Promise<{ data: { user: { id: string } | null } }>, []>()

jest.mock("@/lib/ai/process-chat-turn", () => ({
  createNdjsonChatStream: (...args: unknown[]) => mockCreateNdjson(...args),
  ndjsonHeaders: () => ({
    "Content-Type": "application/x-ndjson; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Accel-Buffering": "no",
  }),
}))

jest.mock("@/lib/ai/conversation-store", () => ({
  getConversation: (...args: unknown[]) => mockGetConversation(...args),
}))

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(() =>
    Promise.resolve({
      auth: { getUser: mockGetUser },
    }),
  ),
}))

function postRequest(body: unknown) {
  return new Request("http://localhost/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

async function readBodyToString(res: Response): Promise<string> {
  if (!res.body) return ""
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let out = ""
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    out += decoder.decode(value, { stream: true })
  }
  out += decoder.decode()
  return out
}

describe("POST /api/chat", () => {
  const ORIGINAL_TOKEN = process.env.REPLICATE_API_TOKEN

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.REPLICATE_API_TOKEN = "test-token"
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } })
    mockGetConversation.mockResolvedValue({
      id: "c-existing",
      user_id: "user-1",
      title: "t",
      summary: null,
      summary_message_count: 0,
      last_message_preview: null,
      updated_at: "2026-05-04T00:00:00.000Z",
    })
    mockCreateNdjson.mockReturnValue(
      new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('{"type":"done","conversationId":"c1"}\n'))
          controller.close()
        },
      }),
    )
  })

  afterAll(() => {
    if (ORIGINAL_TOKEN === undefined) delete process.env.REPLICATE_API_TOKEN
    else process.env.REPLICATE_API_TOKEN = ORIGINAL_TOKEN
  })

  it("returns 500 with a JSON error when REPLICATE_API_TOKEN is missing", async () => {
    delete process.env.REPLICATE_API_TOKEN
    const { POST } = await import("@/app/api/chat/route")
    const res = await POST(postRequest({ content: "hi" }))
    expect(res.status).toBe(500)
    const json = (await res.json()) as { error: string }
    expect(json.error).toMatch(/REPLICATE_API_TOKEN/)
    expect(mockCreateNdjson).not.toHaveBeenCalled()
  })

  it("returns 401 when the user is not signed in", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })
    const { POST } = await import("@/app/api/chat/route")
    const res = await POST(postRequest({ content: "hi" }))
    expect(res.status).toBe(401)
    expect(mockCreateNdjson).not.toHaveBeenCalled()
  })

  it("returns 400 when body is missing content", async () => {
    const { POST } = await import("@/app/api/chat/route")
    const res = await POST(postRequest({ conversationId: "c1" }))
    expect(res.status).toBe(400)
  })

  it("returns 400 when content is only whitespace", async () => {
    const { POST } = await import("@/app/api/chat/route")
    const res = await POST(postRequest({ content: " \n\t " }))
    expect(res.status).toBe(400)
  })

  it("returns 404 when conversationId is unknown", async () => {
    mockGetConversation.mockResolvedValueOnce(null)
    const { POST } = await import("@/app/api/chat/route")
    const res = await POST(postRequest({ conversationId: "missing", content: "hi" }))
    expect(res.status).toBe(404)
    expect(mockCreateNdjson).not.toHaveBeenCalled()
  })

  it("streams ndjson headers and forwards args to createNdjsonChatStream", async () => {
    const { POST } = await import("@/app/api/chat/route")
    const res = await POST(postRequest({ content: "Tell me about Rodinal." }))
    expect(res.status).toBe(200)
    expect(res.headers.get("content-type")).toContain("application/x-ndjson")

    await readBodyToString(res)

    expect(mockGetConversation).not.toHaveBeenCalled()
    expect(mockCreateNdjson).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        replicateToken: "test-token",
        conversationId: undefined,
        content: "Tell me about Rodinal.",
      }),
    )
  })

  it("propagates stream errors when reading the body", async () => {
    mockCreateNdjson.mockReturnValueOnce(
      new ReadableStream({
        start(controller) {
          controller.error(new Error("boom"))
        },
      }),
    )

    const { POST } = await import("@/app/api/chat/route")
    const res = await POST(postRequest({ content: "hi" }))
    expect(res.status).toBe(200)
    await expect(readBodyToString(res)).rejects.toThrow(/boom/)
  })
})
