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
}: DevelopmentSummaryProps) {
  if (!selectedFilm && !selectedDeveloper && !developmentInfo) return null

  const showPicker =
    Boolean(selectedDeveloper && developmentInfo && selectedIso)

  return (
    <div className="space-y-4 rounded-lg bg-card p-4 ds-card">
      <div className="space-y-1.5">
        <h2 className="text-base font-semibold">Select dilution</h2>
        <p className="text-sm text-muted-foreground leading-snug">
          Dilution ratio and developing temperature both affect development
          time—choose the row that matches how you mix and heat your chemistry.
        </p>
      </div>

      {(selectedFilm || selectedDeveloper) && (
        <div className="space-y-0.5 text-xs text-muted-foreground">
          {selectedFilm ? <p>Film: {selectedFilm}</p> : null}
          {selectedDeveloper ? <p>Developer: {selectedDeveloper}</p> : null}
          {isColor ? (
            <p className="text-[11px] pt-0.5">Color film</p>
          ) : null}
        </div>
      )}

      {showPicker ? (
        <DilutionPicker
          developmentInfo={developmentInfo}
          selectedOptionKey={selectedOptionKey}
          onOptionChange={onOptionChange}
          selectedIso={selectedIso}
          temperatureUnit={temperatureUnit}
          isColor={isColor}
          selectedDeveloper={selectedDeveloper}
        />
      ) : null}
    </div>
  )
}
