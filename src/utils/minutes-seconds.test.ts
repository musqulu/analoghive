import {
  decimalMinutesToMinSec,
  formatMmSs,
  minSecToDecimalMinutes,
  parseMmSs,
} from "@/utils/minutes-seconds"

describe("minutes-seconds", () => {
  it("round-trips whole minutes", () => {
    expect(decimalMinutesToMinSec(8)).toEqual({ min: 8, sec: 0 })
    expect(minSecToDecimalMinutes(8, 0)).toBe(8)
  })

  it("splits fractional minutes to min + sec", () => {
    expect(decimalMinutesToMinSec(11.5)).toEqual({ min: 11, sec: 30 })
    expect(minSecToDecimalMinutes(11, 30)).toBeCloseTo(11.5, 10)
  })

  it("clamps seconds to 0–59", () => {
    expect(minSecToDecimalMinutes(0, 99)).toBe(0 + 59 / 60)
  })

  it("formats and parses MM:SS in one string", () => {
    expect(formatMmSs(11.5)).toBe("11:30")
    expect(parseMmSs("11:30")).toBeCloseTo(11.5, 10)
    expect(parseMmSs("8")).not.toBeNull()
    expect(parseMmSs("8")).toBeCloseTo(8, 10)
    expect(parseMmSs("8:0")).toBeCloseTo(8, 10)
    expect(parseMmSs("")).toBeNull()
  })
})
