"use client"

import * as React from "react"
import { Combobox } from "@/components/ui/combobox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Timer } from "@/components/ui/timer"
import { VolumeMixer } from "@/components/ui/volume-mixer"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { films, findFilmByName } from "@/data/films"
import { developers, findDeveloperByName } from "@/data/developers"
import { findDevelopmentTimes, findClosestIsoTime, calculateCorrectedTime } from "@/data/development-times"

interface DevelopmentOption {
  dilution: string
  time: number
  temperature: number
}

export default function Home() {
  const [selectedFilm, setSelectedFilm] = React.useState("")
  const [selectedIso, setSelectedIso] = React.useState<string>("")
  const [selectedDeveloper, setSelectedDeveloper] = React.useState("")
  const [selectedDilution, setSelectedDilution] = React.useState<string>("")
  const [temperatureUnit, setTemperatureUnit] = React.useState("celsius")
  const [totalVolume, setTotalVolume] = React.useState(500) // Default to 500ml
  const [modifiedTemperature, setModifiedTemperature] = React.useState<number>(20)
  const [correctedTime, setCorrectedTime] = React.useState<number | null>(null)
  const [constantAgitation, setConstantAgitation] = React.useState(false)

  const selectedFilmData = findFilmByName(selectedFilm)
  const selectedDeveloperData = findDeveloperByName(selectedDeveloper)
  const availableIsos = selectedFilmData?.isos || []

  // Reset ISO when film changes
  React.useEffect(() => {
    setSelectedIso("")
    setSelectedDilution("") // Reset dilution when film changes
  }, [selectedFilm])

  // Reset dilution when developer changes
  React.useEffect(() => {
    setSelectedDilution("")
  }, [selectedDeveloper])

  const getDevelopmentInfo = (): DevelopmentOption[] | DevelopmentOption | null => {
    if (!selectedFilmData || !selectedDeveloperData || !selectedIso) return null;

    const filmId = selectedFilmData.id;
    const developerId = selectedDeveloperData.id;
    const iso = parseInt(selectedIso);

    const times = findDevelopmentTimes(filmId, developerId);
    if (times.length === 0) return null;

    // For color film, return a single development option
    if (selectedFilmData.type === "Color") {
      const closestTime = findClosestIsoTime(times, iso);
      if (!closestTime) return null;
      return {
        dilution: closestTime.dilution,
        time: closestTime.time,
        temperature: closestTime.temperature
      };
    }

    // Group times by dilution for B&W film
    const dilutionTimes = times.reduce((acc, time) => {
      if (!acc[time.dilution]) {
        acc[time.dilution] = [];
      }
      acc[time.dilution].push(time);
      return acc;
    }, {} as Record<string, typeof times>);

    // For each dilution, find the closest ISO time
    return Object.entries(dilutionTimes).map(([dilution, dilutionTimes]) => {
      const closestTime = findClosestIsoTime(dilutionTimes, iso);
      if (!closestTime) return null;

      return {
        dilution,
        time: closestTime.time,
        temperature: closestTime.temperature
      };
    }).filter((item): item is DevelopmentOption => item !== null);
  };

  const developmentInfo = getDevelopmentInfo();
  const selectedInfo = developmentInfo && Array.isArray(developmentInfo) 
    ? developmentInfo.find(info => info.dilution === selectedDilution)
    : developmentInfo;

  // Set default dilution when development info becomes available
  React.useEffect(() => {
    if (developmentInfo && Array.isArray(developmentInfo) && developmentInfo.length > 0 && !selectedDilution) {
      setSelectedDilution(developmentInfo[0].dilution)
    }
  }, [developmentInfo, selectedDilution])

  // Update corrected time when relevant values change
  React.useEffect(() => {
    if (selectedInfo) {
      const baseTime = selectedInfo.time;
      const baseTemp = selectedInfo.temperature;
      const newTime = calculateCorrectedTime(baseTemp, baseTime, modifiedTemperature, constantAgitation);
      setCorrectedTime(newTime);
    }
  }, [selectedInfo, modifiedTemperature, constantAgitation]);

  // Handle temperature unit changes
  const handleTemperatureChange = (value: string) => {
    setTemperatureUnit(value);
    // Convert the modified temperature when changing units
    if (value === 'fahrenheit') {
      setModifiedTemperature(Number((modifiedTemperature * 9/5 + 32).toFixed(1)));
    } else {
      setModifiedTemperature(Number(((modifiedTemperature - 32) * 5/9).toFixed(1)));
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center p-8 pt-12">
      <div className="max-w-md w-full space-y-8">
        <h1 className="text-2xl font-bold text-center mb-8">Film Development Calculator</h1>
        
        <div className="space-y-8">
          <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-medium mb-4">Film & Developer Selection</h3>
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Film</label>
                  <Combobox
                    options={films}
                    value={selectedFilm}
                    onChange={setSelectedFilm}
                    placeholder="Search for a film..."
                  />
                </div>

                {selectedFilm && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Select ISO</label>
                    <Select value={selectedIso} onValueChange={setSelectedIso}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose ISO" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableIsos.map((iso) => (
                          <SelectItem key={iso} value={iso.toString()}>
                            ISO {iso}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Select Developer</label>
                <Combobox
                  options={developers}
                  value={selectedDeveloper}
                  onChange={setSelectedDeveloper}
                  placeholder="Search for a developer..."
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-3 block">Temperature Unit</label>
                <RadioGroup
                  defaultValue="celsius"
                  value={temperatureUnit}
                  onValueChange={handleTemperatureChange}
                  className="flex items-center space-x-8"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="celsius" id="celsius" />
                    <label htmlFor="celsius" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Celsius (°C)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fahrenheit" id="fahrenheit" />
                    <label htmlFor="fahrenheit" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Fahrenheit (°F)
                    </label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>

          {(selectedFilm || selectedDeveloper || developmentInfo) && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
              {selectedFilm && (
                <div>
                  <p className="text-lg font-medium">Film: {selectedFilm}</p>
                  {selectedIso && (
                    <p className="text-sm text-gray-600">ISO: {selectedIso}</p>
                  )}
                </div>
              )}
              {selectedDeveloper && (
                <div>
                  <p className="text-lg font-medium">Developer: {selectedDeveloper}</p>
                  {developmentInfo && selectedIso && (
                    <div className="mt-2 space-y-2">
                      {Array.isArray(developmentInfo) ? (
                        // B&W development options
                        <div className="space-y-4">
                          <p className="text-sm font-medium">Development Options:</p>
                          <RadioGroup
                            value={selectedDilution}
                            onValueChange={setSelectedDilution}
                            className="space-y-2"
                          >
                            {developmentInfo.map((info, index) => (
                              <div key={index} className="flex items-start space-x-4 p-3 rounded-md hover:bg-gray-100">
                                <RadioGroupItem value={info.dilution} id={`dilution-${index}`} className="mt-1" />
                                <label
                                  htmlFor={`dilution-${index}`}
                                  className="flex-1 cursor-pointer"
                                >
                                  <div className="space-y-1">
                                    <p className="text-sm font-medium">Dilution: {info.dilution}</p>
                                    <p className="text-sm">Time: {info.time} minutes</p>
                                    <p className="text-sm">
                                      Temperature: {temperatureUnit === 'celsius' 
                                        ? `${info.temperature}°C` 
                                        : `${(info.temperature * 9/5 + 32).toFixed(1)}°F`}
                                    </p>
                                  </div>
                                </label>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>
                      ) : developmentInfo && (
                        // Color development
                        <div className="mt-2">
                          <p className="text-sm">Dilution: {developmentInfo.dilution}</p>
                          <p className="text-sm">Time: {developmentInfo.time} minutes</p>
                          <p className="text-sm">
                            Temperature: {temperatureUnit === 'celsius'
                              ? `${developmentInfo.temperature}°C`
                              : `${(developmentInfo.temperature * 9/5 + 32).toFixed(1)}°F`}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {developmentInfo && selectedIso && selectedDilution && (
            <>
              <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-lg font-medium mb-4">Volume Mixer</h3>
                <VolumeMixer
                  dilution={selectedDilution}
                  totalVolume={totalVolume}
                  onVolumeChange={setTotalVolume}
                />
              </div>

              <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-lg font-medium mb-4">Temperature Correction</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Recommended Temperature</p>
                      <p className="text-2xl font-mono">
                        {temperatureUnit === 'celsius'
                          ? `${selectedInfo?.temperature ?? 20}°C`
                          : `${((selectedInfo?.temperature ?? 20) * 9/5 + 32).toFixed(1)}°F`}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Recommended Time</p>
                      <p className="text-2xl font-mono">
                        {selectedInfo?.time ?? 0} min
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Modified Temperature</label>
                    <input
                      type="number"
                      value={modifiedTemperature}
                      onChange={(e) => {
                        const newTemp = Number(e.target.value);
                        setModifiedTemperature(newTemp);
                      }}
                      step="0.1"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="constant-agitation"
                      checked={constantAgitation}
                      onChange={(e) => setConstantAgitation(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="constant-agitation" className="text-sm font-medium">
                      Constant Agitation
                      <span className="block text-xs text-gray-500">
                        Reduces development time by ~30%
                      </span>
                    </label>
                  </div>
                  {correctedTime !== null && (
                    <div className="mt-4 p-3 bg-muted rounded-md">
                      <p className="text-sm font-medium">
                        Adjusted development time: {Math.floor(correctedTime)}:{String(Math.round((correctedTime % 1) * 60)).padStart(2, '0')} min
                      </p>
                      {constantAgitation && (
                        <p className="text-xs text-gray-600 mt-1">
                          Time adjusted for constant agitation
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                <Timer 
                  developmentTime={correctedTime !== null ? correctedTime : (selectedInfo?.time ?? 0)}
                  temperature={modifiedTemperature}
                  temperatureUnit={temperatureUnit}
                  isColor={selectedFilmData?.type === "Color"}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
