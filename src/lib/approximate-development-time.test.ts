import { resolveTimeFromRows } from "./approximate-development-time"
import type { DevelopmentTime } from "@/data/processed-development-times"

describe("resolveTimeFromRows", () => {
  const rows: DevelopmentTime[] = [
    {
      filmId: "a",
      developerId: "b",
      dilution: "1+50",
      iso: 400,
      time: 10,
      temperature: 20,
      format: "35mm",
    },
    {
      filmId: "a",
      developerId: "b",
      dilution: "1+50",
      iso: 800,
      time: 14,
      temperature: 20,
      format: "35mm",
    },
  ]

  it("returns exact match", () => {
    const r = resolveTimeFromRows(rows, 400)
    expect(r.source).toBe("exact")
    expect(r.time).toBe(10)
  })

  it("interpolates between ISOs", () => {
    const r = resolveTimeFromRows(rows, 600)
    expect(r.source).toBe("interpolated")
    expect(r.time).toBe(12)
  })
})
