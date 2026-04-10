import {
  getPresets,
  savePreset,
  deletePreset,
  getCustomTimes,
  saveCustomTime,
  deleteCustomTime,
} from "./storage"
import type { Preset, CustomDevelopmentTime } from "@/types/development"

const PRESETS_KEY = "fdc:presets"

function makePreset(overrides?: Partial<Preset>): Preset {
  return {
    id: "p1",
    label: "Test Preset",
    filmName: "HP5",
    filmFormat: "35mm",
    filmIso: "400",
    developerName: "Rodinal",
    developerDilution: "1+50",
    totalVolume: 500,
    temperatureUnit: "celsius",
    modifiedTemperature: 20,
    correctedTime: 10,
    constantAgitation: false,
    processTimes: { dev: 10, stop: 1, fix: 5, wash: 5 },
    washingMethod: {
      type: "running",
      runningWaterTime: 5,
      ilfordInversions: { first: 5, second: 10, third: 20 },
      custom: { totalTime: 5, waterChanges: 3 },
    },
    createdAt: Date.now(),
    ...overrides,
  }
}

function makeCustomTime(overrides?: Partial<CustomDevelopmentTime>): CustomDevelopmentTime {
  return {
    id: "c1",
    label: "Custom",
    filmName: "HP5",
    developerName: "Rodinal",
    dilution: "1+50",
    iso: 400,
    time: 10,
    temperature: 20,
    format: "35mm",
    source: "custom",
    createdAt: Date.now(),
    ...overrides,
  }
}

beforeEach(() => {
  localStorage.clear()
})

describe("readJSON / getPresets", () => {
  it("returns empty array when key is missing", () => {
    expect(getPresets()).toEqual([])
  })

  it("returns empty array on invalid JSON", () => {
    localStorage.setItem(PRESETS_KEY, "not json")
    expect(getPresets()).toEqual([])
  })

  it("returns parsed data", () => {
    const p = makePreset()
    localStorage.setItem(PRESETS_KEY, JSON.stringify([p]))
    expect(getPresets()).toEqual([p])
  })
})

describe("savePreset / deletePreset round-trip", () => {
  it("saves and retrieves a preset", () => {
    const p = makePreset()
    savePreset(p)
    expect(getPresets()).toEqual([p])
  })

  it("updates an existing preset by id", () => {
    const p = makePreset()
    savePreset(p)
    const updated = { ...p, label: "Updated" }
    savePreset(updated)
    const stored = getPresets()
    expect(stored).toHaveLength(1)
    expect(stored[0].label).toBe("Updated")
  })

  it("deletes a preset by id", () => {
    savePreset(makePreset({ id: "a" }))
    savePreset(makePreset({ id: "b" }))
    deletePreset("a")
    const remaining = getPresets()
    expect(remaining).toHaveLength(1)
    expect(remaining[0].id).toBe("b")
  })
})

describe("saveCustomTime / getCustomTimes / deleteCustomTime", () => {
  it("round-trips custom times", () => {
    const ct = makeCustomTime()
    saveCustomTime(ct)
    expect(getCustomTimes()).toEqual([ct])
  })

  it("updates existing custom time by id", () => {
    const ct = makeCustomTime()
    saveCustomTime(ct)
    const updated = { ...ct, label: "Changed" }
    saveCustomTime(updated)
    expect(getCustomTimes()).toHaveLength(1)
    expect(getCustomTimes()[0].label).toBe("Changed")
  })

  it("deletes custom time by id", () => {
    saveCustomTime(makeCustomTime({ id: "x" }))
    saveCustomTime(makeCustomTime({ id: "y" }))
    deleteCustomTime("x")
    expect(getCustomTimes()).toHaveLength(1)
    expect(getCustomTimes()[0].id).toBe("y")
  })
})

describe("writeJSON error handling", () => {
  it("does not throw on QuotaExceededError", () => {
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = () => {
      throw new DOMException("quota exceeded", "QuotaExceededError")
    }
    expect(() => savePreset(makePreset())).not.toThrow()
    Storage.prototype.setItem = original
  })
})
