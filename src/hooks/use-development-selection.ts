"use client"

import * as React from "react"
import { films, findFilmByName, getFilmFormats } from "@/data/processed-films"
import {
  developers,
  findDeveloperByName,
  Developer,
} from "@/data/processed-developers"
import {
  findDevelopmentTimes,
  findClosestIsoTime,
  developmentTimes,
} from "@/data/processed-development-times"
import { getRatingIso } from "@/data/film-box-speed"
import {
  resolveTimeFromRows,
  sourceToUserNote,
  formatPushPullLine,
} from "@/lib/approximate-development-time"
import { getPushPullAdjustedDevelopmentTime } from "@/lib/push-pull-adjusted-development-time"
import { findClosestAvailableIso } from "@/utils/available-chart-iso"
import type { FilmFormat, DevelopmentOption } from "@/types/development"
import type { DevelopmentFavoriteSnapshot } from "@/types/favorite"
import { resolveFavoriteOptionKey } from "@/lib/favorite-restore"

function getDilutionRatio(dilution: string): number {
  if (dilution === "stock" || dilution === "1:0") return 0
  const match = dilution.match(/\d+[:\+](\d+)/)
  if (!match) return 999
  return parseInt(match[1], 10)
}

function getAvailableDevelopersForFilm(
  filmId: string,
  format: FilmFormat
): Developer[] {
  if (!filmId) return []
  const developerIds = [
    ...new Set(
      developmentTimes
        .filter(
          (time) =>
            time.filmId === filmId &&
            (!format || !time.format || time.format === format)
        )
        .map((time) => time.developerId)
    ),
  ]
  return developerIds
    .map((id) => developers.find((dev) => dev.id === id))
    .filter((dev): dev is Developer => dev !== undefined)
}

export function useDevelopmentSelection(
  initialHydration: DevelopmentFavoriteSnapshot | null = null,
) {
  const [selectedFilm, setSelectedFilm] = React.useState("")
  const [selectedIso, setSelectedIso] = React.useState("")
  const [selectedFormat, setSelectedFormat] = React.useState<FilmFormat>("35mm")
  const [selectedDeveloper, setSelectedDeveloper] = React.useState("")
  const [selectedOptionKey, setSelectedOptionKey] = React.useState("")
  const [pushPullStops, setPushPullStops] = React.useState(0)
  const [availableDevelopers, setAvailableDevelopers] = React.useState<
    Developer[]
  >([])

  /** Snapshot for reconcile; cleared when URL has no hydration */
  const hydrationSnapshotRef = React.useRef<DevelopmentFavoriteSnapshot | null>(null)
  /** While true, film/dev reset effects must not wipe ISO / dilution (Strict Mode–safe) */
  const favoriteRestorePendingRef = React.useRef(false)
  const lastAppliedHydrationJsonRef = React.useRef<string | null>(null)

  React.useLayoutEffect(() => {
    if (!initialHydration) {
      hydrationSnapshotRef.current = null
      favoriteRestorePendingRef.current = false
      lastAppliedHydrationJsonRef.current = null
      return
    }
    const key = JSON.stringify(initialHydration)
    if (key === lastAppliedHydrationJsonRef.current) return
    lastAppliedHydrationJsonRef.current = key
    hydrationSnapshotRef.current = initialHydration
    favoriteRestorePendingRef.current = true
    setSelectedFilm(initialHydration.filmName)
    setSelectedFormat(initialHydration.filmFormat)
    setSelectedDeveloper(initialHydration.developerName)
    setSelectedIso(initialHydration.filmIso)
    setPushPullStops(initialHydration.pushPullStops)
    setSelectedOptionKey(initialHydration.optionKey)
  }, [initialHydration])

  const selectedFilmData = findFilmByName(selectedFilm)
  const selectedDeveloperData = findDeveloperByName(selectedDeveloper)

  const ratingIso = React.useMemo(
    () =>
      selectedFilmData
        ? getRatingIso(selectedFilmData.id, selectedFilmData.isos)
        : 400,
    [selectedFilmData]
  )

  const availableFormats = React.useMemo(
    () => (selectedFilmData ? getFilmFormats(selectedFilmData.id) : []),
    [selectedFilmData]
  )

  React.useEffect(() => {
    if (favoriteRestorePendingRef.current) return
    setSelectedIso("")
    setSelectedOptionKey("")
    setPushPullStops(0)
    if (availableFormats.length === 1) {
      setSelectedFormat(availableFormats[0])
    }
  }, [selectedFilm, availableFormats])

  React.useEffect(() => {
    if (favoriteRestorePendingRef.current) return
    setSelectedOptionKey("")
    setSelectedIso("")
    setPushPullStops(0)
  }, [selectedDeveloper, selectedFormat])

  const availableIsoValues = React.useMemo(() => {
    if (!selectedFilmData || !selectedDeveloperData) return []
    const t = findDevelopmentTimes(
      selectedFilmData.id,
      selectedDeveloperData.id,
      selectedFormat
    )
    return [
      ...new Set(
        t.filter((time) => time.iso !== null).map((time) => time.iso as number)
      ),
    ].sort((a, b) => a - b)
  }, [selectedFilmData, selectedDeveloperData, selectedFormat])

  /** Default to box speed: rated ISO in chart if present, else closest chart ISO; always 0 stops (no sync from log2). */
  React.useEffect(() => {
    if (favoriteRestorePendingRef.current) return
    if (!selectedFilmData || !selectedDeveloperData) return
    if (availableIsoValues.length === 0) return
    if (selectedIso !== "") return

    const preferred = availableIsoValues.includes(ratingIso)
      ? ratingIso
      : findClosestAvailableIso(ratingIso, availableIsoValues)
    if (preferred === null) return
    setSelectedIso(String(preferred))
    setPushPullStops(0)
  }, [
    selectedFilmData,
    selectedDeveloperData,
    availableIsoValues,
    ratingIso,
    selectedIso,
  ])

  const getDevelopmentInfo = React.useCallback(():
    | DevelopmentOption[]
    | DevelopmentOption
    | null => {
    if (!selectedFilmData || !selectedDeveloperData || !selectedIso) return null

    const filmId = selectedFilmData.id
    const developerId = selectedDeveloperData.id
    const iso = parseInt(selectedIso, 10)

    const times = findDevelopmentTimes(filmId, developerId, selectedFormat)
    const validTimes = times.filter((time) => time.iso !== null)
    if (validTimes.length === 0) return null

    const makeOptionKey = (dilution: string, temp: number) => `${dilution}|${temp}`

    const withNote = (
      dilution: string,
      resolved: ReturnType<typeof resolveTimeFromRows>
    ): DevelopmentOption => ({
      optionKey: makeOptionKey(dilution, resolved.temperature),
      dilution,
      time: resolved.time,
      temperature: resolved.temperature,
      timeSource: resolved.source,
      approximateNote: sourceToUserNote(resolved.source),
    })

    if (selectedFilmData.type === "Color") {
      const closest = findClosestIsoTime(validTimes, iso)
      if (!closest) return null
      const sameDilution = validTimes.filter(
        (t) => t.dilution === closest.dilution && t.iso !== null
      )
      const resolved = resolveTimeFromRows(sameDilution, iso)
      return withNote(closest.dilution, resolved)
    }

    const dilutionKeys = [
      ...new Set(validTimes.map((t) => t.dilution)),
    ] as string[]

    const targetEI = Math.round(ratingIso * Math.pow(2, pushPullStops))

    const options: DevelopmentOption[] = []
    for (const dilution of dilutionKeys) {
      const dilutionRows = validTimes.filter(
        (t) => t.dilution === dilution && t.iso !== null
      )
      if (dilutionRows.length === 0) continue

      const tempGroups = new Map<number, typeof dilutionRows>()
      for (const row of dilutionRows) {
        const existing = tempGroups.get(row.temperature)
        if (existing) existing.push(row)
        else tempGroups.set(row.temperature, [row])
      }

      for (const [temp, rows] of tempGroups) {
        if (pushPullStops === 0) {
          const resolved = resolveTimeFromRows(rows, ratingIso)
          options.push({
            optionKey: makeOptionKey(dilution, temp),
            dilution,
            time: resolved.time,
            temperature: resolved.temperature,
            timeSource: resolved.source,
            approximateNote: sourceToUserNote(resolved.source),
          })
        } else {
          const chartAtEI = resolveTimeFromRows(rows, targetEI)
          if (chartAtEI.source === "exact" || chartAtEI.source === "interpolated") {
            const stopsLabel = pushPullStops > 0 ? `+${pushPullStops}` : `${pushPullStops}`
            options.push({
              optionKey: makeOptionKey(dilution, temp),
              dilution,
              time: chartAtEI.time,
              temperature: chartAtEI.temperature,
              timeSource: chartAtEI.source,
              approximateNote: `${sourceToUserNote(chartAtEI.source)} (${stopsLabel} stop${Math.abs(pushPullStops) === 1 ? "" : "s"})`,
            })
          } else {
            const baseResolved = resolveTimeFromRows(rows, ratingIso)
            const pp = getPushPullAdjustedDevelopmentTime(
              baseResolved.time,
              pushPullStops
            )
            const chartNote = sourceToUserNote(baseResolved.source)
            const stopsLabel = pp.stopsApplied > 0 ? `+${pp.stopsApplied}` : `${pp.stopsApplied}`
            options.push({
              optionKey: makeOptionKey(dilution, temp),
              dilution,
              time: pp.adjustedMinutes,
              temperature: baseResolved.temperature,
              timeSource: baseResolved.source,
              approximateNote: `${chartNote} Approximate push/pull: ×${pp.factor.toFixed(2)} (${stopsLabel} stop${Math.abs(pp.stopsApplied) === 1 ? "" : "s"}).`,
            })
          }
        }
      }
    }

    if (options.length === 0) return null

    return options.sort((a, b) => {
      if (a.time !== b.time) return a.time - b.time
      return getDilutionRatio(a.dilution) - getDilutionRatio(b.dilution)
    })
  }, [
    selectedFilmData,
    selectedDeveloperData,
    selectedIso,
    selectedFormat,
    ratingIso,
    pushPullStops,
  ])

  const developmentInfo = getDevelopmentInfo()

  const selectedInfo =
    developmentInfo && Array.isArray(developmentInfo)
      ? developmentInfo.find((info) => info.optionKey === selectedOptionKey)
      : developmentInfo

  const selectedDilution = selectedInfo?.dilution ?? ""

  /**
   * After chart options exist, re-apply saved dilution/ISO/push-pull from the snapshot.
   * Does not clear favoriteRestorePendingRef here — that runs in a follow-up effect after state commits
   * so "pick first dilution" cannot overwrite during the same effect pass.
   */
  React.useEffect(() => {
    const snap = hydrationSnapshotRef.current
    if (!snap || !favoriteRestorePendingRef.current) return
    if (!developmentInfo) return
    const resolved = resolveFavoriteOptionKey(snap, developmentInfo)
    if (!resolved) {
      favoriteRestorePendingRef.current = false
      return
    }
    setSelectedOptionKey(resolved)
    setSelectedIso(snap.filmIso)
    setPushPullStops(snap.pushPullStops)
  }, [developmentInfo])

  /**
   * End restore only after chart options exist and the dilution row matches the snapshot
   * (avoids reset effects running before `developmentInfo` is ready — e.g. Strict Mode).
   */
  React.useEffect(() => {
    const snap = hydrationSnapshotRef.current
    if (!snap || !favoriteRestorePendingRef.current) return
    if (!developmentInfo) return
    if (!resolveFavoriteOptionKey(snap, developmentInfo)) {
      favoriteRestorePendingRef.current = false
      return
    }
    if (selectedOptionKey === snap.optionKey) {
      favoriteRestorePendingRef.current = false
    }
  }, [selectedOptionKey, developmentInfo])

  React.useEffect(() => {
    if (favoriteRestorePendingRef.current) return
    if (
      developmentInfo &&
      Array.isArray(developmentInfo) &&
      developmentInfo.length > 0 &&
      !selectedOptionKey
    ) {
      setSelectedOptionKey(developmentInfo[0].optionKey)
    }
  }, [developmentInfo, selectedOptionKey])

  React.useEffect(() => {
    if (selectedFilmData) {
      const devs = getAvailableDevelopersForFilm(
        selectedFilmData.id,
        selectedFormat
      )
      setAvailableDevelopers(devs)
      if (
        selectedDeveloper &&
        !devs.some((dev) => dev.name === selectedDeveloper)
      ) {
        setSelectedDeveloper("")
        setSelectedIso("")
        setSelectedOptionKey("")
        setPushPullStops(0)
      }
    } else {
      setAvailableDevelopers([])
    }
  }, [selectedFilmData, selectedFormat, selectedDeveloper])

  const pushPullLine = React.useMemo(() => {
    if (!selectedIso) return ""
    const ei = parseInt(selectedIso, 10)
    if (!ei) return ""
    return formatPushPullLine(pushPullStops, ei, ratingIso)
  }, [selectedIso, pushPullStops, ratingIso])

  const handlePushPullChange = React.useCallback(
    (stops: number, iso: string) => {
      setPushPullStops(stops)
      setSelectedIso(iso)
    },
    []
  )

  /** When the user changes ISO via the dropdown, keep push/pull stops in sync with EI vs rated. */
  const handleIsoChange = React.useCallback(
    (iso: string) => {
      setSelectedIso(iso)
      const n = parseInt(iso, 10)
      if (!selectedFilmData || !n || !ratingIso) return
      const s = Math.round(Math.log2(n / ratingIso))
      setPushPullStops(Math.max(-2, Math.min(2, s)))
    },
    [selectedFilmData, ratingIso]
  )

  return {
    selectedFilm,
    setSelectedFilm,
    selectedIso,
    handleIsoChange,
    selectedFormat,
    setSelectedFormat,
    selectedDeveloper,
    setSelectedDeveloper,
    selectedDilution,
    selectedOptionKey,
    setSelectedOptionKey,
    selectedFilmData,
    selectedDeveloperData,
    availableFormats,
    availableDevelopers,
    availableIsoValues,
    developmentInfo,
    selectedInfo,
    films,
    ratingIso,
    pushPullStops,
    pushPullLine,
    handlePushPullChange,
  }
}
