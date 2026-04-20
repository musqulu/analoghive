import {
  buildDevelopFavoriteSearchString,
  parseDevelopFavoriteSearchParams,
} from "@/lib/favorite-develop-query"
import type { DevelopmentFavoriteSnapshot } from "@/types/favorite"
import {
  buildRecipePayloadFromChartFork,
  defaultProcessTimes,
  defaultWashingMethod,
  type RecipePayloadV1,
} from "@/types/recipe"

/** Extra query keys for `/recipes/new` when forking from the calculator */
export const RECIPE_DRAFT_PARAMS = {
  cdev: "cdev",
  stop: "stop",
  fix: "fix",
  wash: "wash",
  color: "color",
  chartNote: "cn",
  pushPullLine: "pll",
} as const

export function buildRecipeNewHref(
  snapshot: DevelopmentFavoriteSnapshot & { correctedTimeMinutes: number },
  options: {
    isColor: boolean
    chartReferenceNote?: string | null
    pushPullLine?: string | null
    /** Defaults match {@link defaultProcessTimes} when omitted */
    processTimes?: { stop: number; fix: number; wash: number }
  },
): string {
  const base = buildDevelopFavoriteSearchString(snapshot)
  const p = new URLSearchParams(base)
  p.set(RECIPE_DRAFT_PARAMS.cdev, String(snapshot.correctedTimeMinutes))
  p.set(RECIPE_DRAFT_PARAMS.color, options.isColor ? "1" : "0")
  const devMin = snapshot.correctedTimeMinutes
  const pt = defaultProcessTimes(devMin, options.isColor)
  const stop = options.processTimes?.stop ?? pt.stop
  const fix = options.processTimes?.fix ?? pt.fix
  const wash = options.processTimes?.wash ?? pt.wash
  p.set(RECIPE_DRAFT_PARAMS.stop, String(stop))
  p.set(RECIPE_DRAFT_PARAMS.fix, String(fix))
  p.set(RECIPE_DRAFT_PARAMS.wash, String(wash))
  const note = options.chartReferenceNote?.trim()
  if (note) {
    p.set(RECIPE_DRAFT_PARAMS.chartNote, note.slice(0, 500))
  }
  const pll = options.pushPullLine?.trim()
  if (pll) {
    p.set(RECIPE_DRAFT_PARAMS.pushPullLine, pll.slice(0, 200))
  }
  return `/recipes/new?${p.toString()}`
}

/**
 * Parse `/recipes/new` search params into a chart-fork payload, or `null` for a blank manual draft.
 */
export function parseRecipeDraftFromSearchParams(
  searchParams: URLSearchParams,
): RecipePayloadV1 | null {
  const snapshot = parseDevelopFavoriteSearchParams(searchParams)
  const cdevRaw = searchParams.get(RECIPE_DRAFT_PARAMS.cdev)
  const colorRaw = searchParams.get(RECIPE_DRAFT_PARAMS.color)

  if (!snapshot || cdevRaw === null) {
    return null
  }

  const cdev = Number.parseFloat(cdevRaw)
  if (!Number.isFinite(cdev) || cdev <= 0 || cdev > 24 * 60) {
    return null
  }

  const isColor = colorRaw === "1" || colorRaw === "true"
  const stopRaw = searchParams.get(RECIPE_DRAFT_PARAMS.stop)
  const fixRaw = searchParams.get(RECIPE_DRAFT_PARAMS.fix)
  const washRaw = searchParams.get(RECIPE_DRAFT_PARAMS.wash)
  const basePt = defaultProcessTimes(cdev, isColor)
  const stop = stopRaw !== null ? Number.parseFloat(stopRaw) : basePt.stop
  const fix = fixRaw !== null ? Number.parseFloat(fixRaw) : basePt.fix
  const wash = washRaw !== null ? Number.parseFloat(washRaw) : basePt.wash
  if (
    ![stop, fix, wash].every((n) => Number.isFinite(n) && n > 0 && n <= 24 * 60)
  ) {
    return null
  }

  const dilution = snapshot.optionKey.split("|")[0] ?? ""
  const chartNote = searchParams.get(RECIPE_DRAFT_PARAMS.chartNote)?.trim() ?? null
  const pushPullLine = searchParams.get(RECIPE_DRAFT_PARAMS.pushPullLine)?.trim() ?? null

  return buildRecipePayloadFromChartFork({
    snapshot: { ...snapshot, correctedTimeMinutes: cdev },
    isColor,
    processTimes: {
      dev: cdev,
      stop,
      fix,
      wash,
    },
    washingMethod: defaultWashingMethod(isColor),
    developerDilution: dilution,
    chartReferenceNote: chartNote,
    pushPullLine: pushPullLine?.length ? pushPullLine : null,
  })
}
