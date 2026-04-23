import { shouldShakeSpiralTank } from "./spiral-tank-agitation"
import type { Step } from "@/types/development"

describe("shouldShakeSpiralTank", () => {
  const noShakeSteps: Step[] = ["preSoak", "wash"]

  it.each(noShakeSteps)("returns false for %s regardless of elapsed", (step) => {
    expect(shouldShakeSpiralTank(step, 0, 120)).toBe(false)
    expect(shouldShakeSpiralTank(step, 30, 120)).toBe(false)
  })

  describe("dev and fix", () => {
    it.each(["dev", "fix"] as const)("%s: shakes for first 10s of step", (step) => {
      for (let e = 0; e < 10; e++) {
        expect(shouldShakeSpiralTank(step, e, 600)).toBe(true)
      }
      expect(shouldShakeSpiralTank(step, 10, 600)).toBe(false)
    })

    it.each(["dev", "fix"] as const)("%s: shakes at 1:00–1:09 elapsed", (step) => {
      expect(shouldShakeSpiralTank(step, 59, 600)).toBe(false)
      expect(shouldShakeSpiralTank(step, 60, 600)).toBe(true)
      expect(shouldShakeSpiralTank(step, 69, 600)).toBe(true)
      expect(shouldShakeSpiralTank(step, 70, 600)).toBe(false)
    })

    it.each(["dev", "fix"] as const)("%s: no shake at end of step", (step) => {
      expect(shouldShakeSpiralTank(step, 600, 600)).toBe(false)
    })

    it.each(["dev", "fix"] as const)("%s: short step only first window", (step) => {
      expect(shouldShakeSpiralTank(step, 0, 15)).toBe(true)
      expect(shouldShakeSpiralTank(step, 9, 15)).toBe(true)
      expect(shouldShakeSpiralTank(step, 10, 15)).toBe(false)
    })
  })

  describe("stop", () => {
    it("S <= 10: entire step", () => {
      expect(shouldShakeSpiralTank("stop", 0, 10)).toBe(true)
      expect(shouldShakeSpiralTank("stop", 9, 10)).toBe(true)
      expect(shouldShakeSpiralTank("stop", 10, 10)).toBe(false)
      expect(shouldShakeSpiralTank("stop", 0, 5)).toBe(true)
      expect(shouldShakeSpiralTank("stop", 4, 5)).toBe(true)
      expect(shouldShakeSpiralTank("stop", 5, 5)).toBe(false)
    })

    it("10 < S < 60: only first 10s", () => {
      expect(shouldShakeSpiralTank("stop", 0, 30)).toBe(true)
      expect(shouldShakeSpiralTank("stop", 9, 30)).toBe(true)
      expect(shouldShakeSpiralTank("stop", 10, 30)).toBe(false)
      expect(shouldShakeSpiralTank("stop", 29, 30)).toBe(false)
    })

    it("S >= 60: intermittent like dev", () => {
      expect(shouldShakeSpiralTank("stop", 0, 90)).toBe(true)
      expect(shouldShakeSpiralTank("stop", 9, 90)).toBe(true)
      expect(shouldShakeSpiralTank("stop", 10, 90)).toBe(false)
      expect(shouldShakeSpiralTank("stop", 60, 90)).toBe(true)
      expect(shouldShakeSpiralTank("stop", 69, 90)).toBe(true)
      expect(shouldShakeSpiralTank("stop", 70, 90)).toBe(false)
    })
  })

  it("floors fractional elapsed", () => {
    expect(shouldShakeSpiralTank("dev", 9.9, 600)).toBe(true)
    expect(shouldShakeSpiralTank("dev", 10.1, 600)).toBe(false)
  })
})
