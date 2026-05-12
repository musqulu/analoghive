import {
  DEVELOPER_MATCH_LIMIT,
  RECIPE_LIMIT,
  findRelevantDeveloperRows,
  loadUserContext,
  type CompactRecipe,
} from "@/lib/ai/context-loader"
import type { Developer } from "@/data/processed-developers"
import { RECIPE_PAYLOAD_VERSION } from "@/types/recipe"

interface QueryShape {
  table: string
  select: string
  filters: Array<{ kind: "eq"; column: string; value: unknown }>
  order: { column: string; ascending: boolean } | null
  limit: number | null
}

function makeSupabase(responder: (q: QueryShape) => { data?: unknown[] | null }) {
  return {
    from(table: string) {
      const query: QueryShape = {
        table,
        select: "",
        filters: [],
        order: null,
        limit: null,
      }
      const builder = {
        select(cols: string) {
          query.select = cols
          return builder
        },
        eq(column: string, value: unknown) {
          query.filters.push({ kind: "eq", column, value })
          return builder
        },
        order(column: string, opts?: { ascending?: boolean }) {
          query.order = { column, ascending: Boolean(opts?.ascending) }
          return builder
        },
        limit(n: number) {
          query.limit = n
          return builder
        },
        then(onFulfilled: (v: { data?: unknown[] | null }) => unknown) {
          return Promise.resolve(responder(query)).then(onFulfilled)
        },
      }
      return builder
    },
  } as unknown as Parameters<typeof loadUserContext>[0]
}

const recipePayload = (filmName: string, developerName: string) => ({
  v: RECIPE_PAYLOAD_VERSION,
  source: "manual" as const,
  identity: {
    filmName,
    filmFormat: "35mm" as const,
    filmIso: "400",
    developerName,
    optionKey: "",
    pushPullStops: 0,
  },
  developerDilution: "1+50",
  totalVolume: 500,
  temperatureUnit: "celsius" as const,
  modifiedTemperature: 20,
  constantAgitation: false,
  isColor: false,
  developmentTimeMinutes: 9,
  processTimes: { dev: 9, stop: 1, fix: 5, wash: 5 },
  washingMethod: {
    type: "running" as const,
    runningWaterTime: 5,
    ilfordInversions: { first: 5, second: 10, third: 20 },
    custom: { totalTime: 5, waterChanges: 3 },
  },
})

describe("loadUserContext", () => {
  it("returns empty arrays when the user has no rows yet", async () => {
    const supabase = makeSupabase(() => ({ data: [] }))
    const ctx = await loadUserContext(supabase, "user-1")
    expect(ctx).toEqual({ recipes: [], favorites: [], recentLogs: [] })
  })

  it("filters by user_id, orders desc, and applies a recipe cap", async () => {
    const seenQueries: QueryShape[] = []
    const supabase = makeSupabase((q) => {
      seenQueries.push(q)
      if (q.table === "development_recipes") {
        return {
          data: [
            {
              id: "r-1",
              title: "HP5 in HC-110",
              payload: recipePayload("HP5+", "HC-110"),
              created_at: "2026-01-01T00:00:00Z",
            },
          ],
        }
      }
      return { data: [] }
    })

    await loadUserContext(supabase, "user-42")

    const recipeQuery = seenQueries.find((q) => q.table === "development_recipes")!
    expect(recipeQuery.filters).toContainEqual({
      kind: "eq",
      column: "user_id",
      value: "user-42",
    })
    expect(recipeQuery.order).toEqual({ column: "updated_at", ascending: false })
    expect(recipeQuery.limit).toBe(RECIPE_LIMIT)

    const favQuery = seenQueries.find((q) => q.table === "development_favorites")!
    expect(favQuery.order?.ascending).toBe(false)
    expect(favQuery.limit).not.toBeNull()

    const logQuery = seenQueries.find((q) => q.table === "development_log_entries")!
    expect(logQuery.order?.ascending).toBe(false)
    expect(logQuery.limit).not.toBeNull()
  })

  it("projects recipes into the compact shape and skips invalid payloads", async () => {
    const supabase = makeSupabase((q) => {
      if (q.table === "development_recipes") {
        return {
          data: [
            {
              id: "r-1",
              title: "Good recipe",
              payload: recipePayload("HP5+", "Rodinal"),
              created_at: "2026-02-01T00:00:00Z",
            },
            {
              id: "r-2",
              title: "Legacy / unparseable",
              payload: { something: "else" },
              created_at: "2025-12-01T00:00:00Z",
            },
          ],
        }
      }
      return { data: [] }
    })

    const ctx = await loadUserContext(supabase, "user-1")
    expect(ctx.recipes).toHaveLength(1)
    expect(ctx.recipes[0]).toMatchObject({
      id: "r-1",
      title: "Good recipe",
      developerDilution: "1+50",
      developmentTimeMinutes: 9,
      isColor: false,
    })
    expect(ctx.recipes[0].identity.developerName).toBe("Rodinal")
  })

  it("maps favorites and logs to camelCase fields", async () => {
    const supabase = makeSupabase((q) => {
      if (q.table === "development_favorites") {
        return {
          data: [
            {
              id: "f-1",
              display_name: "Hot summer push",
              film_name: "Tri-X",
              film_format: "35mm",
              film_iso: "1600",
              developer_name: "HC-110",
              option_key: "1+31|20",
              push_pull_stops: 2,
              modified_temperature: 22,
              temperature_unit: "celsius",
              corrected_time_minutes: 11.5,
              created_at: "2026-03-01T00:00:00Z",
            },
          ],
        }
      }
      if (q.table === "development_log_entries") {
        return {
          data: [
            {
              id: "l-1",
              film_name: "Portra 400",
              film_format: "120",
              film_iso: "400",
              developer_name: "Cinestill Cs41",
              option_key: "stock|38",
              created_at: "2026-04-15T00:00:00Z",
            },
          ],
        }
      }
      return { data: [] }
    })

    const ctx = await loadUserContext(supabase, "user-1")
    expect(ctx.favorites).toEqual([
      {
        id: "f-1",
        displayName: "Hot summer push",
        filmName: "Tri-X",
        filmFormat: "35mm",
        filmIso: "1600",
        developerName: "HC-110",
        optionKey: "1+31|20",
        pushPullStops: 2,
        modifiedTemperature: 22,
        temperatureUnit: "celsius",
        correctedTimeMinutes: 11.5,
      },
    ])
    expect(ctx.recentLogs[0]).toEqual({
      id: "l-1",
      filmName: "Portra 400",
      filmFormat: "120",
      filmIso: "400",
      developerName: "Cinestill Cs41",
      optionKey: "stock|38",
      createdAt: "2026-04-15T00:00:00Z",
      title: null,
      notes: null,
      processCompact: null,
    })
  })
})

describe("findRelevantDeveloperRows", () => {
  const sample: Developer[] = [
    {
      id: "rodinal",
      name: "Rodinal",
      manufacturer: "Adox",
      type: "B&W",
      dilutions: {
        "1+50": { ratio: "1+50", temperature: 20, times: { 400: 13, 800: 18 } },
      },
    },
    {
      id: "hc110",
      name: "HC-110",
      manufacturer: "Kodak",
      type: "B&W",
      dilutions: {
        "B": { ratio: "1+31", temperature: 20, times: { 400: 7.5 } },
      },
    },
    {
      id: "xtol",
      name: "XTOL",
      manufacturer: "Kodak",
      type: "B&W",
      dilutions: {},
    },
  ]

  const noRecipes: CompactRecipe[] = []

  it("returns rows whose name appears in the message (case-insensitive)", () => {
    const rows = findRelevantDeveloperRows(
      "How long for HP5+ in rodinal at 20C?",
      noRecipes,
      sample,
    )
    expect(rows.map((r) => r.id)).toEqual(["rodinal"])
  })

  it("returns rows referenced via the user's recipes when message is generic", () => {
    const recipes: CompactRecipe[] = [
      {
        id: "r-1",
        title: "Standard XTOL",
        identity: {
          filmName: "HP5+",
          filmFormat: "35mm",
          filmIso: "400",
          developerName: "XTOL",
          optionKey: "",
          pushPullStops: 0,
        },
        developerDilution: "stock",
        developmentTimeMinutes: 8,
        modifiedTemperature: 20,
        temperatureUnit: "celsius",
        isColor: false,
        createdAt: "2026-01-01T00:00:00Z",
      },
    ]
    const rows = findRelevantDeveloperRows(
      "What's a good general routine for me?",
      recipes,
      sample,
    )
    expect(rows.map((r) => r.id)).toEqual(["xtol"])
  })

  it("returns [] when nothing matches (no full-chart dump)", () => {
    const rows = findRelevantDeveloperRows("Tell me about the weather.", noRecipes, sample)
    expect(rows).toEqual([])
  })

  it("returns [] for empty messages", () => {
    expect(findRelevantDeveloperRows("", noRecipes, sample)).toEqual([])
    expect(findRelevantDeveloperRows("   ", noRecipes, sample)).toEqual([])
  })

  it("caps results at DEVELOPER_MATCH_LIMIT", () => {
    const many: Developer[] = Array.from({ length: 12 }, (_, i) => ({
      id: `dev-${i}`,
      name: `Dev${i}`,
      manufacturer: "x",
      type: "B&W",
      dilutions: {},
    }))
    const message = many.map((d) => d.name).join(" ")
    const rows = findRelevantDeveloperRows(message, noRecipes, many)
    expect(rows).toHaveLength(DEVELOPER_MATCH_LIMIT)
  })

  it("compacts dilution entries to label/temperature/timesByIso", () => {
    const rows = findRelevantDeveloperRows("rodinal please", noRecipes, sample)
    expect(rows[0].dilutions).toEqual([
      {
        label: "1+50",
        temperatureC: 20,
        timesByIso: { "400": 13, "800": 18 },
      },
    ])
  })
})
