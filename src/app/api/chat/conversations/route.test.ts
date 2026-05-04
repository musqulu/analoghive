/**
 * @jest-environment node
 */
const mockGetUser = jest.fn<Promise<{ data: { user: { id: string } | null } }>, []>()
const mockList = jest.fn()
const mockCreate = jest.fn()

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(() =>
    Promise.resolve({
      auth: { getUser: mockGetUser },
    }),
  ),
}))

jest.mock("@/lib/ai/conversation-store", () => ({
  listConversations: (...args: unknown[]) => mockList(...args),
  createConversation: (...args: unknown[]) => mockCreate(...args),
}))

describe("/api/chat/conversations", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } })
  })

  it("GET returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })
    const { GET } = await import("./route")
    const res = await GET()
    expect(res.status).toBe(401)
    expect(mockList).not.toHaveBeenCalled()
  })

  it("GET returns conversations for the signed-in user", async () => {
    mockList.mockResolvedValueOnce([
      {
        id: "c1",
        title: "HC-110",
        lastMessagePreview: "dilution B",
        updatedAt: "2026-05-01T12:00:00.000Z",
      },
    ])
    const { GET } = await import("./route")
    const res = await GET()
    expect(res.status).toBe(200)
    const json = (await res.json()) as {
      conversations: Array<{ id: string; title: string }>
    }
    expect(json.conversations).toHaveLength(1)
    expect(json.conversations[0]).toMatchObject({ id: "c1", title: "HC-110" })
    expect(mockList).toHaveBeenCalledWith(expect.anything(), "user-1")
  })

  it("POST returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })
    const { POST } = await import("./route")
    const res = await POST()
    expect(res.status).toBe(401)
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it("POST creates a conversation row", async () => {
    mockCreate.mockResolvedValueOnce({ id: "new-1", title: "New chat" })
    const { POST } = await import("./route")
    const res = await POST()
    expect(res.status).toBe(200)
    const json = (await res.json()) as { id: string; title: string }
    expect(json).toEqual({ id: "new-1", title: "New chat" })
    expect(mockCreate).toHaveBeenCalledWith(expect.anything(), "user-1")
  })
})
