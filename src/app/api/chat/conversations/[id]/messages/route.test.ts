/**
 * @jest-environment node
 */
const mockGetUser = jest.fn<Promise<{ data: { user: { id: string } | null } }>, []>()
const mockGetMessages = jest.fn()

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(() =>
    Promise.resolve({
      auth: { getUser: mockGetUser },
    }),
  ),
}))

jest.mock("@/lib/ai/conversation-store", () => ({
  getMessages: (...args: unknown[]) => mockGetMessages(...args),
}))

describe("GET /api/chat/conversations/[id]/messages", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } })
  })

  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })
    const { GET } = await import("./route")
    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ id: "c1" }),
    })
    expect(res.status).toBe(401)
    expect(mockGetMessages).not.toHaveBeenCalled()
  })

  it("returns messages ordered payload", async () => {
    mockGetMessages.mockResolvedValueOnce([
      {
        id: "m1",
        role: "user",
        content: "hello",
        created_at: "2026-05-04T01:02:03.000Z",
      },
    ])
    const { GET } = await import("./route")
    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ id: "c1" }),
    })
    expect(res.status).toBe(200)
    const json = (await res.json()) as {
      messages: Array<{ id: string; role: string; content: string; createdAt?: string }>
    }
    expect(json.messages).toHaveLength(1)
    expect(json.messages[0]).toMatchObject({ id: "m1", role: "user", content: "hello" })
    expect(mockGetMessages).toHaveBeenCalledWith(expect.anything(), "user-1", "c1")
  })
})
