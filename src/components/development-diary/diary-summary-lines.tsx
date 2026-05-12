"use client"

import { normalizeDilutionDisplay } from "@/utils/normalize-dilution"
import type { DiaryCompletionSummary } from "@/types/development-log"
import { diaryProcessLinesFromSnapshot } from "@/lib/diary-process-display"

export function DiarySummaryLines({ summary }: { summary: DiaryCompletionSummary }) {
  const pipe = summary.option_key.indexOf("|")
  const rawDilution = (pipe === -1 ? summary.option_key : summary.option_key.slice(0, pipe)).trim()
  const tailAfterPipe = pipe === -1 ? "" : summary.option_key.slice(pipe + 1).trim()
  const dilutionShown = rawDilution ? normalizeDilutionDisplay(rawDilution) : "—"

  const tempShown =
    summary.modified_temperature != null &&
    summary.temperature_unit != null &&
    Number.isFinite(summary.modified_temperature)
      ? `${summary.modified_temperature}°${summary.temperature_unit === "celsius" ? "C" : "F"}`
      : tailAfterPipe.length > 0
        ? `${tailAfterPipe}° (from combo)`
        : null

  const push =
    summary.push_pull_stops != null &&
    summary.push_pull_stops !== 0 &&
    Number.isFinite(summary.push_pull_stops)
      ? `Push/pull ${summary.push_pull_stops > 0 ? "+" : ""}${summary.push_pull_stops} stops`
      : null

  const vol =
    summary.total_volume != null && Number.isFinite(summary.total_volume)
      ? `${summary.total_volume} ml`
      : null

  const processLines = summary.process_snapshot
    ? diaryProcessLinesFromSnapshot(summary.process_snapshot)
    : null

  return (
    <dl className="space-y-1.5 text-sm text-muted-foreground">
      <div>
        <dt className="sr-only">Film</dt>
        <dd className="text-foreground">
          {summary.film_name} ({summary.film_format})
          {summary.film_iso ? ` · ISO ${summary.film_iso}` : null}
        </dd>
      </div>
      <div>
        <dt className="sr-only">Developer</dt>
        <dd>
          {summary.developer_name}
          {dilutionShown ? ` · ${dilutionShown}` : null}
        </dd>
      </div>
      {tempShown ? (
        <div>
          <dt className="sr-only">Temperature</dt>
          <dd>{tempShown}</dd>
        </div>
      ) : null}
      {push ? (
        <div>
          <dt className="sr-only">Push or pull</dt>
          <dd>{push}</dd>
        </div>
      ) : null}
      {vol ? (
        <div>
          <dt className="sr-only">Volume</dt>
          <dd>{vol}</dd>
        </div>
      ) : null}
      {processLines ? (
        <>
          <div>
            <dt className="sr-only">Process</dt>
            <dd className="whitespace-pre-wrap pt-1">{processLines.primary}</dd>
          </div>
          {processLines.secondary ? (
            <div>
              <dt className="sr-only">Remaining steps</dt>
              <dd className="whitespace-pre-wrap">{processLines.secondary}</dd>
            </div>
          ) : null}
        </>
      ) : null}
    </dl>
  )
}
