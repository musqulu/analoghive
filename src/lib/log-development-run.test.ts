import { createClient } from "@/lib/supabase/client"
import { logDevelopmentRun } from "./log-development-run"

const mockGetUser = jest.fn()
const mockInsert = jest.fn()
const mockFrom = jest.fn()

jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  })),
}))

const entry = {
  film_name: "HP5 Plus",
  film_format: "35mm" as const,
  film_iso: "400",
  developer_name: "Rodinal",
  option_key: "1+50|20",
  total_volume: 500,
  temperature_unit: "celsius" as const,
  modified_temperature: 20,
  push_pull_stops: 0,
  recipe_id: null,
  favorite_id: null,
}

describe("logDevelopmentRun", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, "warn").mockImplementation(() => undefined)
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    })
    mockInsert.mockResolvedValue({ error: null })
    mockFrom.mockReturnValue({ insert: mockInsert })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it("returns true after inserting the entry for the current user", async () => {
    await expect(logDevelopmentRun(entry)).resolves.toBe(true)

    expect(createClient).toHaveBeenCalledTimes(1)
    expect(mockFrom).toHaveBeenCalledWith("development_log_entries")
    expect(mockInsert).toHaveBeenCalledWith({ ...entry, user_id: "user-1" })
  })

  it("returns false without inserting when there is no current user", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: null,
    })

    await expect(logDevelopmentRun(entry)).resolves.toBe(false)

    expect(mockInsert).not.toHaveBeenCalled()
  })

  it("returns false when user lookup fails", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: "session expired" },
    })

    await expect(logDevelopmentRun(entry)).resolves.toBe(false)

    expect(mockInsert).not.toHaveBeenCalled()
    expect(console.warn).toHaveBeenCalledWith(
      "[darkroom-log] user lookup failed:",
      "session expired",
    )
  })

  it("returns false when the insert fails", async () => {
    mockInsert.mockResolvedValue({ error: { message: "violates row-level security" } })

    await expect(logDevelopmentRun(entry)).resolves.toBe(false)

    expect(console.warn).toHaveBeenCalledWith(
      "[darkroom-log] insert failed:",
      "violates row-level security",
    )
  })

  it("returns false when the insert throws", async () => {
    mockInsert.mockRejectedValue(new Error("network down"))

    await expect(logDevelopmentRun(entry)).resolves.toBe(false)

    expect(console.warn).toHaveBeenCalledWith(
      "[darkroom-log] insert failed:",
      "network down",
    )
  })
})
