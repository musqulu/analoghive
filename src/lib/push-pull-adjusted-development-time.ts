import { lerp } from "./approximate-development-time"

const STOPS_MIN = -2
const STOPS_MAX = 2

export type PushPullDirection = "push" | "pull" | "none"

export type PushPullAnchor = { stops: number; factor: number }

/** Ordered stops → factor anchors; use for film/developer-specific overrides later. */
export type PushPullHeuristicProfile = {
  anchors: readonly PushPullAnchor[]
}

export const DEFAULT_BW_PUSH_PULL_PROFILE: PushPullHeuristicProfile = {
  anchors: [
    { stops: -2, factor: 0.7 },
    { stops: -1, factor: 0.85 },
    { stops: 0, factor: 1.0 },
    { stops: 1, factor: 1.25 },
    { stops: 2, factor: 1.5 },
  ],
} as const

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

export function clampPushPullStops(stops: number): number {
  return Math.min(STOPS_MAX, Math.max(STOPS_MIN, stops))
}

/**
 * Linear interpolation of **factor** between profile anchors (not time).
 * `stops` should lie in [-2, +2]; behavior outside that range is undefined—clamp first with {@link clampPushPullStops}.
 */
export function getFactorForStops(
  stops: number,
  profile: PushPullHeuristicProfile = DEFAULT_BW_PUSH_PULL_PROFILE
): number {
  const anchors = [...profile.anchors].sort((a, b) => a.stops - b.stops)
  if (anchors.length === 0) return 1

  if (stops <= anchors[0].stops) return anchors[0].factor
  if (stops >= anchors[anchors.length - 1].stops) {
    return anchors[anchors.length - 1].factor
  }

  for (let i = 0; i < anchors.length - 1; i++) {
    const lo = anchors[i]
    const hi = anchors[i + 1]
    if (stops >= lo.stops && stops <= hi.stops) {
      const span = hi.stops - lo.stops
      const t = span === 0 ? 0 : (stops - lo.stops) / span
      return lerp(lo.factor, hi.factor, t)
    }
  }

  return anchors[anchors.length - 1].factor
}

export type PushPullAdjustedDevelopmentTimeResult = {
  baseMinutes: number
  stopsRequested: number
  stopsApplied: number
  factor: number
  adjustedMinutes: number
  deltaMinutes: number
  direction: PushPullDirection
  explanation: string
}

function formatStopsLabel(stops: number): string {
  if (Object.is(stops, -0)) return "0"
  if (stops === 0) return "0"
  const abs = Math.abs(stops)
  const s = Number.isInteger(abs) ? abs.toString() : abs.toFixed(1).replace(/\.0$/, "")
  return stops > 0 ? `+${s}` : `-${s}`
}

/** Positive magnitude for wording like "Pull 1.5 stops". */
function formatStopsMagnitude(stops: number): string {
  const m = Math.abs(stops)
  return Number.isInteger(m) ? m.toString() : m.toFixed(1).replace(/\.0$/, "")
}

function buildExplanation(
  baseMinutes: number,
  stopsApplied: number,
  factor: number,
  adjustedMinutes: number,
  deltaMinutes: number,
  direction: PushPullDirection
): string {
  const disclaimer =
    "These values are approximate starting points—validate on real negatives."

  const baseStr = baseMinutes.toFixed(2)
  const adjStr = adjustedMinutes.toFixed(2)
  const deltaAbs = Math.abs(deltaMinutes).toFixed(2)

  if (direction === "none") {
    return `No push or pull (${formatStopsLabel(stopsApplied)} stops): development time stays at ${adjStr} min (factor ${factor.toFixed(2)}×). ${disclaimer}`
  }

  if (direction === "push") {
    return `Push ${formatStopsLabel(stopsApplied)} stop${Math.abs(stopsApplied) === 1 ? "" : "s"}: development time increased by ${deltaAbs} min (from ${baseStr} min base to ${adjStr} min final; factor ${factor.toFixed(2)}×). ${disclaimer}`
  }

  const mag = Math.abs(stopsApplied)
  return `Pull ${formatStopsMagnitude(stopsApplied)} stop${mag === 1 ? "" : "s"}: development time decreased by ${deltaAbs} min (from ${baseStr} min base to ${adjStr} min final; factor ${factor.toFixed(2)}×). ${disclaimer}`
}

/**
 * Apply B&W push/pull heuristics to a **base** development time (minutes from datasheet or Massive Dev Chart):
 * `adjusted_time = base_time × factor`, with default factors at integer stops and linear interpolation of **factor** between them.
 *
 * @param baseMinutes — Normal development time in minutes (must be ≥ 0 for sensible results).
 * @param stopsRequested — Push/pull in stops (e.g. -2 … +2, fractional allowed); values outside [-2, +2] are clamped for the calculation (`stopsApplied` reflects the clamp).
 *
 * @example Tri-X-style: base 9.5 min, +1 stop → ~11.88 min (×1.25).
 * @example HP5-style: base 11 min, -1 stop → ~9.35 min (×0.85).
 * @example Fomapan-style: base 7 min, +0.5 stop → factor 1.125 → ~7.88 min.
 * @example Pull: base 10 min, -2 stops → 7.00 min (×0.70).
 * @example No change: base 8 min, 0 stops → 8.00 min (×1.00).
 */
export function getPushPullAdjustedDevelopmentTime(
  baseMinutes: number,
  stopsRequested: number,
  options?: { profile?: PushPullHeuristicProfile }
): PushPullAdjustedDevelopmentTimeResult {
  const stopsApplied = clampPushPullStops(stopsRequested)
  const profile = options?.profile ?? DEFAULT_BW_PUSH_PULL_PROFILE
  const factor = getFactorForStops(stopsApplied, profile)
  const adjustedMinutes = round2(baseMinutes * factor)
  const deltaMinutes = round2(adjustedMinutes - baseMinutes)

  let direction: PushPullDirection = "none"
  if (stopsApplied > 0) direction = "push"
  else if (stopsApplied < 0) direction = "pull"

  const explanation = buildExplanation(
    baseMinutes,
    stopsApplied,
    factor,
    adjustedMinutes,
    deltaMinutes,
    direction
  )

  return {
    baseMinutes,
    stopsRequested,
    stopsApplied,
    factor,
    adjustedMinutes,
    deltaMinutes,
    direction,
    explanation,
  }
}
