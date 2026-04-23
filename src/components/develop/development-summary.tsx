"use client"

import type { DevelopmentOption } from "@/types/development"
import { DilutionPicker } from "./dilution-picker"

interface DevelopmentSummaryProps {
  selectedFilm: string
  selectedIso: string
  isColor: boolean
  selectedDeveloper: string
  developmentInfo: DevelopmentOption[] | DevelopmentOption | null
  selectedOptionKey: string
  onOptionChange: (value: string) => void
  temperatureUnit: string
  pushPullLine: string
}

export function DevelopmentSummary({
  selectedFilm,
  selectedIso,
  isColor,
  selectedDeveloper,
  developmentInfo,
  selectedOptionKey,
  onOptionChange,
  temperatureUnit,
  pushPullLine,
}: DevelopmentSummaryProps) {
  if (!selectedFilm && !selectedDeveloper && !developmentInfo) return null

  return (
    <div className="space-y-4 rounded-lg bg-card p-4 ds-card">
      {selectedFilm && (
        <div>
          <p className="text-lg font-medium">Film: {selectedFilm}</p>
          {selectedIso && (
            <p className="text-sm text-muted-foreground">ISO: {selectedIso}</p>
          )}
          {isColor && (
            <p className="text-sm bg-muted text-muted-foreground px-2 py-1 rounded-md inline-block mt-1">
              Color Film
            </p>
          )}
        </div>
      )}
      {selectedDeveloper && (
        <div>
          <p className="text-lg font-medium">Developer: {selectedDeveloper}</p>
          {developmentInfo && selectedIso && (
            <div className="mt-2 space-y-2">
              <DilutionPicker
                developmentInfo={developmentInfo}
                selectedOptionKey={selectedOptionKey}
                onOptionChange={onOptionChange}
                selectedIso={selectedIso}
                temperatureUnit={temperatureUnit}
                isColor={isColor}
                pushPullLine={pushPullLine}
                selectedDeveloper={selectedDeveloper}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
