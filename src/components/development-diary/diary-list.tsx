"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FilmFormatIcon } from "@/components/film-format-icon"
import { DiaryEntryEditDialog } from "@/components/development-diary/diary-entry-edit-dialog"
import { buildDiaryTimerReplayHref } from "@/lib/diary-timer-replay"
import {
  LISTING_CARD_DIVIDER,
  LISTING_CARD_ICON_WRAP,
  LISTING_CARD_OPEN_LINK,
  LISTING_CARD_PILL,
  LISTING_CARD_ROOT,
} from "@/constants/listing-card-classes"
import { parseDevelopmentProcessSnapshot } from "@/lib/process-snapshot"
import { formatTime } from "@/utils/format-time"
import { normalizeDilutionDisplay } from "@/utils/normalize-dilution"
import type { DevelopmentLogEntryRow } from "@/types/development-log"

function diaryLoggedDateShort(iso: string): string {
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso.slice(0, 10)
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    })
  } catch {
    return iso.slice(0, 10)
  }
}

function dilutionFromOptionKey(optionKey: string): string {
  const pipe = optionKey.indexOf("|")
  const raw = pipe === -1 ? optionKey : optionKey.slice(0, pipe)
  return raw.trim() ? normalizeDilutionDisplay(raw.trim()) : "—"
}

function notesPreview(notes: string | null, max = 120): string | null {
  if (!notes?.trim()) return null
  const t = notes.trim()
  return t.length <= max ? t : `${t.slice(0, max).trim()}…`
}

function diaryPills(entry: DevelopmentLogEntryRow): string[] {
  const snap = parseDevelopmentProcessSnapshot(entry.process_snapshot)
  const pills: string[] = []

  pills.push(entry.film_format)

  const isoTrim = entry.film_iso.trim()
  if (isoTrim) pills.push(`ISO ${isoTrim}`)

  if (snap) {
    const u = snap.temperatureUnit === "fahrenheit" ? "°F" : "°C"
    pills.push(`${snap.temperatures.dev}${u}`)
    if (snap.totalVolume != null && Number.isFinite(snap.totalVolume)) {
      pills.push(`${snap.totalVolume} ml`)
    }
    const d = snap.developerDilution?.trim()
    pills.push(d ? normalizeDilutionDisplay(d) : dilutionFromOptionKey(entry.option_key))
    pills.push(snap.isColor ? "Color" : "BW")
    return pills
  }

  if (entry.temperature_unit === "celsius" || entry.temperature_unit === "fahrenheit") {
    const mod =
      entry.modified_temperature !== null &&
      entry.modified_temperature !== "" &&
      Number.isFinite(Number(entry.modified_temperature))
        ? Number(entry.modified_temperature)
        : null
    const u = entry.temperature_unit === "fahrenheit" ? "°F" : "°C"
    if (mod !== null) pills.push(`${mod}${u}`)
  }

  if (
    entry.total_volume !== null &&
    Number.isFinite(entry.total_volume) &&
    entry.total_volume > 0
  ) {
    pills.push(`${entry.total_volume} ml`)
  }

  pills.push(dilutionFromOptionKey(entry.option_key))

  if (
    entry.push_pull_stops !== null &&
    Number.isFinite(entry.push_pull_stops) &&
    entry.push_pull_stops !== 0
  ) {
    const s = entry.push_pull_stops
    pills.push(`Push/pull ${s > 0 ? "+" : ""}${s}`)
  }

  return pills
}

export function DiaryList({ entries }: { entries: DevelopmentLogEntryRow[] }) {
  const router = useRouter()
  const refresh = React.useCallback(() => router.refresh(), [router])

  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground shadow-ds-card-lg">
        <p className="font-medium text-foreground">No diary entries yet</p>
        <p className="mt-2">
          Run the development timer through to the end while signed in. After the wash step,
          you can add a title and notes for each roll.
        </p>
      </div>
    )
  }

  return (
    <ul className="flex flex-col gap-4">
      {entries.map((entry) => {
        const preview = notesPreview(entry.notes)
        const snap = parseDevelopmentProcessSnapshot(entry.process_snapshot)
        const filmLabel = entry.film_name.trim() || "—"
        const loggedShort = diaryLoggedDateShort(entry.created_at)
        const devTimeSeconds =
          snap != null ? Math.round(snap.developmentTimeMinutes * 60) : null
        const timeDisplay =
          devTimeSeconds != null && Number.isFinite(devTimeSeconds)
            ? formatTime(devTimeSeconds)
            : null
        const titleTrim = entry.title?.trim()

        return (
          <li key={entry.id} className={LISTING_CARD_ROOT}>
            <div className="flex items-start justify-between gap-3">
              <div className={LISTING_CARD_ICON_WRAP} aria-hidden>
                <FilmFormatIcon format={entry.film_format} className="h-5 w-5" />
              </div>
              <DiaryEntryEditDialog entry={entry} onUpdated={refresh} />
            </div>

            <div className="mt-5 flex min-w-0 flex-col gap-3">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <p className="font-semibold text-foreground">{filmLabel}</p>
                {timeDisplay ? (
                  <p className="text-sm tabular-nums text-muted-foreground">{timeDisplay}</p>
                ) : null}
              </div>

              {titleTrim ? (
                <p className="break-words text-xl font-semibold leading-snug tracking-tight text-foreground">
                  {titleTrim}
                </p>
              ) : null}

              <div className="flex flex-wrap gap-2">
                {diaryPills(entry).map((label, index) => (
                  <span key={`${entry.id}-pill-${index}`} className={LISTING_CARD_PILL}>
                    {label}
                  </span>
                ))}
              </div>

              {preview ? (
                <p className="text-sm text-muted-foreground line-clamp-2">{preview}</p>
              ) : null}
            </div>

            <div className={LISTING_CARD_DIVIDER} />

            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-base font-semibold text-foreground">
                  {entry.developer_name.trim() || "—"}
                </p>
                <p className="text-sm leading-snug text-muted-foreground">
                  {filmLabel} ({entry.film_format || "—"}) ·{" "}
                  {dilutionFromOptionKey(entry.option_key) || "—"} · Logged {loggedShort} (UTC)
                </p>
              </div>
              <Link
                href={buildDiaryTimerReplayHref(entry)}
                className={LISTING_CARD_OPEN_LINK}
                aria-label={`Run development timer again for ${entry.film_name}`}
              >
                Run again
              </Link>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
