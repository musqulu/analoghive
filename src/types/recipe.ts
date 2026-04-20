import type { FilmFormat, ProcessTimes, WashingMethod } from "@/types/development"
import type { DevelopmentFavoriteSnapshot } from "@/types/favorite"

export const RECIPE_PAYLOAD_VERSION = 1 as const

/** Stored in `development_recipes.payload` (JSON) */
export interface RecipePayloadV1 {
  v: typeof RECIPE_PAYLOAD_VERSION
  source: "chart" | "manual"
  identity: {
    filmName: string
    filmFormat: FilmFormat
    filmIso: string
    developerName: string
    /** Chart dilution|temperature key, or empty for scratch recipes */
    optionKey: string
    pushPullStops: number
  }
  /** Dilution label for display (e.g. from optionKey or custom) */
  developerDilution: string
  totalVolume: number
  temperatureUnit: "celsius" | "fahrenheit"
  modifiedTemperature: number
  constantAgitation: boolean
  isColor: boolean
  /** When true, recipe includes a pre-soak step (workflow flag; persisted in payload JSON). */
  preSoak?: boolean
  developmentTimeMinutes: number
  processTimes: ProcessTimes
  washingMethod: WashingMethod
  chartReferenceNote?: string | null
  notes?: string | null
  dilutionNote?: string | null
  agitationNotes?: string | null
  pushPullLine?: string | null
}

export const DEVELOPMENT_RECIPES_LIST_COLUMNS = "id, user_id, title, payload, created_at, updated_at"

export interface DevelopmentRecipeRow {
  id: string
  user_id: string
  title: string
  payload: RecipePayloadV1
  created_at: string
  updated_at: string
}

/** Normalize JSON from Supabase into a typed payload (fallback for legacy rows). */
export function parseRecipePayload(json: unknown): RecipePayloadV1 | null {
  if (!json || typeof json !== "object") return null
  const o = json as Partial<RecipePayloadV1>
  if (o.v !== RECIPE_PAYLOAD_VERSION || (o.source !== "chart" && o.source !== "manual")) return null
  if (!o.identity || typeof o.identity !== "object") return null
  return json as RecipePayloadV1
}

export function recipeRowFromDb(row: {
  id: string
  user_id: string
  title: string
  payload: unknown
  created_at: string
  updated_at: string
}): DevelopmentRecipeRow | null {
  const payload = parseRecipePayload(row.payload)
  if (!payload) return null
  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    payload,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

export function defaultProcessTimes(developmentTimeMinutes: number, isColor: boolean): ProcessTimes {
  return {
    dev: developmentTimeMinutes,
    stop: 1,
    fix: isColor ? 2 : 5,
    wash: isColor ? 3 : 5,
  }
}

export function defaultWashingMethod(isColor: boolean): WashingMethod {
  return {
    type: "running",
    runningWaterTime: isColor ? 3 : 5,
    ilfordInversions: { first: 5, second: 10, third: 20 },
    custom: { totalTime: 5, waterChanges: 3 },
  }
}

export function createEmptyRecipePayload(isColor: boolean): RecipePayloadV1 {
  const developmentTimeMinutes = 8
  return {
    v: RECIPE_PAYLOAD_VERSION,
    source: "manual",
    identity: {
      filmName: "",
      filmFormat: "35mm",
      filmIso: "",
      developerName: "",
      optionKey: "",
      pushPullStops: 0,
    },
    developerDilution: "",
    totalVolume: 500,
    temperatureUnit: "celsius",
    modifiedTemperature: 20,
    constantAgitation: false,
    isColor,
    preSoak: false,
    developmentTimeMinutes,
    processTimes: defaultProcessTimes(developmentTimeMinutes, isColor),
    washingMethod: defaultWashingMethod(isColor),
    notes: "",
    dilutionNote: "",
    agitationNotes: "",
    chartReferenceNote: null,
    pushPullLine: null,
  }
}

export function recipePayloadToInsert(userId: string, title: string, payload: RecipePayloadV1) {
  return {
    user_id: userId,
    title: title.trim(),
    payload: payload as unknown as Record<string, unknown>,
  }
}

export function recipeTitleSuggestion(payload: RecipePayloadV1): string {
  const film = payload.identity.filmName.trim()
  const dev = payload.identity.developerName.trim()
  if (film && dev) return `${film} — ${dev}`
  if (film) return film
  if (dev) return dev
  return "Untitled recipe"
}

export function buildRecipePayloadFromChartFork(params: {
  snapshot: DevelopmentFavoriteSnapshot & { correctedTimeMinutes: number }
  isColor: boolean
  processTimes: ProcessTimes
  washingMethod: WashingMethod
  developerDilution: string
  chartReferenceNote?: string | null
  pushPullLine?: string | null
}): RecipePayloadV1 {
  const { snapshot } = params
  const devMin = snapshot.correctedTimeMinutes
  return {
    v: RECIPE_PAYLOAD_VERSION,
    source: "chart",
    identity: {
      filmName: snapshot.filmName,
      filmFormat: snapshot.filmFormat,
      filmIso: snapshot.filmIso,
      developerName: snapshot.developerName,
      optionKey: snapshot.optionKey,
      pushPullStops: snapshot.pushPullStops,
    },
    developerDilution: params.developerDilution,
    totalVolume: snapshot.totalVolume,
    temperatureUnit: snapshot.temperatureUnit,
    modifiedTemperature: snapshot.modifiedTemperature,
    constantAgitation: snapshot.constantAgitation,
    isColor: params.isColor,
    preSoak: false,
    developmentTimeMinutes: devMin,
    processTimes: {
      ...params.processTimes,
      dev: devMin,
    },
    washingMethod: params.washingMethod,
    chartReferenceNote: params.chartReferenceNote ?? null,
    notes: "",
    dilutionNote: "",
    agitationNotes: "",
    pushPullLine: params.pushPullLine ?? null,
  }
}

/** Props for {@link Timer} hydration from a saved recipe */
export function recipePayloadToTimerProps(payload: RecipePayloadV1) {
  const dilution =
    payload.developerDilution.trim() ||
    (payload.identity.optionKey.includes("|")
      ? (payload.identity.optionKey.split("|")[0] ?? "").trim()
      : payload.identity.optionKey.trim())
  return {
    developmentTime: payload.developmentTimeMinutes,
    temperature: payload.modifiedTemperature,
    filmName: payload.identity.filmName,
    filmFormat: payload.identity.filmFormat,
    filmIso: payload.identity.filmIso,
    developerName: payload.identity.developerName,
    developerDilution: dilution || undefined,
    totalVolume: payload.totalVolume,
    temperatureUnit: payload.temperatureUnit,
    isColor: payload.isColor,
    pushPullLine: payload.pushPullLine?.trim() || undefined,
    chartNote: payload.chartReferenceNote?.trim() || undefined,
  }
}
