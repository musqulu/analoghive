/**
 * @jest-environment node
 */
const mockGetUser = jest.fn<Promise<{ data: { user: { id: string } | null } }>, []>()
const mockDelete = jest.fn()

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(() =>
    Promise.resolve({
      auth: { getUser: mockGetUser },
    }),
  ),
}))

jest.mock("@/lib/ai/conversation-store", () => ({
  deleteConversation: (...args: unknown[]) => mockDelete(...args),
}))

describe("DELETE /api/chat/conversations/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } })
  })

  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })
    const { DELETE } = await import("./route")
    const res = await DELETE(new Request("http://localhost"), {
      params: Promise.resolve({ id: "c1" }),
    })
    expect(res.status).toBe(401)
    expect(mockDelete).not.toHaveBeenCalled()
  })

  it("returns 404 when nothing is deleted", async () => {
    mockDelete.mockResolvedValueOnce(false)
    const { DELETE } = await import("./route")
    const res = await DELETE(new Request("http://localhost"), {
      params: Promise.resolve({ id: "missing" }),
    })
    expect(res.status).toBe(404)
    expect(mockDelete).toHaveBeenCalledWith(expect.anything(), "user-1", "missing")
  })

  it("returns 204 when deleted", async () => {
    mockDelete.mockResolvedValueOnce(true)
    const { DELETE } = await import("./route")
    const res = await DELETE(new Request("http://localhost"), {
      params: Promise.resolve({ id: "c1" }),
    })
    expect(res.status).toBe(204)
  })
})
