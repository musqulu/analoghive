import { createClient } from "@/lib/supabase/client"
import { logDevelopmentRun } from "./log-development-run"
import type { DevelopmentProcessSnapshot } from "@/types/development-log"

const mockGetUser = jest.fn()
const mockSingle = jest.fn()
const mockSelect = jest.fn()
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

const processSnapshot: DevelopmentProcessSnapshot = {
  v: 1,
  developmentTimeMinutes: 8,
  developerDilution: "1+50",
  processTimes: { dev: 8, stop: 1, fix: 5, wash: 5 },
  washingMethod: {
    type: "running",
    runningWaterTime: 5,
    ilfordInversions: { first: 5, second: 10, third: 20 },
    custom: { totalTime: 5, waterChanges: 3 },
  },
  temperatures: { dev: 20, stop: 20, fix: 20, wash: 20 },
  temperatureUnit: "celsius",
  totalVolume: 500,
  isColor: false,
}

const baseEntry = {
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

const entryWithSnapshot = {
  ...baseEntry,
  process_snapshot: processSnapshot,
}

describe("logDevelopmentRun", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, "warn").mockImplementation(() => undefined)
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    })
    mockSingle.mockResolvedValue({ data: { id: "new-log-id" }, error: null })
    mockSelect.mockReturnValue({ single: mockSingle })
    mockInsert.mockReturnValue({ select: mockSelect })
    mockFrom.mockReturnValue({ insert: mockInsert })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it("returns the new row id after inserting for the current user", async () => {
    await expect(logDevelopmentRun(baseEntry)).resolves.toEqual({ id: "new-log-id" })

    expect(createClient).toHaveBeenCalledTimes(1)
    expect(mockFrom).toHaveBeenCalledWith("development_log_entries")
    expect(mockInsert).toHaveBeenCalledWith({ ...baseEntry, user_id: "user-1" })
    expect(mockSelect).toHaveBeenCalledWith("id")
    expect(mockSingle).toHaveBeenCalled()
  })

  it("forwards process_snapshot to the insert payload when provided", async () => {
    await expect(logDevelopmentRun(entryWithSnapshot)).resolves.toEqual({ id: "new-log-id" })
    expect(mockInsert).toHaveBeenCalledWith({ ...entryWithSnapshot, user_id: "user-1" })
  })

  it("returns null without inserting when there is no current user", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: null,
    })

    await expect(logDevelopmentRun(baseEntry)).resolves.toBeNull()

    expect(mockInsert).not.toHaveBeenCalled()
  })

  it("returns null when user lookup fails", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: "session expired" },
    })

    await expect(logDevelopmentRun(baseEntry)).resolves.toBeNull()

    expect(mockInsert).not.toHaveBeenCalled()
    expect(console.warn).toHaveBeenCalledWith(
      "[darkroom-log] user lookup failed:",
      "session expired",
    )
  })

  it("returns null when the insert fails", async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: "violates row-level security" } })

    await expect(logDevelopmentRun(baseEntry)).resolves.toBeNull()

    expect(console.warn).toHaveBeenCalledWith(
      "[darkroom-log] insert failed:",
      "violates row-level security",
    )
  })

  it("returns null when the insert throws", async () => {
    mockSingle.mockRejectedValue(new Error("network down"))

    await expect(logDevelopmentRun(baseEntry)).resolves.toBeNull()

    expect(console.warn).toHaveBeenCalledWith(
      "[darkroom-log] insert failed:",
      "network down",
    )
  })
})
