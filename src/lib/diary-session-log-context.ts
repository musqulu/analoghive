import type { DevelopmentSessionId } from "@/components/ui/timer"
import type { DevelopmentProcessSnapshot } from "@/types/development-log"

export type FrozenDiarySessionLogContext<TCalc> = {
  calcSnapshot: TCalc
  processSnapshot: DevelopmentProcessSnapshot
}

/**
 * Captures calculator metadata and the dev-step process snapshot once per timer
 * session so later selection edits (or process edits before a retry) cannot
 * corrupt the diary row.
 */
export function ensureFrozenDiarySessionLogContext<TCalc>(
  store: Map<DevelopmentSessionId, FrozenDiarySessionLogContext<TCalc>>,
  sessionId: DevelopmentSessionId,
  processSnapshot: DevelopmentProcessSnapshot,
  calcSnapshot: TCalc | null | undefined,
): FrozenDiarySessionLogContext<TCalc> | null {
  if (calcSnapshot == null) return null
  const existing = store.get(sessionId)
  if (existing) return existing
  const ctx = { calcSnapshot, processSnapshot }
  store.set(sessionId, ctx)
  return ctx
}
