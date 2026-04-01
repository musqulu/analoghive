"use client"

import { Combobox } from "@/components/ui/combobox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PushPullSelector } from "./push-pull-selector"
import type { FilmFormat } from "@/types/development"
import type { Film } from "@/data/processed-films"
import type { Developer } from "@/data/processed-developers"

interface FilmDeveloperFormProps {
  films: (Film | { name: string; type: string })[]
  selectedFilm: string
  onFilmChange: (value: string) => void
  selectedFormat: FilmFormat
  onFormatChange: (value: FilmFormat) => void
  availableFormats: FilmFormat[]
  availableDevelopers: Developer[]
  selectedDeveloper: string
  onDeveloperChange: (value: string) => void
  selectedFilmData: Film | undefined
  selectedDeveloperData: Developer | undefined
  selectedIso: string
  onIsoChange: (value: string) => void
  availableIsoValues: number[]
  ratingIso: number
  pushPullStops: number
  onPushPullChange: (stops: number, iso: string) => void
  temperatureUnit: string
  onTemperatureUnitChange: (value: string) => void
}

export function FilmDeveloperForm({
  films,
  selectedFilm,
  onFilmChange,
  selectedFormat,
  onFormatChange,
  availableFormats,
  availableDevelopers,
  selectedDeveloper,
  onDeveloperChange,
  selectedFilmData,
  selectedDeveloperData,
  selectedIso,
  onIsoChange,
  availableIsoValues,
  ratingIso,
  pushPullStops,
  onPushPullChange,
  temperatureUnit,
  onTemperatureUnitChange,
}: FilmDeveloperFormProps) {
  return (
    <div className="p-6 bg-card rounded-lg border border-border shadow-sm">
      <h3 className="text-lg font-medium mb-4">Film & Developer Selection</h3>
      <div className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Select Film</label>
            <Combobox
              options={films as { name: string; type: string }[]}
              value={selectedFilm}
              onChange={onFilmChange}
              placeholder="Search for a film..."
            />
          </div>

          {selectedFilm && (
            <div className="grid gap-4 mt-2">
              <div>
                <label className="block text-sm font-medium mb-2">Film Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {availableFormats.includes("35mm") && (
                    <button
                      type="button"
                      onClick={() => onFormatChange("35mm")}
                      className={`py-2 px-3 rounded-md text-sm font-medium ${
                        selectedFormat === "35mm"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      35mm
                    </button>
                  )}
                  {availableFormats.includes("120") && (
                    <button
                      type="button"
                      onClick={() => onFormatChange("120")}
                      className={`py-2 px-3 rounded-md text-sm font-medium ${
                        selectedFormat === "120"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      120 (Medium Format)
                    </button>
                  )}
                  {availableFormats.includes("sheet") && (
                    <button
                      type="button"
                      onClick={() => onFormatChange("sheet")}
                      className={`py-2 px-3 rounded-md text-sm font-medium ${
                        selectedFormat === "sheet"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      Sheet Film
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Select Developer</label>
          {selectedFilmData ? (
            <>
              <Combobox
                options={availableDevelopers.map((dev) => ({
                  name: dev.name,
                  type: dev.type,
                }))}
                value={selectedDeveloper}
                onChange={onDeveloperChange}
                placeholder={
                  availableDevelopers.length > 0
                    ? "Search for a developer..."
                    : "No developers available for this film and format"
                }
              />
              {availableDevelopers.length === 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  No developers available for this film in {selectedFormat} format.
                  Try selecting a different format.
                </p>
              )}
            </>
          ) : (
            <Combobox
              options={[]}
              value=""
              onChange={() => {}}
              placeholder="Select a film first"
            />
          )}
        </div>

        {selectedFilm && selectedDeveloper && (
          <>
            {selectedFilmData && availableIsoValues.length > 0 && (
              <PushPullSelector
                ratingIso={ratingIso}
                availableIsoValues={availableIsoValues}
                pushPullStops={pushPullStops}
                onPushPullChange={onPushPullChange}
              />
            )}
            <div>
              <label className="block text-sm font-medium mb-2">ISO/ASA</label>
              <Select
                value={selectedIso}
                onValueChange={onIsoChange}
                disabled={!selectedFilmData || !selectedDeveloperData}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select ISO" />
                </SelectTrigger>
                <SelectContent>
                  {availableIsoValues.length > 0 ? (
                    availableIsoValues.map((iso) => (
                      <SelectItem key={iso} value={iso.toString()}>
                        {iso}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      No ISO values available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        <div>
          <label className="text-sm font-medium mb-3 block">Temperature Unit</label>
          <RadioGroup
            defaultValue="celsius"
            value={temperatureUnit}
            onValueChange={onTemperatureUnitChange}
            className="flex items-center space-x-8"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="celsius" id="celsius" />
              <label
                htmlFor="celsius"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Celsius (°C)
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="fahrenheit" id="fahrenheit" />
              <label
                htmlFor="fahrenheit"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Fahrenheit (°F)
              </label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  )
}
