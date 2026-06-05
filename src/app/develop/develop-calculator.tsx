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
  buildFavoriteSnapshotFromCalculator,
} from "@/components/develop/save-favorite-button"
import { CreateRecipeFromButton } from "@/components/develop/create-recipe-button"
import { parseDevelopFavoriteSearchParams } from "@/lib/favorite-develop-query"
import { logDevelopmentRun } from "@/lib/log-development-run"
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

  const favoriteSnapshot =
    selection.developmentInfo &&
    selection.selectedIso &&
    selection.selectedDilution &&
    selection.selectedInfo &&
    correction.modifiedTemperature !== null
      ? buildFavoriteSnapshotFromCalculator({
          filmName: selection.selectedFilm,
          filmFormat: selection.selectedFormat,
          filmIso: selection.selectedIso,
          developerName: selection.selectedDeveloper,
          optionKey: selection.selectedInfo.optionKey,
          pushPullStops: selection.pushPullStops,
          totalVolume,
          temperatureUnit: correction.temperatureUnit,
          modifiedTemperature: correction.modifiedTemperature,
          constantAgitation: correction.constantAgitation,
          correctedTimeMinutes:
            correction.correctedTime !== null
              ? correction.correctedTime
              : selection.selectedInfo.time,
        })
      : null

  // Mirror the latest snapshot into a ref so the auto-log callback (called from
  // useTimer's effect) always logs the values the user actually developed at,
  // not whatever was selected when the callback was first wired.
  const snapshotRef = React.useRef(favoriteSnapshot)
  React.useEffect(() => {
    snapshotRef.current = favoriteSnapshot
  }, [favoriteSnapshot])

  const diarySummary = React.useMemo<DiaryCompletionSummary | null>(() => {
    if (!favoriteSnapshot) return null
    return {
      film_name: favoriteSnapshot.filmName,
      film_format: favoriteSnapshot.filmFormat,
      film_iso: favoriteSnapshot.filmIso,
      developer_name: favoriteSnapshot.developerName,
      option_key: favoriteSnapshot.optionKey,
      total_volume: favoriteSnapshot.totalVolume,
      temperature_unit: favoriteSnapshot.temperatureUnit,
      modified_temperature: favoriteSnapshot.modifiedTemperature,
      push_pull_stops: favoriteSnapshot.pushPullStops,
    }
  }, [favoriteSnapshot])

  const loggedSessionsRef = React.useRef(new Set<DevelopmentSessionId>())
  const loggingSessionsRef = React.useRef(new Set<DevelopmentSessionId>())
  const logEntryIdsRef = React.useRef(new Map<DevelopmentSessionId, string>())
  const celebrateSessionRef = React.useRef<DevelopmentSessionId | null>(null)
  const [celebrateOpen, setCelebrateOpen] = React.useState(false)
  const [celebrateLogId, setCelebrateLogId] = React.useState<string | null>(null)
  const [celebrateProcessSnapshot, setCelebrateProcessSnapshot] =
    React.useState<DevelopmentProcessSnapshot | null>(null)

  const handleDevComplete = React.useCallback((processSnapshot: DevelopmentProcessSnapshot, sessionId: DevelopmentSessionId) => {
    if (
      loggedSessionsRef.current.has(sessionId) ||
      loggingSessionsRef.current.has(sessionId)
    ) {
      return
    }
    const snap = snapshotRef.current
    if (!snap) return
    loggingSessionsRef.current.add(sessionId)
    void logDevelopmentRun({
      film_name: snap.filmName,
      film_format: snap.filmFormat,
      film_iso: snap.filmIso,
      developer_name: snap.developerName,
      option_key: snap.optionKey,
      total_volume: snap.totalVolume,
      temperature_unit: snap.temperatureUnit,
      modified_temperature: snap.modifiedTemperature,
      push_pull_stops: snap.pushPullStops,
      recipe_id: null,
      favorite_id: null,
      process_snapshot: processSnapshot,
    }).then((res) => {
      loggingSessionsRef.current.delete(sessionId)
      if (res) {
        loggedSessionsRef.current.add(sessionId)
        logEntryIdsRef.current.set(sessionId, res.id)
        if (celebrateSessionRef.current === sessionId) setCelebrateLogId(res.id)
      }
    })
  }, [])

  const handleProcessComplete = React.useCallback(
    (processSnapshot: DevelopmentProcessSnapshot, sessionId: DevelopmentSessionId) => {
      handleDevComplete(processSnapshot, sessionId)
      celebrateSessionRef.current = sessionId
      setCelebrateProcessSnapshot(processSnapshot)
      setCelebrateLogId(logEntryIdsRef.current.get(sessionId) ?? null)
      setCelebrateOpen(true)
    },
    [handleDevComplete],
  )

  const handleCelebrateOpenChange = React.useCallback((open: boolean) => {
    setCelebrateOpen(open)
    if (!open) {
      celebrateSessionRef.current = null
      setCelebrateProcessSnapshot(null)
    }
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
                    summary={
                      diarySummary
                        ? { ...diarySummary, process_snapshot: celebrateProcessSnapshot ?? undefined }
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
                    onDevComplete={handleDevComplete}
                    onProcessComplete={handleProcessComplete}
                  />
                </div>
              </>
            )}
        </div>
      </div>
    </main>
  )
}
