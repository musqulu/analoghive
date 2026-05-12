/**
 * Diary → /develop/timer “Run again”: snapshot in `replay` (base64url JSON) plus scalars.
 */

import type {
  DevelopmentLogEntryRow,
  DevelopmentProcessSnapshot,
} from "@/types/development-log"
import {
  encodeSnapshotForReplayUrl,
  parseReplayParam,
} from "@/lib/diary-replay-encoding"
import { parseDevelopmentProcessSnapshot } from "@/lib/process-snapshot"

export const DIARY_TIMER_REPLAY_PARAM = "replay" as const

export function decodeDiaryReplayParam(encoded: string | null): DevelopmentProcessSnapshot | null {
  return parseDevelopmentProcessSnapshot(parseReplayParam(encoded))
}

function dilutionSegmentFromOptionKey(optionKey: string): string {
  const pipe = optionKey.indexOf("|")
  const raw = pipe === -1 ? optionKey : optionKey.slice(0, pipe)
  return raw.trim()
}

export function modifiedTemperatureNumeric(entry: DevelopmentLogEntryRow): number | null {
  if (entry.modified_temperature === null || entry.modified_temperature === "") return null
  const n =
    typeof entry.modified_temperature === "number"
      ? entry.modified_temperature
      : Number(entry.modified_temperature)
  return Number.isFinite(n) ? n : null
}

/**
 * Diary “Run again”: only navigable when a valid `process_snapshot` exists — no heuristic URL fallbacks.
 */
export function buildDiaryTimerReplayHref(entry: DevelopmentLogEntryRow): string | null {
  const snap = parseDevelopmentProcessSnapshot(entry.process_snapshot)
  if (!snap) return null

  const qs = new URLSearchParams()
  qs.set("film", entry.film_name)
  qs.set("format", entry.film_format)
  qs.set("iso", entry.film_iso)
  qs.set("developer", entry.developer_name)

  let dilution = dilutionSegmentFromOptionKey(entry.option_key)
  const dd = snap.developerDilution?.trim()
  if (dd) dilution = dd

  qs.set("dilution", dilution)
  qs.set("time", String(snap.developmentTimeMinutes))
  qs.set("temp", String(snap.temperatures.dev))

  if (snap.totalVolume != null && Number.isFinite(snap.totalVolume)) {
    qs.set("volume", String(Math.round(snap.totalVolume)))
  }

  const tempUnit =
    snap.temperatureUnit === "celsius" || snap.temperatureUnit === "fahrenheit"
      ? snap.temperatureUnit
      : entry.temperature_unit
  if (tempUnit === "celsius" || tempUnit === "fahrenheit") {
    qs.set("tempUnit", tempUnit)
  }

  if (entry.option_key.trim()) qs.set("optionKey", entry.option_key)
  if (entry.recipe_id) qs.set("recipeId", entry.recipe_id)
  if (entry.favorite_id) qs.set("favoriteId", entry.favorite_id)
  if (entry.push_pull_stops !== null && Number.isFinite(Number(entry.push_pull_stops))) {
    qs.set("pushPull", String(entry.push_pull_stops))
  }

  qs.set(DIARY_TIMER_REPLAY_PARAM, encodeSnapshotForReplayUrl(snap))

  return `/develop/timer?${qs.toString()}`
}
