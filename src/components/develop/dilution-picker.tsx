"use client"

import { normalizeDilutionDisplay } from "@/utils/normalize-dilution"
import { displayTemp } from "@/utils/temperature"
import type { DevelopmentOption } from "@/types/development"

interface DilutionPickerProps {
  developmentInfo: DevelopmentOption[] | DevelopmentOption | null
  selectedDilution: string
  onDilutionChange: (value: string) => void
  selectedIso: string
  temperatureUnit: string
  isColor: boolean
  pushPullLine: string
}

export function DilutionPicker({
  developmentInfo,
  selectedDilution,
  onDilutionChange,
  selectedIso,
  temperatureUnit,
  isColor,
  pushPullLine,
}: DilutionPickerProps) {
  if (!developmentInfo || !selectedIso) return null

  if (!isColor && Array.isArray(developmentInfo) && developmentInfo.length > 0) {
    return (
      <div className="mt-4">
        <label className="block text-sm font-medium mb-2">
          Developer Dilution for ISO {selectedIso}
        </label>
        {pushPullLine && (
          <p className="text-xs text-muted-foreground mb-2">{pushPullLine}</p>
        )}
        <span className="block text-xs font-normal text-muted-foreground mb-2">
          Sorted by development time. Times are derived from chart data; see note
          per row when approximate.
        </span>
        <div className="grid grid-cols-1 gap-2">
          {developmentInfo.map((info) => (
            <button
              key={info.dilution}
              type="button"
              onClick={() => onDilutionChange(info.dilution)}
              className={`py-2 px-3 rounded-md text-sm font-medium text-left flex flex-col gap-1 ${
                selectedDilution === info.dilution
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              <div className="flex justify-between items-center w-full gap-2">
                <span>{normalizeDilutionDisplay(info.dilution)}</span>
                <span className="shrink-0">
                  {info.time} min @{" "}
                  {displayTemp(info.temperature, temperatureUnit)}
                </span>
              </div>
              {info.approximateNote && (
                <span
                  className={`text-xs font-normal ${
                    selectedDilution === info.dilution
                      ? "text-primary-foreground/90"
                      : "text-muted-foreground"
                  }`}
                >
                  {info.approximateNote}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (isColor && !Array.isArray(developmentInfo)) {
    const info = developmentInfo
    return (
      <div className="mt-4 p-3 bg-muted rounded-md">
        <p className="text-sm font-medium">Color Film Development</p>
        {pushPullLine && (
          <p className="text-xs text-muted-foreground mt-1">{pushPullLine}</p>
        )}
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs text-muted-foreground">Dilution</p>
            <p className="text-sm">
              {normalizeDilutionDisplay(info.dilution)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Time</p>
            <p className="text-sm">{info.time} min</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Temperature</p>
            <p className="text-sm">
              {displayTemp(info.temperature, temperatureUnit)}
            </p>
          </div>
          {info.approximateNote && (
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground">Source</p>
              <p className="text-sm">{info.approximateNote}</p>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => onDilutionChange(info.dilution)}
          className="mt-2 w-full py-2 px-3 rounded-md text-sm font-medium bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors"
        >
          Use These Settings
        </button>
      </div>
    )
  }

  return null
}
