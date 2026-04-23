"use client"

import * as React from "react"
import { displayTemp } from "@/utils/temperature"
import { formatTime } from "@/utils/format-time"
import { cn } from "@/lib/utils"
import type { DevelopmentOption, FilmFormat } from "@/types/development"

interface TemperatureCorrectionProps {
  selectedInfo: DevelopmentOption | undefined | null
  temperatureUnit: string
  modifiedTemperature: number | null
  onModifiedTemperatureChange: (value: number | null) => void
  constantAgitation: boolean
  onConstantAgitationChange: (value: boolean) => void
  correctedTime: number | null
  selectedFilm: string
  selectedFormat: FilmFormat
  selectedIso: string
  selectedDeveloper: string
  selectedDilution: string
  pushPullLine: string
}

function parseTemperatureInput(raw: string): number | null {
  const t = raw.trim().replace(",", ".")
  if (
    t === "" ||
    t === "-" ||
    t === "." ||
    t === "-." ||
    t === "+"
  ) {
    return null
  }
  const n = Number.parseFloat(t)
  return Number.isFinite(n) ? n : null
}

export function TemperatureCorrection({
  selectedInfo,
  temperatureUnit,
  modifiedTemperature,
  onModifiedTemperatureChange,
  constantAgitation,
  onConstantAgitationChange,
  correctedTime,
  selectedFilm,
  selectedFormat,
  selectedIso,
  selectedDeveloper,
  selectedDilution,
  pushPullLine,
}: TemperatureCorrectionProps) {
  const focusedRef = React.useRef(false)
  const optionKey = selectedInfo?.optionKey

  const [text, setText] = React.useState(() =>
    modifiedTemperature === null ? "" : String(modifiedTemperature),
  )

  const syncFromProp = React.useCallback(() => {
    setText(modifiedTemperature === null ? "" : String(modifiedTemperature))
  }, [modifiedTemperature])

  React.useEffect(() => {
    syncFromProp()
  }, [optionKey, temperatureUnit])

  React.useEffect(() => {
    if (focusedRef.current) return
    syncFromProp()
  }, [modifiedTemperature, syncFromProp])

  const trimmed = text.trim()
  const showError = parseTemperatureInput(trimmed) === null

  const errorMessage =
    trimmed === ""
      ? "Temperature is required."
      : "Enter a valid temperature."

  return (
    <div className="rounded-lg bg-card p-6 ds-card">
      <h3 className="mb-4 text-lg font-medium">Temperature Correction</h3>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium mb-2">Recommended Temperature</p>
            <p className="text-2xl font-mono">
              {displayTemp(selectedInfo?.temperature ?? 20, temperatureUnit)}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Recommended Time</p>
            <p className="text-2xl font-mono">{formatTime((selectedInfo?.time ?? 0) * 60)}</p>
            {selectedInfo?.approximateNote && (
              <p className="text-xs text-muted-foreground mt-1">
                {selectedInfo.approximateNote}
              </p>
            )}
            {pushPullLine && (
              <p className="text-xs text-muted-foreground mt-1">{pushPullLine}</p>
            )}
          </div>
        </div>
        <div>
          <label
            htmlFor="modified-temperature"
            className="text-sm font-medium mb-2 block"
          >
            Modified Temperature
          </label>
          <input
            id="modified-temperature"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            enterKeyHint="done"
            value={text}
            aria-invalid={showError}
            aria-describedby={showError ? "modified-temperature-error" : undefined}
            onFocus={() => {
              focusedRef.current = true
            }}
            onBlur={() => {
              focusedRef.current = false
              syncFromProp()
            }}
            onChange={(e) => {
              const next = e.target.value
              setText(next)
              onModifiedTemperatureChange(parseTemperatureInput(next))
            }}
            className={cn(
              "ds-input tabular-nums",
              showError &&
                "border border-destructive ring-2 ring-destructive/25 focus-visible:ring-destructive",
            )}
          />
          {showError ? (
            <p
              id="modified-temperature-error"
              className="mt-1.5 text-xs text-destructive"
              role="alert"
            >
              {errorMessage}
            </p>
          ) : null}
        </div>
        <div className="mt-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="constant-agitation"
              checked={constantAgitation}
              onChange={(e) => onConstantAgitationChange(e.target.checked)}
              className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
            />
            <label htmlFor="constant-agitation" className="text-sm font-medium">
              Constant Agitation
            </label>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Enable this if you plan to use constant agitation instead of
            intermittent agitation
          </p>
        </div>
        {correctedTime !== null && (
          <div className="mt-4 p-3 bg-muted rounded-md">
            <p className="text-sm font-medium">
              Adjusted development time:{" "}
              {formatTime(correctedTime * 60)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              For {selectedFilm} ({selectedFormat}) at {selectedIso} ISO in{" "}
              {selectedDeveloper} {selectedDilution}
            </p>
            {selectedInfo?.approximateNote && (
              <p className="text-xs text-muted-foreground mt-1">
                Base time: {selectedInfo.approximateNote}
              </p>
            )}
            {pushPullLine && (
              <p className="text-xs text-muted-foreground mt-1">{pushPullLine}</p>
            )}
            {constantAgitation && (
              <p className="text-xs text-muted-foreground mt-1">
                Time adjusted for constant agitation
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
