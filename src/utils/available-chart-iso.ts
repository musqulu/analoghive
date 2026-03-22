/** Closest chart ISO to a target EI (e.g. rated ISO or push/pull target). */
export function findClosestAvailableIso(
  target: number,
  available: number[]
): number | null {
  if (available.length === 0) return null
  return available.reduce((prev, curr) =>
    Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev
  )
}
