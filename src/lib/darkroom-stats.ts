import type { SupabaseClient } from "@supabase/supabase-js"
import { ROLL_FORMATS, SHEET_FORMATS } from "@/types/development-log"
import { parseRecipePayload } from "@/types/recipe"

export interface DarkroomStats {
  rollsDeveloped: number
  sheetsDeveloped: number
  customRecipes: number
  mostUsedDeveloper: string | null
  mostUsedFilm: string | null
}

/**
 * Aggregates the dashboard's "Darkroom log" metrics for `userId`. Counts come from
 * `development_log_entries` (filtered by film_format) and `development_recipes`,
 * while "most used" film/developer is computed in JS by combining names from the
 * log, recipes, and favorites — each entry weighted equally.
 *
 * Names are compared after `trim()`; empty strings are ignored. Ties resolve
 * alphabetically (case-insensitive) so the result is deterministic.
 */
export async function getDarkroomStats(
  supabase: SupabaseClient,
  userId: string,
): Promise<DarkroomStats> {
  const [rollsRes, sheetsRes, recipeCountRes, logRowsRes, recipeRowsRes, favoriteRowsRes] =
    await Promise.all([
      supabase
        .from("development_log_entries")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .in("film_format", ROLL_FORMATS as unknown as string[]),
      supabase
        .from("development_log_entries")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .in("film_format", SHEET_FORMATS as unknown as string[]),
      supabase
        .from("development_recipes")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId),
      supabase
        .from("development_log_entries")
        .select("film_name, developer_name")
        .eq("user_id", userId),
      supabase
        .from("development_recipes")
        .select("payload")
        .eq("user_id", userId),
      supabase
        .from("development_favorites")
        .select("film_name, developer_name")
        .eq("user_id", userId),
    ])

  const filmCounts = new Map<string, number>()
  const developerCounts = new Map<string, number>()

  const tally = (
    rows: Array<{ film_name?: string | null; developer_name?: string | null }> | null,
  ) => {
    if (!rows) return
    for (const row of rows) {
      bump(filmCounts, row.film_name)
      bump(developerCounts, row.developer_name)
    }
  }

  tally(logRowsRes.data ?? null)
  tally(favoriteRowsRes.data ?? null)

  for (const row of recipeRowsRes.data ?? []) {
    const payload = parseRecipePayload((row as { payload: unknown }).payload)
    if (!payload) continue
    bump(filmCounts, payload.identity.filmName)
    bump(developerCounts, payload.identity.developerName)
  }

  return {
    rollsDeveloped: rollsRes.count ?? 0,
    sheetsDeveloped: sheetsRes.count ?? 0,
    customRecipes: recipeCountRes.count ?? 0,
    mostUsedDeveloper: pickMostUsed(developerCounts),
    mostUsedFilm: pickMostUsed(filmCounts),
  }
}

function bump(map: Map<string, number>, raw: string | null | undefined): void {
  const trimmed = raw?.trim()
  if (!trimmed) return
  map.set(trimmed, (map.get(trimmed) ?? 0) + 1)
}

function pickMostUsed(counts: Map<string, number>): string | null {
  let best: { name: string; count: number } | null = null
  for (const [name, count] of counts) {
    if (
      best === null ||
      count > best.count ||
      (count === best.count && name.toLowerCase() < best.name.toLowerCase())
    ) {
      best = { name, count }
    }
  }
  return best?.name ?? null
}
