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
import { films, findFilmByName, getFilmFormats } from "@/data/processed-films"
import { developers, findDeveloperByName } from "@/data/processed-developers"
import { findDevelopmentTimes, findClosestIsoTime, calculateCorrectedTime } from "@/data/processed-development-times"

interface DevelopmentOption {
  dilution: string
  time: number
  temperature: number
}

export default function Home() {
  const [selectedFilm, setSelectedFilm] = React.useState("")
  const [selectedIso, setSelectedIso] = React.useState<string>("")
  const [selectedFormat, setSelectedFormat] = React.useState<"35mm" | "120" | "sheet">("35mm")
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
  
  // Wrap availableFormats in useMemo to prevent it from changing on every render
  const availableFormats = React.useMemo(() => 
    selectedFilmData ? getFilmFormats(selectedFilmData.id) : []
  , [selectedFilmData]);

  // Reset ISO and format when film changes
  React.useEffect(() => {
    setSelectedIso("")
    setSelectedDilution("") // Reset dilution when film changes
    
    // If there's only one format available, select it automatically
    if (availableFormats.length === 1) {
      setSelectedFormat(availableFormats[0])
    }
  }, [selectedFilm, availableFormats])

  // Reset dilution when developer or format changes
  React.useEffect(() => {
    setSelectedDilution("")
    // Also reset ISO when developer changes, as available ISOs depend on the developer
    setSelectedIso("")
  }, [selectedDeveloper, selectedFormat])

  // Helper function to normalize dilution display
  const normalizeDilutionDisplay = (dilution: string): string => {
    // Convert "1:50" format to "1+50" format for display consistency
    return dilution.replace(':', '+');
  };

  const getDevelopmentInfo = (): DevelopmentOption[] | DevelopmentOption | null => {
    if (!selectedFilmData || !selectedDeveloperData || !selectedIso) return null;

    const filmId = selectedFilmData.id;
    const developerId = selectedDeveloperData.id;
    const iso = parseInt(selectedIso);

    const times = findDevelopmentTimes(filmId, developerId, selectedFormat);
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

    // Filter times to only include exact ISO matches
    const exactIsoTimes = times.filter(time => time.iso === iso);
    
    // If no exact matches, fall back to closest ISO
    if (exactIsoTimes.length === 0) {
      const closestTime = findClosestIsoTime(times, iso);
      if (!closestTime) return null;
      
      return [{
        dilution: closestTime.dilution,
        time: closestTime.time,
        temperature: closestTime.temperature
      }];
    }
    
    // Group exact ISO times by dilution
    const dilutionTimes = exactIsoTimes.reduce((acc, time) => {
      if (!acc[time.dilution]) {
        acc[time.dilution] = [];
      }
      acc[time.dilution].push(time);
      return acc;
    }, {} as Record<string, typeof times>);

    // Create development options from exact ISO matches
    const developmentOptions = Object.entries(dilutionTimes).map(([dilution, dilutionTimes]) => {
      // Since we're already filtering by exact ISO, just take the first time for each dilution
      const time = dilutionTimes[0];
      
      return {
        dilution,
        time: time.time,
        temperature: time.temperature
      };
    });
    
    // Sort options from fastest to longest development time
    // If times are equal, sort by dilution strength (higher concentration first)
    return developmentOptions.sort((a, b) => {
      // First sort by time
      if (a.time !== b.time) {
        return a.time - b.time;
      }
      
      // If times are equal, sort by dilution strength
      // Extract the ratio numbers from dilution strings like "1:50" or "1+25"
      const getDilutionRatio = (dilution: string): number => {
        // Handle special cases
        if (dilution === "stock" || dilution === "1:0") return 0;
        
        // Extract the second number from patterns like "1:50", "1+25", etc.
        const match = dilution.match(/\d+[:\+](\d+)/);
        if (!match) return 999; // If format is unknown, put at the end
        
        return parseInt(match[1], 10);
      };
      
      const ratioA = getDilutionRatio(a.dilution);
      const ratioB = getDilutionRatio(b.dilution);
      
      // Lower ratio means stronger concentration
      return ratioA - ratioB;
    });
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
                  <div className="grid gap-4 mt-2">
                    {/* Film Format Selection */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Film Format</label>
                      <div className="grid grid-cols-3 gap-2">
                        {availableFormats.includes("35mm") && (
                          <button
                            type="button"
                            onClick={() => setSelectedFormat("35mm")}
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
                            onClick={() => setSelectedFormat("120")}
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
                            onClick={() => setSelectedFormat("sheet")}
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
                <Combobox
                  options={developers}
                  value={selectedDeveloper}
                  onChange={setSelectedDeveloper}
                  placeholder="Search for a developer..."
                />
              </div>

              {/* ISO Selection - Moved below developer selection */}
              {selectedFilm && selectedDeveloper && (
                <div>
                  <label className="block text-sm font-medium mb-2">ISO/ASA</label>
                  <Select
                    value={selectedIso}
                    onValueChange={setSelectedIso}
                    disabled={!selectedFilmData || !selectedDeveloperData}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select ISO" />
                    </SelectTrigger>
                    <SelectContent>
                      {(() => {
                        // Only show ISOs that have development times for this film and developer
                        if (selectedFilmData && selectedDeveloperData) {
                          const times = findDevelopmentTimes(selectedFilmData.id, selectedDeveloperData.id, selectedFormat);
                          
                          // Extract unique ISO values that have development times
                          const availableIsoValues = [...new Set(times.map(time => time.iso))].sort((a, b) => a - b);
                          
                          // If we found ISO values with development times, show only those
                          if (availableIsoValues.length > 0) {
                            return availableIsoValues.map((iso) => (
                              <SelectItem key={iso} value={iso.toString()}>
                                {iso}
                              </SelectItem>
                            ));
                          }
                        }
                        
                        // Fallback to all ISOs from the film data if no specific times found
                        return availableIsos.map((iso) => (
                          <SelectItem key={iso} value={iso.toString()}>
                            {iso}
                          </SelectItem>
                        ));
                      })()}
                    </SelectContent>
                  </Select>
                </div>
              )}

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
                  {selectedFilmData?.type === "Color" && (
                    <p className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-md inline-block mt-1">Color Film</p>
                  )}
                </div>
              )}
              {selectedDeveloper && (
                <div>
                  <p className="text-lg font-medium">Developer: {selectedDeveloper}</p>
                  {developmentInfo && selectedIso && (
                    <div className="mt-2 space-y-2">
                      {/* Developer Dilution Selection for B&W Film */}
                      {selectedDeveloper && Array.isArray(developmentInfo) && developmentInfo.length > 0 && (
                        <div className="mt-4">
                          <label className="block text-sm font-medium mb-2">
                            Developer Dilution for ISO {selectedIso}
                            <span className="block text-xs font-normal text-gray-500 mt-1">
                              Showing exact matches for this ISO, sorted by development time
                            </span>
                          </label>
                          <div className="grid grid-cols-1 gap-2">
                            {developmentInfo.map((info) => (
                              <button
                                key={info.dilution}
                                type="button"
                                onClick={() => setSelectedDilution(info.dilution)}
                                className={`py-2 px-3 rounded-md text-sm font-medium flex justify-between items-center ${
                                  selectedDilution === info.dilution
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted hover:bg-muted/80"
                                }`}
                              >
                                <span>{normalizeDilutionDisplay(info.dilution)}</span>
                                <span>{info.time} min @ {temperatureUnit === 'celsius' 
                                  ? `${info.temperature}°C` 
                                  : `${(info.temperature * 9/5 + 32).toFixed(1)}°F`}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Developer Info for Color Film */}
                      {selectedDeveloper && !Array.isArray(developmentInfo) && developmentInfo && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-md">
                          <p className="text-sm font-medium">Color Film Development</p>
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-xs text-gray-600">Dilution</p>
                              <p className="text-sm">{normalizeDilutionDisplay(developmentInfo.dilution)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">Time</p>
                              <p className="text-sm">{developmentInfo.time} min</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">Temperature</p>
                              <p className="text-sm">{temperatureUnit === 'celsius' 
                                ? `${developmentInfo.temperature}°C` 
                                : `${(developmentInfo.temperature * 9/5 + 32).toFixed(1)}°F`}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedDilution(developmentInfo.dilution)}
                            className="mt-2 w-full py-2 px-3 rounded-md text-sm font-medium bg-blue-100 hover:bg-blue-200 text-blue-800"
                          >
                            Use These Settings
                          </button>
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
                  <div className="mt-4">
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
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Enable this if you plan to use constant agitation instead of intermittent agitation
                    </p>
                  </div>
                  {correctedTime !== null && (
                    <div className="mt-4 p-3 bg-muted rounded-md">
                      <p className="text-sm font-medium">
                        Adjusted development time: {Math.floor(correctedTime)}:{String(Math.round((correctedTime % 1) * 60)).padStart(2, '0')} min
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        For {selectedFilm} ({selectedFormat}) at {selectedIso} ISO in {selectedDeveloper} {selectedDilution}
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
                  filmName={selectedFilm}
                  filmFormat={selectedFormat}
                  filmIso={selectedIso}
                  developerName={selectedDeveloper}
                  developerDilution={selectedDilution}
                  developmentTime={correctedTime !== null ? correctedTime : (selectedInfo?.time || 0)}
                  temperature={modifiedTemperature}
                  totalVolume={totalVolume}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
