"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { useDevelopmentSelection } from "@/hooks/use-development-selection"
import { useCorrectedTime } from "@/hooks/use-corrected-time"
import { FilmDeveloperForm } from "@/components/develop/film-developer-form"
import { DevelopmentSummary } from "@/components/develop/development-summary"
import { TemperatureCorrection } from "@/components/develop/temperature-correction"
import { VolumeMixer } from "@/components/ui/volume-mixer"
import { Timer, type DevelopmentSessionId } from "@/components/ui/timer"
import {
  SaveFavoriteButton,
  buildDiaryCalcSnapshotFromCalculator,
  buildFavoriteSnapshotFromCalculator,
} from "@/components/develop/save-favorite-button"
import { CreateRecipeFromButton } from "@/components/develop/create-recipe-button"
import { parseDevelopFavoriteSearchParams } from "@/lib/favorite-develop-query"
import { createDiarySessionLogTracker } from "@/lib/diary-session-logging"
import {
  freezeCalcSnapshot,
  freezeProcessSnapshot,
  getCompleteFrozenContext,
  type DiarySessionLogEntry,
} from "@/lib/diary-session-log-context"
import { logDevelopmentRun } from "@/lib/log-development-run"
import type { DevelopmentFavoriteSnapshot } from "@/types/favorite"
import { DiaryCompletionDialog } from "@/components/development-diary/completion-dialog"
import { cn } from "@/lib/utils"
import { mainGutterX, mainUnderNav, pageTitle } from "@/lib/app-page-layout"
import type {
  DevelopmentProcessSnapshot,
  DiaryCompletionSummary,
} from "@/types/development-log"

export function DevelopCalculator() {
  const searchParams = useSearchParams()
  const searchKey = searchParams.toString()
  const hydration = React.useMemo(
    () => parseDevelopFavoriteSearchParams(new URLSearchParams(searchKey)),
    [searchKey],
  )

  const selection = useDevelopmentSelection(hydration)
  const correction = useCorrectedTime(selection.selectedInfo, hydration)
  const [totalVolume, setTotalVolume] = React.useState(500)

  React.useLayoutEffect(() => {
    if (hydration) setTotalVolume(hydration.totalVolume)
  }, [hydration])

  const isColor = selection.selectedFilmData?.type === "Color"

  const calculatorSelectionReady =
    Boolean(
      selection.developmentInfo &&
        selection.selectedIso &&
        selection.selectedDilution &&
        selection.selectedInfo,
    )
  const selectedInfo = selection.selectedInfo

  const calculatorSnapshotProps = selectedInfo
    ? {
        filmName: selection.selectedFilm,
        filmFormat: selection.selectedFormat,
        filmIso: selection.selectedIso,
        developerName: selection.selectedDeveloper,
        optionKey: selectedInfo.optionKey,
        pushPullStops: selection.pushPullStops,
        totalVolume,
        temperatureUnit: correction.temperatureUnit,
        constantAgitation: correction.constantAgitation,
        chartTemperature: selectedInfo.temperature,
        chartTimeMinutes: selectedInfo.time,
      }
    : null

  const favoriteSnapshot =
    calculatorSelectionReady &&
    correction.modifiedTemperature !== null &&
    calculatorSnapshotProps
      ? buildFavoriteSnapshotFromCalculator({
          ...calculatorSnapshotProps,
          modifiedTemperature: correction.modifiedTemperature,
          correctedTimeMinutes:
            correction.correctedTime ?? calculatorSnapshotProps.chartTimeMinutes,
        })
      : null

  const diaryCalcSnapshot =
    calculatorSelectionReady && calculatorSnapshotProps
      ? buildDiaryCalcSnapshotFromCalculator({
          ...calculatorSnapshotProps,
          modifiedTemperature: correction.modifiedTemperature,
          correctedTimeMinutes: correction.correctedTime,
        })
      : null

  const snapshotRef = React.useRef(diaryCalcSnapshot)
  React.useEffect(() => {
    snapshotRef.current = diaryCalcSnapshot
  }, [diaryCalcSnapshot])

  type CalcSnapshot = DevelopmentFavoriteSnapshot & { correctedTimeMinutes: number }
  const sessionLogContextRef = React.useRef(
    new Map<DevelopmentSessionId, DiarySessionLogEntry<CalcSnapshot>>(),
  )

  const logTrackerRef = React.useRef(createDiarySessionLogTracker())
  const celebrateSessionRef = React.useRef<DevelopmentSessionId | null>(null)
  const [celebrateSessionId, setCelebrateSessionId] =
    React.useState<DevelopmentSessionId | null>(null)
  const [celebrateOpen, setCelebrateOpen] = React.useState(false)
  const [celebrateLogId, setCelebrateLogId] = React.useState<string | null>(null)
  const [celebrateProcessSnapshot, setCelebrateProcessSnapshot] =
    React.useState<DevelopmentProcessSnapshot | null>(null)
  const [celebrateDiarySummary, setCelebrateDiarySummary] =
    React.useState<DiaryCompletionSummary | null>(null)
  const [selectionLocked, setSelectionLocked] = React.useState(false)

  const buildLogFn = React.useCallback(
    (ctx: { calcSnapshot: CalcSnapshot; processSnapshot: DevelopmentProcessSnapshot }) => () =>
      logDevelopmentRun({
        film_name: ctx.calcSnapshot.filmName,
        film_format: ctx.calcSnapshot.filmFormat,
        film_iso: ctx.calcSnapshot.filmIso,
        developer_name: ctx.calcSnapshot.developerName,
        option_key: ctx.calcSnapshot.optionKey,
        total_volume: ctx.calcSnapshot.totalVolume,
        temperature_unit: ctx.calcSnapshot.temperatureUnit,
        modified_temperature: ctx.calcSnapshot.modifiedTemperature,
        push_pull_stops: ctx.calcSnapshot.pushPullStops,
        recipe_id: null,
        favorite_id: null,
        process_snapshot: ctx.processSnapshot,
      }),
    [],
  )

  const diarySummaryFromCalcSnapshot = React.useCallback(
    (snap: CalcSnapshot): DiaryCompletionSummary => ({
      film_name: snap.filmName,
      film_format: snap.filmFormat,
      film_iso: snap.filmIso,
      developer_name: snap.developerName,
      option_key: snap.optionKey,
      total_volume: snap.totalVolume,
      temperature_unit: snap.temperatureUnit,
      modified_temperature: snap.modifiedTemperature,
      push_pull_stops: snap.pushPullStops,
    }),
    [],
  )

  const onLogSuccess = React.useCallback((sessionId: DevelopmentSessionId, logId: string) => {
    if (celebrateSessionRef.current === sessionId) setCelebrateLogId(logId)
  }, [])

  const handleSessionStart = React.useCallback((sessionId: DevelopmentSessionId) => {
    freezeCalcSnapshot(sessionLogContextRef.current, sessionId, snapshotRef.current)
  }, [])

  const handleDevComplete = React.useCallback(
    (processSnapshot: DevelopmentProcessSnapshot, sessionId: DevelopmentSessionId) => {
      freezeCalcSnapshot(sessionLogContextRef.current, sessionId, snapshotRef.current)
      freezeProcessSnapshot(sessionLogContextRef.current, sessionId, processSnapshot)
      const ctx = getCompleteFrozenContext(sessionLogContextRef.current, sessionId)
      if (!ctx) return
      logTrackerRef.current.scheduleLog(sessionId, buildLogFn(ctx), (logId) =>
        onLogSuccess(sessionId, logId),
      )
    },
    [buildLogFn, onLogSuccess],
  )

  const handleProcessComplete = React.useCallback(
    (processSnapshot: DevelopmentProcessSnapshot, sessionId: DevelopmentSessionId) => {
      freezeCalcSnapshot(sessionLogContextRef.current, sessionId, snapshotRef.current)
      freezeProcessSnapshot(sessionLogContextRef.current, sessionId, processSnapshot)
      const ctx = getCompleteFrozenContext(sessionLogContextRef.current, sessionId)
      if (!ctx) return
      handleDevComplete(processSnapshot, sessionId)
      celebrateSessionRef.current = sessionId
      setCelebrateSessionId(sessionId)
      setCelebrateProcessSnapshot(ctx.processSnapshot)
      setCelebrateDiarySummary(diarySummaryFromCalcSnapshot(ctx.calcSnapshot))
      setCelebrateLogId(logTrackerRef.current.getLogEntryId(sessionId) ?? null)
      setCelebrateOpen(true)
      void logTrackerRef.current
        .ensureLogged(sessionId, buildLogFn(ctx), (logId) => onLogSuccess(sessionId, logId))
        .then(() => {
          if (celebrateSessionRef.current !== sessionId) return
          setCelebrateLogId(logTrackerRef.current.getLogEntryId(sessionId) ?? null)
        })
    },
    [buildLogFn, diarySummaryFromCalcSnapshot, handleDevComplete, onLogSuccess],
  )

  const handleCelebrateOpenChange = React.useCallback((open: boolean) => {
    setCelebrateOpen(open)
    if (!open) {
      const sessionId = celebrateSessionRef.current
      celebrateSessionRef.current = null
      setCelebrateSessionId(null)
      setCelebrateProcessSnapshot(null)
      setCelebrateDiarySummary(null)
      setSelectionLocked(false)
      if (sessionId) sessionLogContextRef.current.delete(sessionId)
    }
  }, [])

  const handleRollActiveChange = React.useCallback((active: boolean) => {
    setSelectionLocked(active)
  }, [])

  return (
    <main className={cn("flex flex-col items-center", mainUnderNav, mainGutterX)}>
      <div className="w-full max-w-md space-y-8">
        <h1 className={cn("mb-8", pageTitle)}>Develop Film</h1>

        <div className="space-y-8">
          <FilmDeveloperForm
            films={selection.films}
            selectedFilm={selection.selectedFilm}
            onFilmChange={selection.setSelectedFilm}
            selectedFormat={selection.selectedFormat}
            onFormatChange={selection.setSelectedFormat}
            availableFormats={selection.availableFormats}
            availableDevelopers={selection.availableDevelopers}
            selectedDeveloper={selection.selectedDeveloper}
            onDeveloperChange={selection.setSelectedDeveloper}
            selectedFilmData={selection.selectedFilmData}
            selectedDeveloperData={selection.selectedDeveloperData}
            selectedIso={selection.selectedIso}
            onIsoChange={selection.handleIsoChange}
            availableIsoValues={selection.availableIsoValues}
            ratingIso={selection.ratingIso}
            pushPullStops={selection.pushPullStops}
            onPushPullChange={selection.handlePushPullChange}
            temperatureUnit={correction.temperatureUnit}
            onTemperatureUnitChange={correction.handleTemperatureUnitChange}
            selectionLocked={selectionLocked}
          />

          <DevelopmentSummary
            selectedFilm={selection.selectedFilm}
            selectedIso={selection.selectedIso}
            isColor={isColor}
            selectedDeveloper={selection.selectedDeveloper}
            developmentInfo={selection.developmentInfo}
            selectedOptionKey={selection.selectedOptionKey}
            onOptionChange={selection.setSelectedOptionKey}
            temperatureUnit={correction.temperatureUnit}
            selectionLocked={selectionLocked}
          />

          {favoriteSnapshot ? (
            <div className="flex flex-wrap justify-end gap-2">
              <SaveFavoriteButton snapshot={favoriteSnapshot} />
              <CreateRecipeFromButton
                snapshot={favoriteSnapshot}
                isColor={isColor}
                chartReferenceNote={selection.selectedInfo?.approximateNote}
                pushPullLine={selection.pushPullLine}
              />
            </div>
          ) : null}

          {selection.developmentInfo &&
            selection.selectedIso &&
            selection.selectedDilution && (
              <>
                <div className="rounded-lg bg-card p-6 ds-card">
                  <h3 className="mb-4 text-lg font-medium">Volume Mixer</h3>
                  <VolumeMixer
                    dilution={selection.selectedDilution}
                    totalVolume={totalVolume}
                    onVolumeChange={setTotalVolume}
                  />
                </div>

                <TemperatureCorrection
                  selectedInfo={selection.selectedInfo}
                  temperatureUnit={correction.temperatureUnit}
                  modifiedTemperature={correction.modifiedTemperature}
                  onModifiedTemperatureChange={correction.setModifiedTemperature}
                  constantAgitation={correction.constantAgitation}
                  onConstantAgitationChange={correction.setConstantAgitation}
                  correctedTime={correction.correctedTime}
                  pushPullLine={selection.pushPullLine}
                />

                <div className="rounded-lg bg-card p-6 ds-card">
                  <DiaryCompletionDialog
                    open={celebrateOpen}
                    onOpenChange={handleCelebrateOpenChange}
                    logEntryId={celebrateLogId}
                    completionKey={celebrateSessionId}
                    summary={
                      celebrateDiarySummary
                        ? {
                            ...celebrateDiarySummary,
                            process_snapshot: celebrateProcessSnapshot ?? undefined,
                          }
                        : null
                    }
                  />
                  <Timer
                    filmName={selection.selectedFilm}
                    filmFormat={selection.selectedFormat}
                    filmIso={selection.selectedIso}
                    developerName={selection.selectedDeveloper}
                    developerDilution={selection.selectedDilution}
                    developmentTime={
                      correction.correctedTime !== null
                        ? correction.correctedTime
                        : selection.selectedInfo?.time || 0
                    }
                    temperature={
                      correction.modifiedTemperature ??
                      selection.selectedInfo?.temperature ??
                      20
                    }
                    totalVolume={totalVolume}
                    temperatureUnit={correction.temperatureUnit}
                    isColor={isColor}
                    onSessionStart={handleSessionStart}
                    onDevComplete={handleDevComplete}
                    onProcessComplete={handleProcessComplete}
                    onRollActiveChange={handleRollActiveChange}
                  />
                </div>
              </>
            )}
        </div>
      </div>
    </main>
  )
}
