import type {
  DevelopmentLogEntryRow,
  DevelopmentProcessSnapshot,
} from "@/types/development-log"
import { parseDevelopmentProcessSnapshot, summarizeWashing } from "@/lib/process-snapshot"

function temperatureSuffix(
  unit: "celsius" | "fahrenheit" | null | undefined,
  value: number,
): string {
  const u =
    unit === "fahrenheit" ? "°F" : unit === "celsius" ? "°C" : "°"
  return `${value}${u}`
}

function parseRowModifiedTemperature(entry: DevelopmentLogEntryRow): number | null {
  if (entry.modified_temperature === null || entry.modified_temperature === "") return null
  const n =
    typeof entry.modified_temperature === "number"
      ? entry.modified_temperature
      : Number(entry.modified_temperature)
  return Number.isFinite(n) ? n : null
}

export interface DiaryProcessMetaLines {
  /** Development time / temp / dilution. */
  primary: string
  /** Stop, fix, wash, volume summary. */
  secondary: string | null
}

/** Two-line process block derived from a persisted or in-memory snapshot. */
export function diaryProcessLinesFromSnapshot(
  snapshot: DevelopmentProcessSnapshot,
): DiaryProcessMetaLines {
  const pt = snapshot.processTimes
  const pre =
    pt.preSoak != null && pt.preSoak > 0 ? `Pre-soak ${pt.preSoak} min · ` : ""
  const primary = `${pre}Dev ${snapshot.developmentTimeMinutes} min @ ${temperatureSuffix(snapshot.temperatureUnit, snapshot.temperatures.dev)}`
  const bits = [
    `Stop ${pt.stop} min @ ${temperatureSuffix(snapshot.temperatureUnit, snapshot.temperatures.stop)}`,
    `Fix ${pt.fix} min @ ${temperatureSuffix(snapshot.temperatureUnit, snapshot.temperatures.fix)}`,
    summarizeWashing(snapshot.washingMethod, pt.wash),
  ]
  if (snapshot.totalVolume != null) bits.push(`${snapshot.totalVolume} ml tank`)
  if (snapshot.isColor) bits.push("color")
  return { primary, secondary: bits.join(" · ") }
}

/** Compact two-line process block under film/developer on /diary. */
export function diaryListProcessLines(entry: DevelopmentLogEntryRow): DiaryProcessMetaLines | null {
  const snapshot = parseDevelopmentProcessSnapshot(entry.process_snapshot)

  if (snapshot) {
    return diaryProcessLinesFromSnapshot(snapshot)
  }

  const fallbackBits: string[] = []
  const mod = parseRowModifiedTemperature(entry)
  if (mod !== null && entry.temperature_unit) {
    fallbackBits.push(
      `Tank temp logged @ ${temperatureSuffix(entry.temperature_unit, mod)}`,
    )
  }
  const volFallback =
    entry.total_volume != null && Number.isFinite(entry.total_volume)
      ? `${entry.total_volume} ml tank`
      : null
  if (!fallbackBits.length && !volFallback) return null

  if (!fallbackBits.length && volFallback) {
    return { primary: volFallback, secondary: null }
  }

  const primary = fallbackBits.join(" · ")
  const secondary = volFallback
  return { primary, secondary }
}
