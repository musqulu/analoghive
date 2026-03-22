import {
  clampPushPullStops,
  getFactorForStops,
  getPushPullAdjustedDevelopmentTime,
} from "./push-pull-adjusted-development-time"

describe("clampPushPullStops", () => {
  it("clamps to [-2, +2]", () => {
    expect(clampPushPullStops(3)).toBe(2)
    expect(clampPushPullStops(-2.5)).toBe(-2)
    expect(clampPushPullStops(0.5)).toBe(0.5)
  })
})

describe("getFactorForStops", () => {
  it("returns default anchor factors at integer stops", () => {
    expect(getFactorForStops(-2)).toBeCloseTo(0.7, 5)
    expect(getFactorForStops(-1)).toBeCloseTo(0.85, 5)
    expect(getFactorForStops(0)).toBeCloseTo(1.0, 5)
    expect(getFactorForStops(1)).toBeCloseTo(1.25, 5)
    expect(getFactorForStops(2)).toBeCloseTo(1.5, 5)
  })

  it("interpolates factor for fractional stops", () => {
    expect(getFactorForStops(0.5)).toBeCloseTo(1.125, 5)
    expect(getFactorForStops(-1.5)).toBeCloseTo(0.775, 5)
  })
})

describe("getPushPullAdjustedDevelopmentTime", () => {
  const base = 10

  it("applies anchor factors to base time (10 min)", () => {
    expect(getPushPullAdjustedDevelopmentTime(base, 0).adjustedMinutes).toBe(10)
    expect(getPushPullAdjustedDevelopmentTime(base, 0).factor).toBe(1)

    expect(getPushPullAdjustedDevelopmentTime(base, 1).adjustedMinutes).toBe(12.5)
    expect(getPushPullAdjustedDevelopmentTime(base, 2).adjustedMinutes).toBe(15)

    expect(getPushPullAdjustedDevelopmentTime(base, -1).adjustedMinutes).toBe(8.5)
    expect(getPushPullAdjustedDevelopmentTime(base, -2).adjustedMinutes).toBe(7)
  })

  it("rounds adjusted time to two decimal places", () => {
    const r = getPushPullAdjustedDevelopmentTime(9.5, 1)
    expect(r.adjustedMinutes).toBe(11.88)
    expect(r.deltaMinutes).toBe(2.38)
  })

  it("uses clamped stops for factor when request exceeds ±2", () => {
    const r = getPushPullAdjustedDevelopmentTime(base, 3)
    expect(r.stopsRequested).toBe(3)
    expect(r.stopsApplied).toBe(2)
    expect(r.factor).toBe(1.5)
    expect(r.adjustedMinutes).toBe(15)
  })

  it("fractional +0.5 uses factor 1.125", () => {
    const r = getPushPullAdjustedDevelopmentTime(10, 0.5)
    expect(r.factor).toBeCloseTo(1.125, 5)
    expect(r.adjustedMinutes).toBe(11.25)
  })

  it("explanation mentions increase, delta, and disclaimer for push", () => {
    const r = getPushPullAdjustedDevelopmentTime(9.5, 1)
    expect(r.explanation).toMatch(/increased/)
    expect(r.explanation).toMatch(/2\.38/)
    expect(r.explanation).toMatch(/11\.88/)
    expect(r.explanation).toMatch(/approximate/i)
  })

  it("explanation mentions decrease for pull", () => {
    const r = getPushPullAdjustedDevelopmentTime(11, -1)
    expect(r.explanation).toMatch(/decreased/)
    expect(r.explanation).toMatch(/9\.35/)
  })

  it("no push/pull explanation when stops are 0", () => {
    const r = getPushPullAdjustedDevelopmentTime(8, 0)
    expect(r.direction).toBe("none")
    expect(r.explanation).toMatch(/No push or pull/)
    expect(r.explanation).toMatch(/8\.00/)
  })

  it("accepts optional PushPullHeuristicProfile override", () => {
    const custom = {
      anchors: [
        { stops: -2, factor: 0.5 },
        { stops: 0, factor: 1 },
        { stops: 2, factor: 2 },
      ],
    } as const
    const r = getPushPullAdjustedDevelopmentTime(10, 1, { profile: custom })
    expect(r.factor).toBe(1.5)
    expect(r.adjustedMinutes).toBe(15)
  })
})
