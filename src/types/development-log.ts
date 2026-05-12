import type { FilmFormat, ProcessTimes, WashingMethod } from "@/types/development"

/** Columns for list queries — avoids `select("*")` payload. */
export const DEVELOPMENT_LOG_LIST_COLUMNS =
  "id, user_id, film_name, film_format, film_iso, developer_name, option_key, total_volume, temperature_unit, modified_temperature, push_pull_stops, recipe_id, favorite_id, created_at, title, notes, process_snapshot"

/** Persisted reproducible timing + wash details (JSONB `process_snapshot`). */
export interface DevelopmentProcessTemperatures {
  dev: number
  stop: number
  fix: number
  wash: number
}

export interface DevelopmentProcessSnapshot {
  v: 1
  developmentTimeMinutes: number
  developerDilution: string | null
  processTimes: ProcessTimes
  washingMethod: WashingMethod
  temperatures: DevelopmentProcessTemperatures
  temperatureUnit: "celsius" | "fahrenheit" | null
  totalVolume: number | null
  isColor: boolean
}

/** Row shape from `public.development_log_entries`. */
export interface DevelopmentLogEntryRow {
  id: string
  user_id: string
  film_name: string
  film_format: FilmFormat
  film_iso: string
  developer_name: string
  option_key: string
  total_volume: number | null
  temperature_unit: "celsius" | "fahrenheit" | null
  modified_temperature: string | null
  push_pull_stops: number | null
  recipe_id: string | null
  favorite_id: string | null
  title: string | null
  notes: string | null
  process_snapshot: unknown | null
  created_at: string
}

/** Payload accepted by the auto-log helper invoked from /develop/timer. */
export interface DevelopmentLogInsert {
  user_id: string
  film_name: string
  film_format: FilmFormat
  film_iso: string
  developer_name: string
  option_key: string
  total_volume?: number | null
  temperature_unit?: "celsius" | "fahrenheit" | null
  modified_temperature?: number | null
  push_pull_stops?: number | null
  recipe_id?: string | null
  favorite_id?: string | null
  title?: string | null
  notes?: string | null
  /** Full process as run in the Timer (optional for legacy rows). */
  process_snapshot?: DevelopmentProcessSnapshot | null
}

/** Passed into the celebration dialog alongside the persisted log row id. */
export interface DiaryCompletionSummary {
  film_name: string
  film_format: FilmFormat
  film_iso: string
  developer_name: string
  option_key: string
  total_volume: number | null
  temperature_unit: "celsius" | "fahrenheit" | null
  modified_temperature: number | null
  push_pull_stops: number | null
  /** When present, reproducible timings from the Timer at completion. */
  process_snapshot?: DevelopmentProcessSnapshot | null
}

/** Roll formats are bucketed separately from sheets in the dashboard counts. */
export const ROLL_FORMATS: ReadonlyArray<FilmFormat> = ["35mm", "120"]
export const SHEET_FORMATS: ReadonlyArray<FilmFormat> = ["sheet"]

export function isRollFormat(format: FilmFormat): boolean {
  return ROLL_FORMATS.includes(format)
}

export function isSheetFormat(format: FilmFormat): boolean {
  return SHEET_FORMATS.includes(format)
}
