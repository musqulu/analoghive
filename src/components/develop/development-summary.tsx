"use client"

import type { DevelopmentOption } from "@/types/development"
import { DilutionPicker } from "./dilution-picker"

interface DevelopmentSummaryProps {
  selectedFilm: string
  selectedIso: string
  isColor: boolean
  selectedDeveloper: string
  developmentInfo: DevelopmentOption[] | DevelopmentOption | null
  selectedDilution: string
  onDilutionChange: (value: string) => void
  temperatureUnit: string
  pushPullLine: string
}

export function DevelopmentSummary({
  selectedFilm,
  selectedIso,
  isColor,
  selectedDeveloper,
  developmentInfo,
  selectedDilution,
  onDilutionChange,
  temperatureUnit,
  pushPullLine,
}: DevelopmentSummaryProps) {
  if (!selectedFilm && !selectedDeveloper && !developmentInfo) return null

  return (
    <div className="p-4 bg-card rounded-lg border border-border space-y-4">
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
                selectedDilution={selectedDilution}
                onDilutionChange={onDilutionChange}
                selectedIso={selectedIso}
                temperatureUnit={temperatureUnit}
                isColor={isColor}
                pushPullLine={pushPullLine}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
