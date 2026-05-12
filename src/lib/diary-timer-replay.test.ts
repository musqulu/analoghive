import type { DevelopmentLogEntryRow, DevelopmentProcessSnapshot } from "@/types/development-log"
import { encodeSnapshotForReplayUrl, parseReplayParam } from "@/lib/diary-replay-encoding"
import {
  buildDiaryTimerReplayHref,
  decodeDiaryReplayParam,
  modifiedTemperatureNumeric,
} from "@/lib/diary-timer-replay"
import { parseDevelopmentProcessSnapshot } from "@/lib/process-snapshot"

const sampleSnapshot: DevelopmentProcessSnapshot = {
  v: 1,
  developmentTimeMinutes: 11,
  developerDilution: "1+50",
  processTimes: { preSoak: 2, dev: 11, stop: 1, fix: 5, wash: 8 },
  washingMethod: {
    type: "running",
    runningWaterTime: 8,
    ilfordInversions: { first: 5, second: 10, third: 20 },
    custom: { totalTime: 5, waterChanges: 3 },
  },
  temperatures: { dev: 21, stop: 20, fix: 20, wash: 20 },
  temperatureUnit: "celsius",
  totalVolume: 575,
  isColor: false,
}

function baseEntry(overrides: Partial<DevelopmentLogEntryRow> = {}): DevelopmentLogEntryRow {
  return {
    id: "e1",
    user_id: "u",
    film_name: "HP5 Plus",
    film_format: "35mm",
    film_iso: "400",
    developer_name: "Rodinal",
    option_key: "1+50|20",
    total_volume: 500,
    temperature_unit: "celsius",
    modified_temperature: "20",
    push_pull_stops: 1,
    recipe_id: "r1",
    favorite_id: null,
    title: null,
    notes: null,
    process_snapshot: null,
    created_at: "2026-01-01",
    ...overrides,
  }
}

describe("encodeSnapshotForReplayUrl / parseReplayParam", () => {
  it("round-trips JSON through base64url", () => {
    const enc = encodeSnapshotForReplayUrl(sampleSnapshot)
    const raw = parseReplayParam(enc)
    expect(parseDevelopmentProcessSnapshot(raw)).toEqual(sampleSnapshot)
  })
})

describe("decodeDiaryReplayParam", () => {
  it("returns null for malformed input", () => {
    expect(decodeDiaryReplayParam(null)).toBeNull()
    expect(decodeDiaryReplayParam("")).toBeNull()
    expect(decodeDiaryReplayParam("not-valid-base64!!!")).toBeNull()
  })
})

describe("buildDiaryTimerReplayHref", () => {
  it("omits replay when there is no valid snapshot", () => {
    const href = buildDiaryTimerReplayHref(baseEntry())
    expect(href).toContain("/develop/timer?")
    expect(href).not.toContain("replay=")
    expect(href).toContain("time=10")
    expect(href).toContain("temp=20")
    expect(href).toContain("volume=500")
    expect(href).toContain("recipeId=r1")
  })

  it("includes replay and snapshot-derived scalars when snapshot exists", () => {
    const href = buildDiaryTimerReplayHref(baseEntry({ process_snapshot: sampleSnapshot }))
    expect(href).toContain("replay=")
    expect(href).toContain("time=11")
    expect(href).toContain("temp=21")
    expect(href).toContain("volume=575")
    const u = new URL(href, "https://example.com")
    expect(decodeDiaryReplayParam(u.searchParams.get("replay"))).toEqual(sampleSnapshot)
  })
})

describe("modifiedTemperatureNumeric", () => {
  it("parses string temps", () => {
    expect(
      modifiedTemperatureNumeric(baseEntry({ modified_temperature: "22.5", process_snapshot: null })),
    ).toBe(22.5)
    expect(modifiedTemperatureNumeric(baseEntry({ modified_temperature: null }))).toBeNull()
  })
})
