import type { FilmFormat } from "@/types/development"

/** Snapshot stored in Supabase and encoded in `/develop` query params */
export interface DevelopmentFavoriteSnapshot {
  filmName: string
  filmFormat: FilmFormat
  filmIso: string
  developerName: string
  /** Dilution + chart temperature, e.g. `1+1|20` */
  optionKey: string
  pushPullStops: number
  totalVolume: number
  temperatureUnit: "celsius" | "fahrenheit"
  modifiedTemperature: number
  constantAgitation: boolean
  /** Present when saving / loading from DB; omitted in URL hydration */
  correctedTimeMinutes?: number
}

/** Columns for list queries — avoids `select("*")` payload. */
export const DEVELOPMENT_FAVORITES_LIST_COLUMNS =
  "id, user_id, display_name, film_name, film_format, film_iso, developer_name, option_key, push_pull_stops, total_volume, temperature_unit, modified_temperature, constant_agitation, corrected_time_minutes, created_at"

/** Row shape from `public.development_favorites` */
export interface DevelopmentFavoriteRow {
  id: string
  user_id: string
  /** User-editable list title; null/empty uses {@link formatFavoriteTitle} in UI */
  display_name?: string | null
  film_name: string
  film_format: FilmFormat
  film_iso: string
  developer_name: string
  option_key: string
  push_pull_stops: number
  total_volume: number
  temperature_unit: "celsius" | "fahrenheit"
  modified_temperature: string
  constant_agitation: boolean
  corrected_time_minutes: number
  created_at: string
}

export function rowToSnapshot(row: DevelopmentFavoriteRow): DevelopmentFavoriteSnapshot {
  return {
    filmName: row.film_name,
    filmFormat: row.film_format,
    filmIso: row.film_iso,
    developerName: row.developer_name,
    optionKey: row.option_key,
    pushPullStops: row.push_pull_stops,
    totalVolume: row.total_volume,
    temperatureUnit: row.temperature_unit,
    modifiedTemperature: Number(row.modified_temperature),
    constantAgitation: row.constant_agitation,
    correctedTimeMinutes: Number(row.corrected_time_minutes),
  }
}

export function snapshotToInsert(
  userId: string,
  s: DevelopmentFavoriteSnapshot & { correctedTimeMinutes: number },
) {
  return {
    user_id: userId,
    display_name: formatFavoriteTitle(s.filmName, s.developerName, s.filmIso),
    film_name: s.filmName,
    film_format: s.filmFormat,
    film_iso: s.filmIso,
    developer_name: s.developerName,
    option_key: s.optionKey,
    push_pull_stops: s.pushPullStops,
    total_volume: s.totalVolume,
    temperature_unit: s.temperatureUnit,
    modified_temperature: s.modifiedTemperature,
    constant_agitation: s.constantAgitation,
    corrected_time_minutes: s.correctedTimeMinutes,
  }
}

export function formatFavoriteTitle(
  filmName: string,
  developerName: string,
  filmIso: string,
): string {
  return `${filmName} — ${developerName} (${filmIso})`
}

/** Display title for a favorite row: custom name or generated default. */
export function favoriteListTitle(row: {
  display_name?: string | null
  film_name: string
  developer_name: string
  film_iso: string
}): string {
  const custom = row.display_name?.trim()
  if (custom) return custom
  return formatFavoriteTitle(row.film_name, row.developer_name, row.film_iso)
}
