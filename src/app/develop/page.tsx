"use client"

import * as React from "react"
import { useDevelopmentSelection } from "@/hooks/use-development-selection"
import { useCorrectedTime } from "@/hooks/use-corrected-time"
import { FilmDeveloperForm } from "@/components/develop/film-developer-form"
import { DevelopmentSummary } from "@/components/develop/development-summary"
import { TemperatureCorrection } from "@/components/develop/temperature-correction"
import { VolumeMixer } from "@/components/ui/volume-mixer"
import { Timer } from "@/components/ui/timer"
import { SavePresetButton } from "@/components/develop/save-preset-button"

export default function DevelopPage() {
  const selection = useDevelopmentSelection()
  const correction = useCorrectedTime(selection.selectedInfo)
  const [totalVolume, setTotalVolume] = React.useState(500)

  const isColor = selection.selectedFilmData?.type === "Color"

  return (
    <main className="min-h-screen flex flex-col items-center p-8 pt-12">
      <div className="max-w-md w-full space-y-8">
        <h1 className="mb-8 text-center text-2xl font-semibold tracking-tight text-foreground">
          Film Development Calculator
        </h1>

        <div className="space-y-8">
          <FilmDeveloperForm
            films={selection.films}
            selectedFilm={selection.selectedFilm}
            onFilmChange={selection.setSelectedFilm}
            selectedFormat={selection.selectedFormat}
            onFormatChange={selection.setSelectedFormat}
            availableFormats={selection.availableFormats}
            availableDevelopers={selection.availableDevelopers}
            selectedDeveloper={selection.selectedDeveloper}
            onDeveloperChange={selection.setSelectedDeveloper}
            selectedFilmData={selection.selectedFilmData}
            selectedDeveloperData={selection.selectedDeveloperData}
            selectedIso={selection.selectedIso}
            onIsoChange={selection.handleIsoChange}
            availableIsoValues={selection.availableIsoValues}
            ratingIso={selection.ratingIso}
            pushPullStops={selection.pushPullStops}
            onPushPullChange={selection.handlePushPullChange}
            temperatureUnit={correction.temperatureUnit}
            onTemperatureUnitChange={correction.handleTemperatureUnitChange}
          />

          <DevelopmentSummary
            selectedFilm={selection.selectedFilm}
            selectedIso={selection.selectedIso}
            isColor={isColor}
            selectedDeveloper={selection.selectedDeveloper}
            developmentInfo={selection.developmentInfo}
            selectedOptionKey={selection.selectedOptionKey}
            onOptionChange={selection.setSelectedOptionKey}
            temperatureUnit={correction.temperatureUnit}
            pushPullLine={selection.pushPullLine}
          />

          {selection.developmentInfo &&
            selection.selectedIso &&
            selection.selectedDilution && (
              <div className="flex justify-end">
                <SavePresetButton
                  filmName={selection.selectedFilm}
                  filmFormat={selection.selectedFormat}
                  filmIso={selection.selectedIso}
                  developerName={selection.selectedDeveloper}
                  developerDilution={selection.selectedDilution}
                  totalVolume={totalVolume}
                  temperatureUnit={correction.temperatureUnit}
                  modifiedTemperature={correction.modifiedTemperature}
                  correctedTime={correction.correctedTime}
                  constantAgitation={correction.constantAgitation}
                />
              </div>
            )}

          {selection.developmentInfo &&
            selection.selectedIso &&
            selection.selectedDilution && (
              <>
                <div className="rounded-lg bg-card p-6 ds-card">
                  <h3 className="mb-4 text-lg font-medium">Volume Mixer</h3>
                  <VolumeMixer
                    dilution={selection.selectedDilution}
                    totalVolume={totalVolume}
                    onVolumeChange={setTotalVolume}
                  />
                </div>

                <TemperatureCorrection
                  selectedInfo={selection.selectedInfo}
                  temperatureUnit={correction.temperatureUnit}
                  modifiedTemperature={correction.modifiedTemperature}
                  onModifiedTemperatureChange={correction.setModifiedTemperature}
                  constantAgitation={correction.constantAgitation}
                  onConstantAgitationChange={correction.setConstantAgitation}
                  correctedTime={correction.correctedTime}
                  selectedFilm={selection.selectedFilm}
                  selectedFormat={selection.selectedFormat}
                  selectedIso={selection.selectedIso}
                  selectedDeveloper={selection.selectedDeveloper}
                  selectedDilution={selection.selectedDilution}
                  pushPullLine={selection.pushPullLine}
                />

                <div className="rounded-lg bg-card p-6 ds-card">
                  <Timer
                    filmName={selection.selectedFilm}
                    filmFormat={selection.selectedFormat}
                    filmIso={selection.selectedIso}
                    developerName={selection.selectedDeveloper}
                    developerDilution={selection.selectedDilution}
                    developmentTime={
                      correction.correctedTime !== null
                        ? correction.correctedTime
                        : selection.selectedInfo?.time || 0
                    }
                    temperature={correction.modifiedTemperature}
                    totalVolume={totalVolume}
                    pushPullLine={selection.pushPullLine}
                    chartNote={selection.selectedInfo?.approximateNote}
                  />
                </div>
              </>
            )}
        </div>
      </div>
    </main>
  )
}
