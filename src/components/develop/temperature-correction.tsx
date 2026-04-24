"use client"

import * as React from "react"
import { displayTemp } from "@/utils/temperature"
import { formatTime } from "@/utils/format-time"
import { cn } from "@/lib/utils"
import type { DevelopmentOption } from "@/types/development"

interface TemperatureCorrectionProps {
  selectedInfo: DevelopmentOption | undefined | null
  temperatureUnit: string
  modifiedTemperature: number | null
  onModifiedTemperatureChange: (value: number | null) => void
  constantAgitation: boolean
  onConstantAgitationChange: (value: boolean) => void
  correctedTime: number | null
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

  const chartTemperature = selectedInfo?.temperature ?? 20
  const temperatureWasModified =
    modifiedTemperature !== null &&
    Math.abs(modifiedTemperature - chartTemperature) > 0.001

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
            className="block text-sm font-medium"
          >
            Modified Temperature
          </label>
          <p
            id="modified-temperature-hint"
            className="mt-1 mb-2 text-xs text-muted-foreground"
          >
            Changing this value recalculates development time and affects how
            your negatives develop.
          </p>
          <input
            id="modified-temperature"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            enterKeyHint="done"
            value={text}
            aria-invalid={showError}
            aria-describedby={[
              "modified-temperature-hint",
              showError ? "modified-temperature-error" : "",
            ]
              .filter(Boolean)
              .join(" ")}
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
        <label className="mt-4 flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            id="constant-agitation"
            checked={constantAgitation}
            onChange={(e) => onConstantAgitationChange(e.target.checked)}
            className="h-4 w-4 shrink-0 rounded border-input text-primary focus:ring-ring"
          />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium">Constant Agitation</span>
            <span className="mt-1 block text-xs text-muted-foreground">
              Enable this if you plan to use constant agitation instead of
              intermittent agitation
            </span>
          </span>
        </label>
        {correctedTime !== null && (
          <div className="mt-4 rounded-md border border-border bg-muted/50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Adjusted development time
            </p>
            <p className="mt-1 font-mono text-3xl font-semibold tabular-nums tracking-tight">
              {formatTime(correctedTime * 60)}
            </p>
            {(temperatureWasModified && modifiedTemperature !== null) ||
            constantAgitation ? (
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                {temperatureWasModified && modifiedTemperature !== null ? (
                  <p>
                    Using modified temperature{" "}
                    {displayTemp(modifiedTemperature, temperatureUnit)} (chart:{" "}
                    {displayTemp(chartTemperature, temperatureUnit)}).
                  </p>
                ) : null}
                {constantAgitation ? (
                  <p>Time adjusted for constant agitation</p>
                ) : null}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
