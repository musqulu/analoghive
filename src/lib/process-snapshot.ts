import type { ProcessTimes, WashingMethod } from "@/types/development"
import type { DevelopmentProcessSnapshot } from "@/types/development-log"

/** Stop / fix / wash step temps in the Timer model (`use-timer`). */
const SECONDARY_STEP_TEMP_C = 20

export type BuildDevelopmentProcessSnapshotInput = {
  developmentTimeMinutes: number
  developerDilution?: string | null
  temperature: number
  temperatureUnit?: string | null
  totalVolume?: number | null
  isColor: boolean
  customTimes: ProcessTimes
  washingMethod: WashingMethod
}

export function normalizeLogTemperatureUnit(
  unit?: string | null,
): "celsius" | "fahrenheit" | null {
  if (unit === "fahrenheit") return "fahrenheit"
  if (unit === "celsius") return "celsius"
  return null
}

export function buildDevelopmentProcessSnapshot(
  input: BuildDevelopmentProcessSnapshotInput,
): DevelopmentProcessSnapshot {
  const temperatureUnit = normalizeLogTemperatureUnit(input.temperatureUnit)
  const processTimes: ProcessTimes = {
    ...input.customTimes,
    dev: input.developmentTimeMinutes,
  }

  return {
    v: 1,
    developmentTimeMinutes: input.developmentTimeMinutes,
    developerDilution:
      typeof input.developerDilution === "string"
        ? input.developerDilution.trim()
        : null,
    processTimes,
    washingMethod: input.washingMethod,
    temperatures: {
      dev: input.temperature,
      stop: SECONDARY_STEP_TEMP_C,
      fix: SECONDARY_STEP_TEMP_C,
      wash: SECONDARY_STEP_TEMP_C,
    },
    temperatureUnit,
    totalVolume:
      input.totalVolume != null && Number.isFinite(input.totalVolume)
        ? input.totalVolume
        : null,
    isColor: input.isColor,
  }
}

export function parseDevelopmentProcessSnapshot(
  json: unknown,
): DevelopmentProcessSnapshot | null {
  if (!json || typeof json !== "object") return null
  const o = json as Partial<DevelopmentProcessSnapshot>
  if (o.v !== 1) return null
  if (
    !o.processTimes ||
    typeof o.processTimes.dev !== "number" ||
    !o.washingMethod ||
    !o.temperatures
  ) {
    return null
  }
  return json as DevelopmentProcessSnapshot
}

function degLabel(
  temperatureUnit: "celsius" | "fahrenheit" | null | undefined,
  value: number,
): string {
  const u =
    temperatureUnit === "fahrenheit"
      ? "°F"
      : temperatureUnit === "celsius"
        ? "°C"
        : "°"
  return `${value}${u}`
}

export function summarizeWashing(method: WashingMethod, washMinutes: number): string {
  if (method.type === "running") {
    return `running water ${washMinutes} min`
  }
  if (method.type === "ilford") {
    const { first, second, third } = method.ilfordInversions
    return `Ilford inversions (${first}/${second}/${third}) → wash ${washMinutes} min`
  }
  return `custom wash ${washMinutes} min · ${method.custom.waterChanges} changes · ${method.custom.totalTime} min fill-dump rhythm`
}

/**
 * Stable one-line-ish summary for diary cards and assistant context.
 */
export function summarizeProcessSnapshot(s: DevelopmentProcessSnapshot): string {
  const pt = s.processTimes
  const pre = pt.preSoak != null && pt.preSoak > 0 ? `pre-soak ${pt.preSoak} min · ` : ""
  const dil = s.developerDilution?.trim() || "(dilution as run)"
  const washDesc = summarizeWashing(s.washingMethod, pt.wash)

  const tUnit = s.temperatureUnit ?? undefined

  const parts = [
    `${pre}dev ${s.developmentTimeMinutes} min @ ${degLabel(tUnit, s.temperatures.dev)} (${dil})`,
    `stop ${pt.stop} min @ ${degLabel(tUnit, s.temperatures.stop)}`,
    `fix ${pt.fix} min @ ${degLabel(tUnit, s.temperatures.fix)}`,
    `${washDesc} @ ${degLabel(tUnit, s.temperatures.wash)}`,
  ]
  if (s.totalVolume != null) parts.push(`tank ${s.totalVolume} ml`)
  if (s.isColor) parts.push("color")
  return parts.join(" · ")
}
