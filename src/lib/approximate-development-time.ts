import type { DevelopmentTime } from "@/data/processed-development-times"
import { findClosestIsoTime } from "@/data/processed-development-times"

export type TimeSource = "exact" | "nearest" | "interpolated" | "extrapolated" | "fallback"

const FALLBACK_PUSH_PER_STOP = 1.25
const FALLBACK_PULL_PER_STOP = 0.88

function dedupeByIsoPreferShorterTime(rows: DevelopmentTime[]): DevelopmentTime[] {
  const byIso = new Map<number, DevelopmentTime>()
  const sorted = [...rows].sort((a, b) => (a.iso! as number) - (b.iso! as number))
  for (const r of sorted) {
    const iso = r.iso as number
    const prev = byIso.get(iso)
    if (!prev || r.time < prev.time) byIso.set(iso, r)
  }
  return [...byIso.values()].sort((a, b) => (a.iso! as number) - (b.iso! as number))
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/** Linear extrapolation: x in [x0,x1], y = lerp(y0,y1,(x-x0)/(x1-x0)) */
function extrapolateTime(
  x: number,
  x0: number,
  t0: number,
  x1: number,
  t1: number
): number {
  if (x1 === x0) return t0
  const y = t0 + ((t1 - t0) * (x - x0)) / (x1 - x0)
  return Math.max(0.1, y)
}

function preferStandardTemp(a: DevelopmentTime, b: DevelopmentTime): number {
  if (a.temperature === b.temperature) return a.temperature
  if (a.temperature === 20) return 20
  if (b.temperature === 20) return 20
  return a.temperature
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

export interface ResolvedTime {
  time: number
  temperature: number
  source: TimeSource
}

/**
 * Read-only resolution of time/temperature for a target ISO from chart rows
 * (same film+developer+format+dilution slice). Never mutates source data.
 */
export function resolveTimeFromRows(
  rows: DevelopmentTime[],
  targetIso: number
): ResolvedTime {
  const valid = rows.filter((r) => r.iso !== null)
  if (valid.length === 0) {
    return { time: 10, temperature: 20, source: "fallback" }
  }

  const uniq = dedupeByIsoPreferShorterTime(valid)
  const exact = uniq.find((r) => r.iso === targetIso)
  if (exact) {
    return {
      time: exact.time,
      temperature: exact.temperature,
      source: "exact",
    }
  }

  const isos = uniq.map((r) => r.iso as number)
  const minIso = isos[0]
  const maxIso = isos[isos.length - 1]

  if (targetIso < minIso) {
    if (uniq.length >= 2) {
      const a = uniq[0]
      const b = uniq[1]
      return {
        time: round2(extrapolateTime(
          targetIso,
          a.iso as number,
          a.time,
          b.iso as number,
          b.time
        )),
        temperature: preferStandardTemp(a, b),
        source: "extrapolated",
      }
    }
    const stops = Math.log2(Math.max(1, minIso / targetIso))
    return {
      time: Math.max(
        0.1,
        uniq[0].time * Math.pow(FALLBACK_PULL_PER_STOP, stops)
      ),
      temperature: uniq[0].temperature,
      source: "fallback",
    }
  }

  if (targetIso > maxIso) {
    if (uniq.length >= 2) {
      const b = uniq[uniq.length - 1]
      const a = uniq[uniq.length - 2]
      return {
        time: round2(extrapolateTime(
          targetIso,
          a.iso as number,
          a.time,
          b.iso as number,
          b.time
        )),
        temperature: preferStandardTemp(b, a),
        source: "extrapolated",
      }
    }
    const stops = Math.log2(targetIso / Math.max(1, maxIso))
    return {
      time: Math.max(
        0.1,
        uniq[uniq.length - 1].time * Math.pow(FALLBACK_PUSH_PER_STOP, stops)
      ),
      temperature: uniq[uniq.length - 1].temperature,
      source: "fallback",
    }
  }

  const le = uniq.filter((r) => (r.iso as number) <= targetIso)
  const ge = uniq.filter((r) => (r.iso as number) >= targetIso)
  const lower = le.length ? le[le.length - 1] : undefined
  const upper = ge.length ? ge[0] : undefined

  if (lower && upper && lower.iso !== upper.iso) {
    const x0 = lower.iso as number
    const x1 = upper.iso as number
    const t = (targetIso - x0) / (x1 - x0)
    return {
      time: round2(lerp(lower.time, upper.time, t)),
      temperature: preferStandardTemp(lower, upper),
      source: "interpolated",
    }
  }

  const closest = findClosestIsoTime(valid, targetIso)
  if (closest) {
    return {
      time: closest.time,
      temperature: closest.temperature,
      source: "nearest",
    }
  }

  return {
    time: uniq[0].time,
    temperature: uniq[0].temperature,
    source: "nearest",
  }
}

export function sourceToUserNote(source: TimeSource): string {
  switch (source) {
    case "exact":
      return "From chart"
    case "nearest":
      return "Approximate (nearest ISO in chart)"
    case "interpolated":
      return "Approximate (interpolated between chart ISOs)"
    case "extrapolated":
      return "Approximate (extrapolated from chart ISOs)"
    case "fallback":
      return "Rule-of-thumb estimate (limited chart data)"
    default:
      return ""
  }
}

export function formatPushPullLine(
  pushPullStops: number,
  selectedIso: number,
  ratingIso: number
): string {
  const ei = selectedIso
  if (pushPullStops === 0) {
    return `Box speed (rated ${ratingIso}, EI ${ei})`
  }
  if (pushPullStops > 0) {
    return `Pushed +${pushPullStops} (EI ${ei})`
  }
  return `Pulled ${pushPullStops} (EI ${ei})`
}
