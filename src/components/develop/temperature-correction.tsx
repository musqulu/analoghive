"use client"

import { displayTemp } from "@/utils/temperature"
import { formatTime } from "@/utils/format-time"
import type { DevelopmentOption, FilmFormat } from "@/types/development"

interface TemperatureCorrectionProps {
  selectedInfo: DevelopmentOption | undefined | null
  temperatureUnit: string
  modifiedTemperature: number
  onModifiedTemperatureChange: (value: number) => void
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
  return (
    <div className="p-6 bg-card rounded-lg border border-border shadow-sm">
      <h3 className="text-lg font-medium mb-4">Temperature Correction</h3>
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
          <label className="text-sm font-medium mb-2 block">
            Modified Temperature
          </label>
          <input
            type="number"
            value={modifiedTemperature}
            onChange={(e) => onModifiedTemperatureChange(Number(e.target.value))}
            step="0.1"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
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
