import type { DevelopmentProcessSnapshot } from "@/types/development-log"
import {
  buildTimerHydrationFromQueryAndReplay,
  parseFiniteFloatParam,
  parseFiniteIntParam,
} from "@/lib/timer-route-hydration"

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

describe("timer route hydration", () => {
  it("rejects NaN-ish query floats and ints via fallbacks", () => {
    expect(parseFiniteFloatParam("oops", 10)).toBe(10)
    expect(parseFiniteFloatParam("", 12)).toBe(12)
    expect(parseFiniteIntParam("nope", 500)).toBe(500)
  })

  it("parses sane query scalars without replay", () => {
    const q = buildTimerHydrationFromQueryAndReplay(
      {
        time: "7.5",
        temp: "19",
        volume: "600",
        dilution: " 1:25 ",
        tempUnit: "fahrenheit",
      },
      null,
    )
    expect(q).toEqual({
      developmentTimeMinutes: 7.5,
      temperature: 19,
      totalVolume: 600,
      developerDilution: "1:25",
      tempUnitParam: "fahrenheit",
    })
  })

  it("uses replay snapshot scalars ahead of spoofed URL values", () => {
    const h = buildTimerHydrationFromQueryAndReplay(
      {
        time: "99",
        temp: "5",
        volume: "1",
        dilution: "garbage",
        tempUnit: "fahrenheit",
      },
      sampleSnapshot,
    )
    expect(h.developmentTimeMinutes).toBe(11)
    expect(h.temperature).toBe(21)
    expect(h.totalVolume).toBe(575)
    expect(h.developerDilution).toBe("1+50")
    expect(h.tempUnitParam).toBe("celsius")
  })

  it("falls back volume from query only when replay has null tank volume", () => {
    const snap: DevelopmentProcessSnapshot = { ...sampleSnapshot, totalVolume: null }
    const h = buildTimerHydrationFromQueryAndReplay(
      { time: "10", temp: "20", volume: "333", dilution: "x", tempUnit: null },
      snap,
    )
    expect(h.developmentTimeMinutes).toBe(11)
    expect(h.totalVolume).toBe(333)
  })
})
