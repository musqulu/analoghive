import {
  buildRecipeNewHref,
  parseRecipeDraftFromSearchParams,
  RECIPE_DRAFT_PARAMS,
} from "@/lib/recipe-draft-query"
import type { DevelopmentFavoriteSnapshot } from "@/types/favorite"
import { createEmptyRecipePayload } from "@/types/recipe"

describe("recipe-draft-query", () => {
  const snapshot: DevelopmentFavoriteSnapshot & { correctedTimeMinutes: number } = {
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
    correctedTimeMinutes: 11.5,
  }

  it("round-trips chart fork params", () => {
    const href = buildRecipeNewHref(snapshot, {
      isColor: false,
      chartReferenceNote: "From chart",
      pushPullLine: "Pushed +1",
    })
    const u = new URL(href, "https://example.com")
    const parsed = parseRecipeDraftFromSearchParams(u.searchParams)
    expect(parsed).not.toBeNull()
    expect(parsed!.source).toBe("chart")
    expect(parsed!.identity.filmName).toBe(snapshot.filmName)
    expect(parsed!.developmentTimeMinutes).toBe(snapshot.correctedTimeMinutes)
    expect(parsed!.chartReferenceNote).toBe("From chart")
    expect(parsed!.pushPullLine).toBe("Pushed +1")
    expect(parsed!.processTimes.stop).toBe(1)
    expect(parsed!.processTimes.fix).toBe(5)
  })

  it("returns null for empty params (manual new recipe)", () => {
    expect(parseRecipeDraftFromSearchParams(new URLSearchParams())).toBeNull()
  })

  it("returns null when chart base params incomplete", () => {
    const p = new URLSearchParams()
    p.set(RECIPE_DRAFT_PARAMS.cdev, "10")
    expect(parseRecipeDraftFromSearchParams(p)).toBeNull()
  })

  it("returns null for invalid cdev", () => {
    const u = new URL(
      buildRecipeNewHref(snapshot, { isColor: false }),
      "https://example.com",
    )
    u.searchParams.set(RECIPE_DRAFT_PARAMS.cdev, "not-a-number")
    expect(parseRecipeDraftFromSearchParams(u.searchParams)).toBeNull()
  })

  it("color flag sets isColor on payload", () => {
    const href = buildRecipeNewHref(snapshot, { isColor: true })
    const u = new URL(href, "https://example.com")
    const parsed = parseRecipeDraftFromSearchParams(u.searchParams)
    expect(parsed!.isColor).toBe(true)
    expect(parsed!.processTimes.fix).toBe(2)
  })

  it("matches createEmptyRecipePayload for blank manual draft shape", () => {
    const empty = createEmptyRecipePayload(false)
    expect(empty.source).toBe("manual")
    expect(empty.v).toBe(1)
  })
})
