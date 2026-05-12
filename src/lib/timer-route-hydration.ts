import type { DevelopmentProcessSnapshot } from "@/types/development-log"

const DEFAULT_DEV_MINUTES = 10
const DEFAULT_TEMP = 20
const DEFAULT_VOLUME = 500

export function parseFiniteFloatParam(raw: string | null, fallback: number): number {
  if (raw == null || raw.trim() === "") return fallback
  const n = Number(raw)
  return Number.isFinite(n) ? n : fallback
}

export function parseFiniteIntParam(raw: string | null, fallback: number): number {
  if (raw == null || raw.trim() === "") return fallback
  const n = parseInt(raw, 10)
  return Number.isFinite(n) ? n : fallback
}

export type TimerQuerySnapshot = {
  time: string | null
  temp: string | null
  volume: string | null
  dilution: string | null
  tempUnit: string | null
}

export type TimerHydrationScalars = {
  developmentTimeMinutes: number
  temperature: number
  totalVolume: number
  developerDilution: string
  tempUnitParam: string | null
}

/** Non-replay: parse validated numbers from the URL. Replay: scalar fields follow the decoded snapshot first. */
export function buildTimerHydrationFromQueryAndReplay(
  query: TimerQuerySnapshot,
  replaySnapshot: DevelopmentProcessSnapshot | null,
): TimerHydrationScalars {
  let developmentTimeMinutes = parseFiniteFloatParam(query.time, DEFAULT_DEV_MINUTES)
  let temperature = parseFiniteFloatParam(query.temp, DEFAULT_TEMP)
  let totalVolume = parseFiniteIntParam(query.volume, DEFAULT_VOLUME)
  let developerDilution = (query.dilution ?? "").trim()
  let tempUnitParam = query.tempUnit

  if (replaySnapshot) {
    developmentTimeMinutes = replaySnapshot.developmentTimeMinutes
    temperature = replaySnapshot.temperatures.dev

    if (replaySnapshot.totalVolume != null && Number.isFinite(replaySnapshot.totalVolume)) {
      totalVolume = Math.round(replaySnapshot.totalVolume)
    } else {
      totalVolume = parseFiniteIntParam(query.volume, DEFAULT_VOLUME)
    }

    const dd = replaySnapshot.developerDilution?.trim()
    if (dd) developerDilution = dd

    if (replaySnapshot.temperatureUnit === "celsius") {
      tempUnitParam = "celsius"
    } else if (replaySnapshot.temperatureUnit === "fahrenheit") {
      tempUnitParam = "fahrenheit"
    }
  }

  return { developmentTimeMinutes, temperature, totalVolume, developerDilution, tempUnitParam }
}
