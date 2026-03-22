/**
 * Manufacturer / box-speed ratings by film id. Additive only — does not touch development times.
 * Films not listed use inferRatingIso() from their isos array.
 */
export const FILM_BOX_SPEED_ISO: Partial<Record<string, number>> = {
  // Common stocks (extend as needed)
  ilfordhp5: 400,
  ilforddelta400: 400,
  ilforddelta100: 100,
  ilforddelta3200: 3200,
  ilfordfp4: 125,
  kodaktrix400: 400,
  kodaktrix: 400,
  kodakgold200: 200,
  kodakportra400: 400,
  kodakportra800: 800,
  fujisuperia400: 400,
  fujicolorc200: 200,
}

/** Prefer common box speeds when present; else median of sorted ISO list. */
export function inferRatingIso(isos: number[]): number {
  if (isos.length === 0) return 400
  const preferred = [400, 100, 200, 800, 3200, 1600, 125, 250]
  for (const p of preferred) {
    if (isos.includes(p)) return p
  }
  const sorted = [...isos].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]
}

export function getRatingIso(filmId: string, isos: number[]): number {
  const explicit = FILM_BOX_SPEED_ISO[filmId]
  if (explicit !== undefined) return explicit
  return inferRatingIso(isos)
}
