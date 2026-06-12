import type { DevelopmentSessionId } from "@/components/ui/timer"
import type { DevelopmentProcessSnapshot } from "@/types/development-log"

export type FrozenDiarySessionLogContext<TCalc> = {
  calcSnapshot: TCalc
  processSnapshot: DevelopmentProcessSnapshot
}

export type DiarySessionLogEntry<TCalc> = {
  calcSnapshot?: TCalc
  processSnapshot?: DevelopmentProcessSnapshot
}

/**
 * Captures calculator metadata once per timer session so later selection edits
 * cannot corrupt scalar diary columns.
 */
export function freezeCalcSnapshot<TCalc>(
  store: Map<DevelopmentSessionId, DiarySessionLogEntry<TCalc>>,
  sessionId: DevelopmentSessionId,
  calcSnapshot: TCalc | null | undefined,
): TCalc | null {
  if (calcSnapshot == null) return null
  const existing = store.get(sessionId)
  if (existing?.calcSnapshot) return existing.calcSnapshot
  const entry = existing ?? {}
  entry.calcSnapshot = calcSnapshot
  store.set(sessionId, entry)
  return calcSnapshot
}

/**
 * Captures the process snapshot once per timer session so later process edits
 * (or a mismatched completion callback) cannot corrupt `process_snapshot`.
 */
export function freezeProcessSnapshot<TCalc>(
  store: Map<DevelopmentSessionId, DiarySessionLogEntry<TCalc>>,
  sessionId: DevelopmentSessionId,
  processSnapshot: DevelopmentProcessSnapshot,
): DevelopmentProcessSnapshot {
  const existing = store.get(sessionId)
  if (existing?.processSnapshot) return existing.processSnapshot
  const entry = existing ?? {}
  entry.processSnapshot = processSnapshot
  store.set(sessionId, entry)
  return processSnapshot
}

export function getCompleteFrozenContext<TCalc>(
  store: Map<DevelopmentSessionId, DiarySessionLogEntry<TCalc>>,
  sessionId: DevelopmentSessionId,
): FrozenDiarySessionLogContext<TCalc> | null {
  const entry = store.get(sessionId)
  if (!entry?.calcSnapshot || !entry?.processSnapshot) return null
  return {
    calcSnapshot: entry.calcSnapshot,
    processSnapshot: entry.processSnapshot,
  }
}

/**
 * Captures calculator metadata and the dev-step process snapshot once per timer
 * session so later selection edits (or process edits before a retry) cannot
 * corrupt the diary row.
 */
export function ensureFrozenDiarySessionLogContext<TCalc>(
  store: Map<DevelopmentSessionId, DiarySessionLogEntry<TCalc>>,
  sessionId: DevelopmentSessionId,
  processSnapshot: DevelopmentProcessSnapshot,
  calcSnapshot: TCalc | null | undefined,
): FrozenDiarySessionLogContext<TCalc> | null {
  const calc = freezeCalcSnapshot(store, sessionId, calcSnapshot)
  if (!calc) return null
  freezeProcessSnapshot(store, sessionId, processSnapshot)
  return getCompleteFrozenContext(store, sessionId)
}

/**
 * Process-only freeze for timer/recipe routes where scalar metadata is static.
 */
export function freezeProcessSnapshotOnly(
  store: Map<DevelopmentSessionId, DevelopmentProcessSnapshot>,
  sessionId: DevelopmentSessionId,
  processSnapshot: DevelopmentProcessSnapshot,
): DevelopmentProcessSnapshot {
  const existing = store.get(sessionId)
  if (existing) return existing
  store.set(sessionId, processSnapshot)
  return processSnapshot
}
