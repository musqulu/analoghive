import { ensureFrozenDiarySessionLogContext } from "@/lib/diary-session-log-context"
import type { DevelopmentProcessSnapshot } from "@/types/development-log"

const processSnapshot = (devMinutes: number): DevelopmentProcessSnapshot => ({
  v: 1,
  developmentTimeMinutes: devMinutes,
  developerDilution: "1+1",
  temperatureUnit: "celsius",
  totalVolume: 500,
  isColor: false,
  processTimes: { dev: devMinutes, stop: 1, fix: 5, wash: 5 },
  washingMethod: { type: "running", runningWaterTime: 5 },
  temperatures: { dev: 20, stop: 20, fix: 20, wash: 20 },
})

describe("ensureFrozenDiarySessionLogContext", () => {
  it("freezes calculator metadata and process snapshot on first dev complete", () => {
    const store = new Map()
    const calcA = { filmName: "HP5" }
    const snapA = processSnapshot(8)

    const ctx = ensureFrozenDiarySessionLogContext(store, "session:1", snapA, calcA)

    expect(ctx).toEqual({ calcSnapshot: calcA, processSnapshot: snapA })
    expect(store.get("session:1")).toEqual(ctx)
  })

  it("ignores later selection and process edits for the same session", () => {
    const store = new Map()
    const calcA = { filmName: "HP5" }
    const calcB = { filmName: "Tri-X" }
    const snapA = processSnapshot(8)
    const snapB = processSnapshot(11)

    ensureFrozenDiarySessionLogContext(store, "session:1", snapA, calcA)
    const ctx = ensureFrozenDiarySessionLogContext(store, "session:1", snapB, calcB)

    expect(ctx).toEqual({ calcSnapshot: calcA, processSnapshot: snapA })
  })

  it("returns null when calculator metadata is unavailable", () => {
    const store = new Map()
    expect(
      ensureFrozenDiarySessionLogContext(store, "session:1", processSnapshot(8), null),
    ).toBeNull()
    expect(store.size).toBe(0)
  })
})
