import {
  buildDevelopFavoriteSearchString,
  parseDevelopFavoriteSearchParams,
} from "@/lib/favorite-develop-query"
import type { DevelopmentFavoriteSnapshot } from "@/types/favorite"

describe("favorite-develop-query", () => {
  const sample: DevelopmentFavoriteSnapshot = {
    filmName: "HP5 Plus",
    filmFormat: "35mm",
    filmIso: "400",
    developerName: "Rodinal",
    optionKey: "1+25|20",
    pushPullStops: 0,
    totalVolume: 500,
    temperatureUnit: "celsius",
    modifiedTemperature: 20.5,
    constantAgitation: false,
  }

  it("round-trips URL params", () => {
    const qs = buildDevelopFavoriteSearchString(sample)
    const parsed = parseDevelopFavoriteSearchParams(new URLSearchParams(qs))
    expect(parsed).toEqual(sample)
  })

  it("returns null when params are incomplete", () => {
    expect(parseDevelopFavoriteSearchParams(new URLSearchParams("film=HP5"))).toBeNull()
  })

  it("returns null for invalid format", () => {
    const p = new URLSearchParams(buildDevelopFavoriteSearchString(sample))
    p.set("format", "bogus")
    expect(parseDevelopFavoriteSearchParams(p)).toBeNull()
  })
})
