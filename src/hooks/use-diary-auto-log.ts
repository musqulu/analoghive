"use client"

import * as React from "react"
import type { DevelopmentSessionId } from "@/components/ui/timer"
import { logDevelopmentRun } from "@/lib/log-development-run"
import type {
  DevelopmentLogInsert,
  DevelopmentProcessSnapshot,
} from "@/types/development-log"

type LogPayload = Omit<DevelopmentLogInsert, "user_id">

export function useDiaryAutoLog(
  buildLogPayload: (processSnapshot: DevelopmentProcessSnapshot) => LogPayload | null,
) {
  const loggedSessionsRef = React.useRef(new Set<DevelopmentSessionId>())
  const pendingLogsRef = React.useRef(
    new Map<DevelopmentSessionId, Promise<string | null>>(),
  )
  const logEntryIdsRef = React.useRef(new Map<DevelopmentSessionId, string>())
  const celebrateSessionRef = React.useRef<DevelopmentSessionId | null>(null)
  const [celebrateOpen, setCelebrateOpen] = React.useState(false)
  const [celebrateLogId, setCelebrateLogId] = React.useState<string | null>(null)
  const [celebrateProcessSnapshot, setCelebrateProcessSnapshot] =
    React.useState<DevelopmentProcessSnapshot | null>(null)

  const runLog = React.useCallback(
    async (
      processSnapshot: DevelopmentProcessSnapshot,
      sessionId: DevelopmentSessionId,
    ): Promise<string | null> => {
      if (loggedSessionsRef.current.has(sessionId)) {
        return logEntryIdsRef.current.get(sessionId) ?? null
      }

      const inFlight = pendingLogsRef.current.get(sessionId)
      if (inFlight) return inFlight

      const payload = buildLogPayload(processSnapshot)
      if (!payload) return null

      const promise = logDevelopmentRun(payload)
        .then((res) => {
          if (res) {
            loggedSessionsRef.current.add(sessionId)
            logEntryIdsRef.current.set(sessionId, res.id)
            if (celebrateSessionRef.current === sessionId) {
              setCelebrateLogId(res.id)
            }
            return res.id
          }
          return null
        })
        .finally(() => {
          pendingLogsRef.current.delete(sessionId)
        })

      pendingLogsRef.current.set(sessionId, promise)
      return promise
    },
    [buildLogPayload],
  )

  const handleDevComplete = React.useCallback(
    (processSnapshot: DevelopmentProcessSnapshot, sessionId: DevelopmentSessionId) => {
      void runLog(processSnapshot, sessionId)
    },
    [runLog],
  )

  const handleProcessComplete = React.useCallback(
    (processSnapshot: DevelopmentProcessSnapshot, sessionId: DevelopmentSessionId) => {
      celebrateSessionRef.current = sessionId
      setCelebrateProcessSnapshot(processSnapshot)
      setCelebrateLogId(logEntryIdsRef.current.get(sessionId) ?? null)
      setCelebrateOpen(true)

      void (async () => {
        let logId = await runLog(processSnapshot, sessionId)
        if (!logId) {
          logId = await runLog(processSnapshot, sessionId)
        }
        setCelebrateLogId(logId)
      })()
    },
    [runLog],
  )

  const handleCelebrateOpenChange = React.useCallback((open: boolean) => {
    setCelebrateOpen(open)
    if (!open) {
      celebrateSessionRef.current = null
      setCelebrateProcessSnapshot(null)
    }
  }, [])

  return {
    celebrateOpen,
    celebrateLogId,
    celebrateProcessSnapshot,
    handleDevComplete,
    handleProcessComplete,
    handleCelebrateOpenChange,
  }
}
