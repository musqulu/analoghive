"use client"

import * as React from "react"
import { DiaryCompletionDialog } from "@/components/development-diary/completion-dialog"
import { Timer } from "@/components/ui/timer"
import { logDevelopmentRun } from "@/lib/log-development-run"
import type { FilmFormat } from "@/types/development"
import type {
  DevelopmentProcessSnapshot,
  DiaryCompletionSummary,
} from "@/types/development-log"

export function TimerPageWithDiary({
  filmName,
  filmFormat,
  filmIso,
  developerName,
  developerDilution,
  developmentTime,
  temperature,
  totalVolume,
  recipeId,
  favoriteId,
  optionKeyParam,
  tempUnitParam,
  pushPullParam,
  replaySnapshot,
}: {
  filmName: string
  filmFormat: FilmFormat
  filmIso: string
  developerName: string
  developerDilution: string
  developmentTime: number
  temperature: number
  totalVolume: number
  recipeId: string | null
  favoriteId: string | null
  optionKeyParam: string | null
  tempUnitParam: string | null
  pushPullParam: string | null
  /** Decoded diary “Run again” hydration; null keeps default timer steps. */
  replaySnapshot?: DevelopmentProcessSnapshot | null
}) {
  const loggedRef = React.useRef(false)
  const logEntryIdRef = React.useRef<string | null>(null)
  const [celebrateOpen, setCelebrateOpen] = React.useState(false)
  const [celebrateLogId, setCelebrateLogId] = React.useState<string | null>(null)
  const [celebrateProcessSnapshot, setCelebrateProcessSnapshot] =
    React.useState<DevelopmentProcessSnapshot | null>(null)

  const summary = React.useMemo<DiaryCompletionSummary>(
    () => ({
      film_name: filmName,
      film_format: filmFormat,
      film_iso: filmIso,
      developer_name: developerName,
      option_key:
        optionKeyParam ??
        (developerDilution ? `${developerDilution}|${temperature}` : `|${temperature}`),
      total_volume: Number.isFinite(totalVolume) ? totalVolume : null,
      temperature_unit:
        tempUnitParam === "fahrenheit"
          ? "fahrenheit"
          : tempUnitParam === "celsius"
            ? "celsius"
            : null,
      modified_temperature: Number.isFinite(temperature) ? temperature : null,
      push_pull_stops:
        pushPullParam !== null && Number.isFinite(Number(pushPullParam))
          ? Number(pushPullParam)
          : null,
    }),
    [
      filmName,
      filmFormat,
      filmIso,
      developerName,
      developerDilution,
      optionKeyParam,
      tempUnitParam,
      temperature,
      totalVolume,
      pushPullParam,
    ],
  )

  const handleDevComplete = React.useCallback(
    (processSnapshot: DevelopmentProcessSnapshot) => {
      if (loggedRef.current) return
      loggedRef.current = true
      void (async () => {
        const res = await logDevelopmentRun({
          film_name: filmName,
          film_format: filmFormat,
          film_iso: filmIso,
          developer_name: developerName,
          option_key:
            optionKeyParam ??
            (developerDilution ? `${developerDilution}|${temperature}` : `|${temperature}`),
          total_volume: Number.isFinite(totalVolume) ? totalVolume : null,
          temperature_unit:
            tempUnitParam === "fahrenheit"
              ? "fahrenheit"
              : tempUnitParam === "celsius"
                ? "celsius"
                : null,
          modified_temperature: Number.isFinite(temperature) ? temperature : null,
          push_pull_stops:
            pushPullParam !== null && Number.isFinite(Number(pushPullParam))
              ? Number(pushPullParam)
              : null,
          recipe_id: recipeId,
          favorite_id: favoriteId,
          process_snapshot: processSnapshot,
        })
        if (res) {
          logEntryIdRef.current = res.id
          setCelebrateLogId(res.id)
        } else loggedRef.current = false
      })()
    },
    [
    filmName,
    filmFormat,
    filmIso,
    developerName,
    developerDilution,
    optionKeyParam,
    tempUnitParam,
    pushPullParam,
    temperature,
    totalVolume,
    recipeId,
    favoriteId,
  ])

  const handleProcessComplete = React.useCallback(
    (processSnapshot: DevelopmentProcessSnapshot) => {
      setCelebrateProcessSnapshot(processSnapshot)
      setCelebrateLogId(logEntryIdRef.current)
      setCelebrateOpen(true)
    },
    [],
  )

  const handleCelebrateOpenChange = React.useCallback((open: boolean) => {
    setCelebrateOpen(open)
    if (!open) setCelebrateProcessSnapshot(null)
  }, [])

  return (
    <>
      <DiaryCompletionDialog
        open={celebrateOpen}
        onOpenChange={handleCelebrateOpenChange}
        logEntryId={celebrateLogId}
        summary={{ ...summary, process_snapshot: celebrateProcessSnapshot ?? undefined }}
      />
      <Timer
        filmName={filmName}
        filmFormat={filmFormat}
        filmIso={filmIso}
        developerName={developerName}
        developerDilution={developerDilution}
        developmentTime={developmentTime}
        temperature={temperature}
        totalVolume={totalVolume}
        temperatureUnit={tempUnitParam ?? undefined}
        isColor={replaySnapshot?.isColor ?? false}
        initialProcessTimes={replaySnapshot?.processTimes}
        initialWashingMethod={replaySnapshot?.washingMethod}
        onDevComplete={handleDevComplete}
        onProcessComplete={handleProcessComplete}
      />
    </>
  )
}
