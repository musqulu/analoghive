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

interface DevelopmentTimes {
  [key: number]: number;
}

interface DevelopmentProcess {
  dilution: string;
  times: DevelopmentTimes;
  temperature?: number;
}

interface Development {
  [key: string]: DevelopmentProcess;
}

interface Developer {
  name: string;
  type: "Color" | "B&W";
  development: Development;
}

const films = [
  { 
    name: "Kodak Tri-X 400", 
    type: "B&W",
    isos: [200, 400, 800, 1600]
  },
  { 
    name: "Ilford HP5+", 
    type: "B&W",
    isos: [200, 400, 800, 1600, 3200]
  },
  { 
    name: "Ilford Delta 3200", 
    type: "B&W",
    isos: [1600, 3200, 6400, 12800]
  }
]

const developers: Developer[] = [
  { 
    name: "Kodak D-76", 
    type: "B&W",
    development: {
      "1:1": {
        dilution: "1:1",
        times: {
          200: 11,
          400: 13,
          800: 15,
          1600: 17,
          3200: 19,
          6400: 21,
          12800: 23
        }
      },
      "1:3": {
        dilution: "1:3",
        times: {
          200: 16,
          400: 18,
          800: 20,
          1600: 22,
          3200: 24,
          6400: 26,
          12800: 28
        }
      }
    }
  },
  { 
    name: "Kodak HC-110", 
    type: "B&W",
    development: {
      b: {
        dilution: "Dilution B (1:31)",
        times: {
          200: 4.5,
          400: 5.5,
          800: 7,
          1600: 9,
          3200: 11,
          6400: 13,
          12800: 15
        }
      },
      e: {
        dilution: "Dilution E (1:47)",
        times: {
          200: 6.5,
          400: 7.5,
          800: 9,
          1600: 11,
          3200: 13,
          6400: 15,
          12800: 17
        }
      },
      h: {
        dilution: "Dilution H (1:63)",
        times: {
          200: 9,
          400: 10,
          800: 12,
          1600: 14,
          3200: 16,
          6400: 18,
          12800: 20
        }
      }
    }
  },
  { 
    name: "Ilford ID-11", 
    type: "B&W",
    development: {
      "1:1": {
        dilution: "1:1",
        times: {
          200: 10,
          400: 12,
          800: 14,
          1600: 16,
          3200: 18,
          6400: 20,
          12800: 22
        }
      },
      "1:3": {
        dilution: "1:3",
        times: {
          200: 15,
          400: 17,
          800: 19,
          1600: 21,
          3200: 23,
          6400: 25,
          12800: 27
        }
      }
    }
  },
  { 
    name: "Rodinal", 
    type: "B&W",
    development: {
      "1:25": {
        dilution: "1:25",
        times: {
          200: 5,
          400: 6,
          800: 8,
          1600: 11,
          3200: 14,
          6400: 17,
          12800: 20
        }
      },
      "1:50": {
        dilution: "1:50",
        times: {
          200: 8,
          400: 11,
          800: 14,
          1600: 17,
          3200: 20,
          6400: 23,
          12800: 26
        }
      },
      "1:100": {
        dilution: "1:100",
        times: {
          200: 14,
          400: 18,
          800: 22,
          1600: 26,
          3200: 30,
          6400: 34,
          12800: 38
        }
      }
    }
  }
]

// Add these utility functions after the imports
const convertToFahrenheit = (celsius: number) => (celsius * 9/5) + 32;
const convertToCelsius = (fahrenheit: number) => (fahrenheit - 32) * 5/9;
const formatTemperature = (temp: number, unit: string) => {
  const value = unit === 'fahrenheit' ? convertToFahrenheit(temp) : temp;
  return `${value.toFixed(1)}°${unit === 'fahrenheit' ? 'F' : 'C'}`;
};

// Add this utility function after the existing utility functions
const roundToNearestSecond = (minutes: number) => {
  // Convert to seconds, round, then convert back to minutes
  return Math.round(minutes * 60) / 60;
};

export default function Home() {
  const [selectedFilm, setSelectedFilm] = React.useState("")
  const [selectedIso, setSelectedIso] = React.useState<string>("")
  const [selectedDeveloper, setSelectedDeveloper] = React.useState("")
  const [selectedDilution, setSelectedDilution] = React.useState<string>("")
  const [temperatureUnit, setTemperatureUnit] = React.useState("celsius")
  const [totalVolume, setTotalVolume] = React.useState(500) // Default to 500ml
  const [modifiedTemperature, setModifiedTemperature] = React.useState<number>(20)
  const [correctedTime, setCorrectedTime] = React.useState<number | null>(null)

  const selectedFilmData = films.find(film => film.name === selectedFilm)
  const selectedDeveloperData = developers.find(dev => dev.name === selectedDeveloper)
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

  const getDevelopmentInfo = () => {
    if (!selectedDeveloperData || !selectedIso) return null;

    const iso = parseInt(selectedIso);
    const devData = selectedDeveloperData.development;

    // For color film, return the standard C-41 process
    if (selectedDeveloperData.type === "Color") {
      const colorProcess = devData.kit;
      if (!colorProcess) return null;
      
      const defaultIso = 400;
      const time = colorProcess.times[iso] || colorProcess.times[defaultIso];
      
      if (!time) return null;
      
      return {
        dilution: colorProcess.dilution,
        time: time,
        temperature: colorProcess.temperature ?? 38 // Default to 38°C if not specified
      };
    }

    // For B&W, find the closest matching time for the ISO
    const dilutions = Object.keys(devData);
    const result = dilutions.map(dilKey => {
      const dilution = devData[dilKey];
      if (!dilution?.times) return null;
      
      const times = dilution.times;
      const availableIsos = Object.keys(times).map(Number);
      const closestIso = availableIsos.reduce((prev, curr) => {
        return Math.abs(curr - iso) < Math.abs(prev - iso) ? curr : prev;
      });

      const time = times[closestIso];
      if (!time) return null;

      return {
        dilution: dilution.dilution,
        time: time,
        temperature: 20 // Standard temp for B&W
      };
    }).filter((item): item is NonNullable<typeof item> => item !== null);

    return result.length > 0 ? result : null;
  };

  const developmentInfo = getDevelopmentInfo();

  // Set default dilution when development info becomes available
  React.useEffect(() => {
    if (developmentInfo && Array.isArray(developmentInfo) && developmentInfo.length > 0 && !selectedDilution) {
      setSelectedDilution(developmentInfo[0].dilution)
    }
  }, [developmentInfo, selectedDilution])

  // Update the temperature correction calculation
  const calculateCorrectedTime = (baseTemp: number, baseTime: number, newTemp: number) => {
    // Using the Q10 temperature coefficient (development rate doubles every 10°C)
    const q10 = 2;
    const tempDiff = newTemp - baseTemp;
    const factor = Math.pow(q10, tempDiff / 10);
    const correctedTime = baseTime / factor;
    // Round to nearest second and ensure minimum time
    return Math.max(0.1, roundToNearestSecond(correctedTime));
  };

  // Handle temperature unit changes
  const handleTemperatureChange = (value: string) => {
    setTemperatureUnit(value);
    // Convert the modified temperature when changing units
    if (value === 'fahrenheit') {
      setModifiedTemperature(Number(convertToFahrenheit(modifiedTemperature).toFixed(1)));
    } else {
      setModifiedTemperature(Number(convertToCelsius(modifiedTemperature).toFixed(1)));
    }
  };

  // Add useEffect to update corrected time when relevant values change
  React.useEffect(() => {
    if (developmentInfo) {
      const selectedInfo = Array.isArray(developmentInfo) 
        ? developmentInfo.find(info => info.dilution === selectedDilution)
        : developmentInfo;

      if (selectedInfo) {
        const baseTime = selectedInfo.time;
        const baseTemp = selectedInfo.temperature ?? 20;
        const newTime = calculateCorrectedTime(baseTemp, baseTime, modifiedTemperature);
        setCorrectedTime(newTime);
      }
    }
  }, [developmentInfo, modifiedTemperature, selectedDilution]);

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
                      ) : (
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
                        {formatTemperature(
                          Array.isArray(developmentInfo) 
                            ? developmentInfo.find(info => info.dilution === selectedDilution)?.temperature ?? 20
                            : developmentInfo.temperature ?? 20,
                          temperatureUnit
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Recommended Time</p>
                      <p className="text-2xl font-mono">
                        {Array.isArray(developmentInfo)
                          ? developmentInfo.find(info => info.dilution === selectedDilution)?.time ?? 0
                          : developmentInfo.time ?? 0} min
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
                  {correctedTime !== null && (
                    <div className="mt-4 p-3 bg-muted rounded-md">
                      <p className="text-sm font-medium">
                        Adjusted development time: {correctedTime.toFixed(1)} minutes
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                <Timer 
                  developmentTime={correctedTime !== null ? roundToNearestSecond(correctedTime) : (
                    Array.isArray(developmentInfo)
                      ? roundToNearestSecond(developmentInfo.find(info => info.dilution === selectedDilution)?.time ?? 0)
                      : roundToNearestSecond(developmentInfo.time ?? 0)
                  )}
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
  )
}
