import { createClient } from "@/lib/supabase/client"
import { updateDiaryEntry } from "./update-diary-entry"

const mockSingle = jest.fn()
const mockSelect = jest.fn()
const mockEq = jest.fn()
const mockUpdate = jest.fn()
const mockFrom = jest.fn()

jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn(() => ({
    from: mockFrom,
  })),
}))

describe("updateDiaryEntry", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, "warn").mockImplementation(() => undefined)
    mockSingle.mockResolvedValue({ data: { id: "entry-1" }, error: null })
    mockSelect.mockReturnValue({ single: mockSingle })
    mockEq.mockReturnValue({ select: mockSelect })
    mockUpdate.mockReturnValue({ eq: mockEq })
    mockFrom.mockReturnValue({ update: mockUpdate })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it("confirms the updated row id before reporting success", async () => {
    await expect(
      updateDiaryEntry({
        id: "entry-1",
        title: "  Test roll  ",
        notes: "   ",
      }),
    ).resolves.toBe(true)

    expect(createClient).toHaveBeenCalledTimes(1)
    expect(mockFrom).toHaveBeenCalledWith("development_log_entries")
    expect(mockUpdate).toHaveBeenCalledWith({
      title: "Test roll",
      notes: null,
    })
    expect(mockEq).toHaveBeenCalledWith("id", "entry-1")
    expect(mockSelect).toHaveBeenCalledWith("id")
    expect(mockSingle).toHaveBeenCalled()
  })

  it("returns false when no row is updated", async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: { message: "JSON object requested, multiple (or no) rows returned" },
    })

    await expect(
      updateDiaryEntry({
        id: "missing-entry",
        title: "Test roll",
        notes: "Saved notes",
      }),
    ).resolves.toBe(false)

    expect(console.warn).toHaveBeenCalledWith(
      "[diary] update failed:",
      "JSON object requested, multiple (or no) rows returned",
    )
  })
})
