import type {
  CompactDeveloperRow,
  CompactFavorite,
  CompactLogEntry,
  CompactRecipe,
  UserChatContext,
} from "@/lib/ai/context-loader"
import {
  ASSISTANT_PERSONA_MARKER,
  buildSystemPrompt,
} from "@/lib/ai/system-prompt"

const emptyContext: UserChatContext = { recipes: [], favorites: [], recentLogs: [] }

const recipe: CompactRecipe = {
  id: "r-1",
  title: "HP5 in HC-110 dilution B",
  identity: {
    filmName: "HP5+",
    filmFormat: "35mm",
    filmIso: "400",
    developerName: "HC-110",
    optionKey: "B|20",
    pushPullStops: 0,
  },
  developerDilution: "1+31",
  developmentTimeMinutes: 7.5,
  modifiedTemperature: 20,
  temperatureUnit: "celsius",
  isColor: false,
  createdAt: "2026-01-01T00:00:00Z",
}

const favorite: CompactFavorite = {
  id: "f-1",
  displayName: "Push Tri-X to 1600",
  filmName: "Tri-X",
  filmFormat: "35mm",
  filmIso: "1600",
  developerName: "HC-110",
  optionKey: "B|22",
  pushPullStops: 2,
  modifiedTemperature: 22,
  temperatureUnit: "celsius",
  correctedTimeMinutes: 11.5,
}

const log: CompactLogEntry = {
  id: "l-1",
  filmName: "FP4+",
  filmFormat: "120",
  filmIso: "125",
  developerName: "Rodinal",
  optionKey: "1+50|20",
  createdAt: "2026-04-12T18:30:00Z",
}

const row: CompactDeveloperRow = {
  id: "rodinal",
  name: "Rodinal",
  manufacturer: "Adox",
  type: "B&W",
  dilutions: [
    { label: "1+50", temperatureC: 20, timesByIso: { "400": 13 } },
  ],
}

describe("buildSystemPrompt", () => {
  it("includes the persona marker so the route can assert against it", () => {
    const prompt = buildSystemPrompt({ context: emptyContext, developerRows: [] })
    expect(prompt).toContain(ASSISTANT_PERSONA_MARKER)
  })

  it("renders empty placeholders when the user has no data yet", () => {
    const prompt = buildSystemPrompt({ context: emptyContext, developerRows: [] })
    expect(prompt).toContain("(no saved recipes yet)")
    expect(prompt).toContain("(no favorites yet)")
    expect(prompt).toContain("(no development logs yet)")
    expect(prompt).toContain("(no chart rows matched the current message)")
  })

  it("formats recipes, favorites, and logs into their tagged sections", () => {
    const prompt = buildSystemPrompt({
      context: { recipes: [recipe], favorites: [favorite], recentLogs: [log] },
      developerRows: [],
    })
    expect(prompt).toContain("<user-recipes>")
    expect(prompt).toContain("HP5+ @ ISO 400 (35mm)")
    expect(prompt).toContain("HC-110 1+31")
    expect(prompt).toContain("7.5 min @ 20°C")

    expect(prompt).toContain("<user-favorites>")
    expect(prompt).toContain('"Push Tri-X to 1600"')
    expect(prompt).toContain("push/pull +2")

    expect(prompt).toContain("<user-recent-logs>")
    expect(prompt).toContain("2026-04-12: FP4+")
  })

  it("formats developer rows with dilution + temperature + per-ISO times", () => {
    const prompt = buildSystemPrompt({ context: emptyContext, developerRows: [row] })
    expect(prompt).toContain("<developer-data>")
    expect(prompt).toContain("Rodinal (Adox, B&W)")
    expect(prompt).toContain("1+50 @ 20°C — ISO 400: 13 min")
  })

  it("contains the DB-first time guidance instruction verbatim", () => {
    const prompt = buildSystemPrompt({ context: emptyContext, developerRows: [] })
    expect(prompt).toContain("First check the <developer-data> block")
    expect(prompt).toContain(
      "I don't have authoritative data for that exact combination in the chart.",
    )
  })

  it("instructs the model to never give a bare time without temperature + dilution", () => {
    const prompt = buildSystemPrompt({ context: emptyContext, developerRows: [] })
    expect(prompt).toContain('A bare "8 minutes" is never useful by itself.')
  })
})
