import type { DevelopmentProcessSnapshot } from "@/types/development-log"
import { parseDevelopmentProcessSnapshot } from "@/lib/process-snapshot"

const validSnapshot: DevelopmentProcessSnapshot = {
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

describe("parseDevelopmentProcessSnapshot", () => {
  it("accepts a complete v1 snapshot", () => {
    expect(parseDevelopmentProcessSnapshot(validSnapshot)).toEqual(validSnapshot)
  })

  it("rejects malformed washing methods before they reach render paths", () => {
    expect(
      parseDevelopmentProcessSnapshot({
        ...validSnapshot,
        washingMethod: { type: "custom" },
      }),
    ).toBeNull()
    expect(
      parseDevelopmentProcessSnapshot({
        ...validSnapshot,
        washingMethod: {
          ...validSnapshot.washingMethod,
          type: "bogus",
        },
      }),
    ).toBeNull()
  })

  it("rejects incomplete timing and temperature objects", () => {
    expect(
      parseDevelopmentProcessSnapshot({
        ...validSnapshot,
        processTimes: { dev: 11, stop: 1, fix: 5 },
      }),
    ).toBeNull()
    expect(
      parseDevelopmentProcessSnapshot({
        ...validSnapshot,
        temperatures: { dev: 21, stop: 20, fix: 20 },
      }),
    ).toBeNull()
  })
})
