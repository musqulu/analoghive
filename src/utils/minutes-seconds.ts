/** Round decimal minutes to nearest second, then split into min + sec. */
export function decimalMinutesToMinSec(value: number): { min: number; sec: number } {
  const totalSec = Math.max(0, Math.round(Number(value) * 60))
  return {
    min: Math.floor(totalSec / 60),
    sec: totalSec % 60,
  }
}

/** Combine whole minutes and seconds (0–59) into decimal minutes. */
export function minSecToDecimalMinutes(min: number, sec: number): number {
  const m = Number.isFinite(min) ? Math.max(0, Math.floor(min)) : 0
  const s = Number.isFinite(sec) ? Math.max(0, Math.min(59, Math.floor(sec))) : 0
  return m + s / 60
}

/** Display as `m:ss` (seconds zero-padded). */
export function formatMmSs(decimalMinutes: number): string {
  const { min, sec } = decimalMinutesToMinSec(decimalMinutes)
  return `${min}:${sec.toString().padStart(2, "0")}`
}

/**
 * Parse `MM:SS` or `M:SS`, or a plain integer as whole minutes.
 * Returns decimal minutes, or `null` if empty/invalid.
 */
export function parseMmSs(text: string): number | null {
  const t = text.trim()
  if (t === "") return null

  if (t.includes(":")) {
    const idx = t.indexOf(":")
    const left = t.slice(0, idx).trim()
    const right = t.slice(idx + 1).trim()
    const minPart = left === "" ? 0 : Number.parseInt(left, 10)
    if (!Number.isFinite(minPart) || minPart < 0) return null
    if (right === "") return minSecToDecimalMinutes(minPart, 0)
    if (!/^\d+$/.test(right)) return null
    const secPart = Number.parseInt(right, 10)
    if (!Number.isFinite(secPart) || secPart < 0) return null
    return minSecToDecimalMinutes(minPart, secPart)
  }

  if (!/^\d+$/.test(t)) return null
  const minOnly = Number.parseInt(t, 10)
  if (!Number.isFinite(minOnly) || minOnly < 0) return null
  return minSecToDecimalMinutes(minOnly, 0)
}
