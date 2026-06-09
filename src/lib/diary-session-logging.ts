import type { DevelopmentSessionId } from "@/components/ui/timer"

export type DiaryLogInsertResult = { id: string } | null

export type DiarySessionLogTracker = {
  hasLogged: (sessionId: DevelopmentSessionId) => boolean
  getLogEntryId: (sessionId: DevelopmentSessionId) => string | undefined
  scheduleLog: (
    sessionId: DevelopmentSessionId,
    logFn: () => Promise<DiaryLogInsertResult>,
    onSuccess?: (logId: string) => void,
  ) => void
  ensureLogged: (
    sessionId: DevelopmentSessionId,
    logFn: () => Promise<DiaryLogInsertResult>,
    onSuccess?: (logId: string) => void,
  ) => Promise<void>
}

export function createDiarySessionLogTracker(): DiarySessionLogTracker {
  const loggedSessions = new Set<DevelopmentSessionId>()
  const loggingSessions = new Set<DevelopmentSessionId>()
  const logEntryIds = new Map<DevelopmentSessionId, string>()
  const logPromises = new Map<DevelopmentSessionId, Promise<void>>()

  const scheduleLog: DiarySessionLogTracker["scheduleLog"] = (sessionId, logFn, onSuccess) => {
    if (loggedSessions.has(sessionId) || logPromises.has(sessionId)) return

    const promise = (async () => {
      loggingSessions.add(sessionId)
      try {
        const res = await logFn()
        if (res?.id) {
          loggedSessions.add(sessionId)
          logEntryIds.set(sessionId, res.id)
          onSuccess?.(res.id)
        }
      } finally {
        loggingSessions.delete(sessionId)
      }
    })()

    logPromises.set(sessionId, promise)
    void promise.finally(() => {
      logPromises.delete(sessionId)
    })
  }

  const ensureLogged: DiarySessionLogTracker["ensureLogged"] = async (
    sessionId,
    logFn,
    onSuccess,
  ) => {
    scheduleLog(sessionId, logFn, onSuccess)
    const inflight = logPromises.get(sessionId)
    if (inflight) await inflight
    if (!loggedSessions.has(sessionId)) {
      scheduleLog(sessionId, logFn, onSuccess)
      const retry = logPromises.get(sessionId)
      if (retry) await retry
    }
  }

  return {
    hasLogged: (sessionId) => loggedSessions.has(sessionId),
    getLogEntryId: (sessionId) => logEntryIds.get(sessionId),
    scheduleLog,
    ensureLogged,
  }
}
