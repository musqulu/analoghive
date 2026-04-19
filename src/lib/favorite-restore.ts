import type { DevelopmentOption } from "@/types/development"
import type { DevelopmentFavoriteSnapshot } from "@/types/favorite"

/**
 * Returns the saved option key if it exists in the current chart options (favorite / URL restore).
 */
export function resolveFavoriteOptionKey(
  snapshot: DevelopmentFavoriteSnapshot,
  developmentInfo: DevelopmentOption[] | DevelopmentOption | null,
): string | null {
  if (!developmentInfo) return null
  const opts = Array.isArray(developmentInfo) ? developmentInfo : [developmentInfo]
  return opts.some((o) => o.optionKey === snapshot.optionKey) ? snapshot.optionKey : null
}
