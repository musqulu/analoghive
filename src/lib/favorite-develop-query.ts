import type { FilmFormat } from "@/types/development"
import type { DevelopmentFavoriteSnapshot } from "@/types/favorite"

/** Short query keys for `/develop` hydration */
export const DEVELOP_FAVORITE_PARAMS = {
  film: "film",
  format: "format",
  iso: "iso",
  developer: "developer",
  option: "option",
  push: "push",
  vol: "vol",
  tu: "tu",
  mt: "mt",
  agitation: "agitation",
} as const

function isFilmFormat(s: string): s is FilmFormat {
  return s === "35mm" || s === "120" || s === "sheet"
}

function isTempUnit(s: string): s is "celsius" | "fahrenheit" {
  return s === "celsius" || s === "fahrenheit"
}

export function buildDevelopFavoriteSearchString(
  s: DevelopmentFavoriteSnapshot,
): string {
  const p = new URLSearchParams()
  p.set(DEVELOP_FAVORITE_PARAMS.film, s.filmName)
  p.set(DEVELOP_FAVORITE_PARAMS.format, s.filmFormat)
  p.set(DEVELOP_FAVORITE_PARAMS.iso, s.filmIso)
  p.set(DEVELOP_FAVORITE_PARAMS.developer, s.developerName)
  p.set(DEVELOP_FAVORITE_PARAMS.option, s.optionKey)
  p.set(DEVELOP_FAVORITE_PARAMS.push, String(s.pushPullStops))
  p.set(DEVELOP_FAVORITE_PARAMS.vol, String(s.totalVolume))
  p.set(DEVELOP_FAVORITE_PARAMS.tu, s.temperatureUnit)
  p.set(DEVELOP_FAVORITE_PARAMS.mt, String(s.modifiedTemperature))
  p.set(DEVELOP_FAVORITE_PARAMS.agitation, s.constantAgitation ? "1" : "0")
  return p.toString()
}

export function buildDevelopFavoriteHref(s: DevelopmentFavoriteSnapshot): string {
  return `/develop?${buildDevelopFavoriteSearchString(s)}`
}

/**
 * Parse `/develop` search params into a snapshot, or null if invalid / incomplete.
 */
export function parseDevelopFavoriteSearchParams(
  searchParams: URLSearchParams,
): DevelopmentFavoriteSnapshot | null {
  const film = searchParams.get(DEVELOP_FAVORITE_PARAMS.film)?.trim() ?? ""
  const formatRaw = searchParams.get(DEVELOP_FAVORITE_PARAMS.format) ?? ""
  const iso = searchParams.get(DEVELOP_FAVORITE_PARAMS.iso)?.trim() ?? ""
  const developer = searchParams.get(DEVELOP_FAVORITE_PARAMS.developer)?.trim() ?? ""
  const option = searchParams.get(DEVELOP_FAVORITE_PARAMS.option)?.trim() ?? ""
  const pushRaw = searchParams.get(DEVELOP_FAVORITE_PARAMS.push)
  const volRaw = searchParams.get(DEVELOP_FAVORITE_PARAMS.vol)
  const tuRaw = searchParams.get(DEVELOP_FAVORITE_PARAMS.tu) ?? ""
  const mtRaw = searchParams.get(DEVELOP_FAVORITE_PARAMS.mt)
  const agRaw = searchParams.get(DEVELOP_FAVORITE_PARAMS.agitation)

  if (
    !film ||
    !formatRaw ||
    !iso ||
    !developer ||
    !option ||
    pushRaw === null ||
    volRaw === null ||
    !tuRaw ||
    mtRaw === null ||
    agRaw === null
  ) {
    return null
  }

  if (!isFilmFormat(formatRaw)) return null
  if (!isTempUnit(tuRaw)) return null

  const push = Number.parseInt(pushRaw, 10)
  if (!Number.isFinite(push) || push < -2 || push > 2) return null

  const vol = Number.parseInt(volRaw, 10)
  if (!Number.isFinite(vol) || vol < 1 || vol > 100_000) return null

  const mt = Number.parseFloat(mtRaw)
  if (!Number.isFinite(mt)) return null

  if (agRaw !== "0" && agRaw !== "1" && agRaw !== "true" && agRaw !== "false") {
    return null
  }
  const constantAgitation = agRaw === "1" || agRaw === "true"

  if (!option.includes("|")) return null

  return {
    filmName: film,
    filmFormat: formatRaw,
    filmIso: iso,
    developerName: developer,
    optionKey: option,
    pushPullStops: push,
    totalVolume: vol,
    temperatureUnit: tuRaw,
    modifiedTemperature: mt,
    constantAgitation,
  }
}
