import type { SupabaseClient } from "@supabase/supabase-js"
import { developers, type Developer } from "@/data/processed-developers"
import {
  DEVELOPMENT_RECIPES_LIST_COLUMNS,
  parseRecipePayload,
  type RecipePayloadV1,
} from "@/types/recipe"

export const RECIPE_LIMIT = 30
export const FAVORITE_LIMIT = 30
export const LOG_LIMIT = 20
export const DEVELOPER_MATCH_LIMIT = 6

export interface CompactRecipe {
  id: string
  title: string
  identity: RecipePayloadV1["identity"]
  developerDilution: string
  developmentTimeMinutes: number
  modifiedTemperature: number
  temperatureUnit: RecipePayloadV1["temperatureUnit"]
  isColor: boolean
  createdAt: string
}

export interface CompactFavorite {
  id: string
  displayName: string | null
  filmName: string
  filmFormat: string
  filmIso: string
  developerName: string
  optionKey: string
  pushPullStops: number
  modifiedTemperature: number
  temperatureUnit: string
  correctedTimeMinutes: number
}

export interface CompactLogEntry {
  id: string
  filmName: string
  filmFormat: string
  filmIso: string
  developerName: string
  optionKey: string
  createdAt: string
}

export interface UserChatContext {
  recipes: CompactRecipe[]
  favorites: CompactFavorite[]
  recentLogs: CompactLogEntry[]
}

export interface CompactDeveloperRow {
  id: string
  name: string
  manufacturer: string
  type: Developer["type"]
  dilutions: Array<{
    label: string
    temperatureC: number
    timesByIso: Record<string, number>
  }>
}

/**
 * Load a compact view of the signed-in user's data for grounding the AI assistant.
 * Caps row counts and projects only fields the prompt actually uses.
 */
export async function loadUserContext(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserChatContext> {
  const [recipesRes, favoritesRes, logsRes] = await Promise.all([
    supabase
      .from("development_recipes")
      .select(DEVELOPMENT_RECIPES_LIST_COLUMNS)
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(RECIPE_LIMIT),
    supabase
      .from("development_favorites")
      .select(
        "id, display_name, film_name, film_format, film_iso, developer_name, option_key, push_pull_stops, modified_temperature, temperature_unit, corrected_time_minutes, created_at",
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(FAVORITE_LIMIT),
    supabase
      .from("development_log_entries")
      .select(
        "id, film_name, film_format, film_iso, developer_name, option_key, created_at",
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(LOG_LIMIT),
  ])

  const recipes: CompactRecipe[] = []
  for (const row of (recipesRes.data ?? []) as Array<{
    id: string
    title: string
    payload: unknown
    created_at: string
  }>) {
    const payload = parseRecipePayload(row.payload)
    if (!payload) continue
    recipes.push({
      id: row.id,
      title: row.title,
      identity: payload.identity,
      developerDilution: payload.developerDilution,
      developmentTimeMinutes: payload.developmentTimeMinutes,
      modifiedTemperature: payload.modifiedTemperature,
      temperatureUnit: payload.temperatureUnit,
      isColor: payload.isColor,
      createdAt: row.created_at,
    })
  }

  const favorites: CompactFavorite[] = ((favoritesRes.data ?? []) as Array<{
    id: string
    display_name: string | null
    film_name: string
    film_format: string
    film_iso: string
    developer_name: string
    option_key: string
    push_pull_stops: number
    modified_temperature: number
    temperature_unit: string
    corrected_time_minutes: number
  }>).map((f) => ({
    id: f.id,
    displayName: f.display_name,
    filmName: f.film_name,
    filmFormat: f.film_format,
    filmIso: f.film_iso,
    developerName: f.developer_name,
    optionKey: f.option_key,
    pushPullStops: f.push_pull_stops,
    modifiedTemperature: f.modified_temperature,
    temperatureUnit: f.temperature_unit,
    correctedTimeMinutes: f.corrected_time_minutes,
  }))

  const recentLogs: CompactLogEntry[] = ((logsRes.data ?? []) as Array<{
    id: string
    film_name: string
    film_format: string
    film_iso: string
    developer_name: string
    option_key: string
    created_at: string
  }>).map((l) => ({
    id: l.id,
    filmName: l.film_name,
    filmFormat: l.film_format,
    filmIso: l.film_iso,
    developerName: l.developer_name,
    optionKey: l.option_key,
    createdAt: l.created_at,
  }))

  return { recipes, favorites, recentLogs }
}

function compact(d: Developer): CompactDeveloperRow {
  return {
    id: d.id,
    name: d.name,
    manufacturer: d.manufacturer,
    type: d.type,
    dilutions: Object.entries(d.dilutions).map(([label, info]) => ({
      label,
      temperatureC: info.temperature,
      timesByIso: Object.fromEntries(
        Object.entries(info.times).map(([iso, t]) => [String(iso), t]),
      ),
    })),
  }
}

/**
 * Pick chart rows whose developer name (or the user's referenced film/developer names)
 * appear in the latest user message. Returns at most DEVELOPER_MATCH_LIMIT rows.
 * Returns [] when nothing matches — we never inject the full chart.
 */
export function findRelevantDeveloperRows(
  message: string,
  recipes: CompactRecipe[],
  source: Developer[] = developers,
): CompactDeveloperRow[] {
  const haystack = message.toLowerCase()
  if (haystack.trim().length === 0) return []

  const recipeDevNames = new Set(
    recipes
      .map((r) => r.identity.developerName.trim().toLowerCase())
      .filter((n) => n.length > 0),
  )

  const matches: CompactDeveloperRow[] = []
  for (const dev of source) {
    const lower = dev.name.toLowerCase()
    const isReferencedInMessage = haystack.includes(lower)
    const isReferencedInRecipes = recipeDevNames.has(lower)
    if (isReferencedInMessage || isReferencedInRecipes) {
      matches.push(compact(dev))
      if (matches.length >= DEVELOPER_MATCH_LIMIT) break
    }
  }
  return matches
}
