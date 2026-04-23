import type { DevelopmentOption } from "@/types/development"
import type { DevelopmentFavoriteSnapshot } from "@/types/favorite"
import { tryHc110LegacyOptionKey } from "@/lib/hc110-dilution-legacy"

/**
 * Returns the saved option key if it exists in the current chart options (favorite / URL restore).
 * Maps legacy single-letter HC-110 keys (e.g. `B|20`) to explicit dilution keys (`B 1+31|20`).
 */
export function resolveFavoriteOptionKey(
  snapshot: DevelopmentFavoriteSnapshot,
  developmentInfo: DevelopmentOption[] | DevelopmentOption | null,
): string | null {
  if (!developmentInfo) return null
  const opts = Array.isArray(developmentInfo) ? developmentInfo : [developmentInfo]
  if (opts.some((o) => o.optionKey === snapshot.optionKey)) {
    return snapshot.optionKey
  }
  if (snapshot.developerName === "HC-110") {
    const fromLegacy = tryHc110LegacyOptionKey(snapshot.optionKey)
    if (
      fromLegacy &&
      opts.some((o) => o.optionKey === fromLegacy)
    ) {
      return fromLegacy
    }
  }
  return null
}
