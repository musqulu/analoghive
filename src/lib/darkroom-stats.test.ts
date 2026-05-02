import { getDarkroomStats } from "./darkroom-stats"
import { RECIPE_PAYLOAD_VERSION } from "@/types/recipe"

interface QueryShape {
  table: string
  select: string
  head: boolean
  filters: Array<{ kind: "eq" | "in"; column: string; value: unknown }>
}

interface MockResult {
  count?: number | null
  data?: unknown[] | null
}

/**
 * Builds a chainable Supabase mock that matches the helper's call sites:
 *   from(table).select(cols, opts?).eq(col, val).in(col, vals?)
 * Resolves to whatever `responder(query)` returns for that table+filters tuple.
 */
function makeSupabase(responder: (q: QueryShape) => MockResult) {
  return {
    from(table: string) {
      const query: QueryShape = { table, select: "", head: false, filters: [] }

      const builder = {
        select(cols: string, opts?: { count?: string; head?: boolean }) {
          query.select = cols
          query.head = Boolean(opts?.head)
          return this
        },
        eq(column: string, value: unknown) {
          query.filters.push({ kind: "eq", column, value })
          return this
        },
        in(column: string, value: unknown) {
          query.filters.push({ kind: "in", column, value })
          return this
        },
        then(onFulfilled: (v: MockResult) => unknown) {
          return Promise.resolve(responder(query)).then(onFulfilled)
        },
      }

      return builder
    },
  } as unknown as Parameters<typeof getDarkroomStats>[0]
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
  developerDilution: "",
  totalVolume: 500,
  temperatureUnit: "celsius" as const,
  modifiedTemperature: 20,
  constantAgitation: false,
  isColor: false,
  developmentTimeMinutes: 8,
  processTimes: { dev: 8, stop: 1, fix: 5, wash: 5 },
  washingMethod: {
    type: "running" as const,
    runningWaterTime: 5,
    ilfordInversions: { first: 5, second: 10, third: 20 },
    custom: { totalTime: 5, waterChanges: 3 },
  },
})

describe("getDarkroomStats", () => {
  it("returns zeros and nulls when the user has nothing yet", async () => {
    const supabase = makeSupabase(() => ({ count: 0, data: [] }))
    const stats = await getDarkroomStats(supabase, "user-1")
    expect(stats).toEqual({
      rollsDeveloped: 0,
      sheetsDeveloped: 0,
      customRecipes: 0,
      mostUsedDeveloper: null,
      mostUsedFilm: null,
    })
  })

  it("buckets log entries into rolls (35mm/120) and sheets", async () => {
    const supabase = makeSupabase((q) => {
      if (q.table === "development_log_entries" && q.head) {
        const inFilter = q.filters.find((f) => f.kind === "in")
        if (!inFilter) return { count: 0 }
        const formats = inFilter.value as string[]
        if (formats.includes("sheet")) return { count: 4 }
        return { count: 7 }
      }
      if (q.table === "development_recipes" && q.head) return { count: 2 }
      return { data: [] }
    })

    const stats = await getDarkroomStats(supabase, "user-1")
    expect(stats.rollsDeveloped).toBe(7)
    expect(stats.sheetsDeveloped).toBe(4)
    expect(stats.customRecipes).toBe(2)
  })

  it("picks the most-used film and developer from log + recipes + favorites combined", async () => {
    const supabase = makeSupabase((q) => {
      if (q.head) return { count: 0 }
      if (q.table === "development_log_entries") {
        return {
          data: [
            { film_name: "HP5+", developer_name: "HC-110" },
            { film_name: "HP5+", developer_name: "HC-110" },
            { film_name: "HP5+", developer_name: "Rodinal" },
            { film_name: "FP4+", developer_name: "Rodinal" },
          ],
        }
      }
      if (q.table === "development_favorites") {
        return {
          data: [
            { film_name: "FP4+", developer_name: "Rodinal" },
            { film_name: "Tri-X", developer_name: "HC-110" },
          ],
        }
      }
      if (q.table === "development_recipes") {
        return {
          data: [
            { payload: recipePayload("HP5+", "HC-110") },
            { payload: recipePayload("FP4+", "HC-110") },
          ],
        }
      }
      return { data: [] }
    })

    const stats = await getDarkroomStats(supabase, "user-1")
    expect(stats.mostUsedFilm).toBe("HP5+")
    expect(stats.mostUsedDeveloper).toBe("HC-110")
  })

  it("ignores blank names and skips unparseable recipe payloads", async () => {
    const supabase = makeSupabase((q) => {
      if (q.head) return { count: 0 }
      if (q.table === "development_log_entries") {
        return {
          data: [
            { film_name: "  ", developer_name: "" },
            { film_name: null, developer_name: null },
            { film_name: "Delta 100", developer_name: "Xtol" },
          ],
        }
      }
      if (q.table === "development_recipes") {
        return {
          data: [{ payload: { junk: true } }, { payload: null }],
        }
      }
      return { data: [] }
    })

    const stats = await getDarkroomStats(supabase, "user-1")
    expect(stats.mostUsedFilm).toBe("Delta 100")
    expect(stats.mostUsedDeveloper).toBe("Xtol")
  })

  it("breaks ties alphabetically (case-insensitive) for determinism", async () => {
    const supabase = makeSupabase((q) => {
      if (q.head) return { count: 0 }
      if (q.table === "development_log_entries") {
        return {
          data: [
            { film_name: "Tri-X", developer_name: "Rodinal" },
            { film_name: "FP4+", developer_name: "HC-110" },
          ],
        }
      }
      return { data: [] }
    })

    const stats = await getDarkroomStats(supabase, "user-1")
    expect(stats.mostUsedFilm).toBe("FP4+")
    expect(stats.mostUsedDeveloper).toBe("HC-110")
  })
})
