import { resolveFavoriteOptionKey } from "@/lib/favorite-restore"
import type { DevelopmentFavoriteSnapshot } from "@/types/favorite"
import type { DevelopmentOption } from "@/types/development"

const snapshot = (optionKey: string): DevelopmentFavoriteSnapshot => ({
  filmName: "HP5",
  filmFormat: "35mm",
  filmIso: "400",
  developerName: "Rodinal",
  optionKey,
  pushPullStops: 0,
  totalVolume: 500,
  temperatureUnit: "celsius",
  modifiedTemperature: 20,
  constantAgitation: false,
})

const opt = (key: string, dilution: string): DevelopmentOption => ({
  optionKey: key,
  dilution,
  time: 8,
  temperature: 20,
})

describe("resolveFavoriteOptionKey", () => {
  it("returns the snapshot key when present in the option list", () => {
    const snap = snapshot("1+25|20")
    const list: DevelopmentOption[] = [opt("1+50|20", "1+50"), opt("1+25|20", "1+25")]
    expect(resolveFavoriteOptionKey(snap, list)).toBe("1+25|20")
  })

  it("returns the key for a single color-style option", () => {
    const snap = snapshot("1+0|38")
    const single = opt("1+0|38", "1+0")
    expect(resolveFavoriteOptionKey(snap, single)).toBe("1+0|38")
  })

  it("returns null when the saved key is not in the list", () => {
    const snap = snapshot("missing|20")
    expect(resolveFavoriteOptionKey(snap, [opt("1+25|20", "1+25")])).toBeNull()
  })

  it("returns null when developmentInfo is null", () => {
    expect(resolveFavoriteOptionKey(snapshot("1+25|20"), null)).toBeNull()
  })

  it("maps legacy HC-110 single-letter optionKey to explicit dilution when present", () => {
    const snap: DevelopmentFavoriteSnapshot = {
      ...snapshot("B|20"),
      developerName: "HC-110",
    }
    const list: DevelopmentOption[] = [
      opt("B 1+31|20", "B 1+31"),
    ]
    expect(resolveFavoriteOptionKey(snap, list)).toBe("B 1+31|20")
  })

  it("does not map legacy letter key for non–HC-110 developer", () => {
    const snap = snapshot("B|20")
    expect(
      resolveFavoriteOptionKey(snap, [opt("B 1+31|20", "B 1+31")]),
    ).toBeNull()
  })
})
