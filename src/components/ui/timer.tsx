"use client"

import * as React from "react"
import { Play, Pause, RotateCcw, PlayCircle, Pencil } from "lucide-react"

interface TimerProps {
  developmentTime: number
  temperature: number
  filmName?: string
  filmFormat?: "35mm" | "120" | "sheet"
  filmIso?: string
  developerName?: string
  developerDilution?: string
  totalVolume?: number
  temperatureUnit?: string
  isColor?: boolean
}

type Step = 'dev' | 'stop' | 'fix' | 'wash';

interface ProcessTimes {
  dev: number;
  stop: number;
  fix: number;
  wash: number;
}

interface WashingMethod {
  type: 'running' | 'ilford' | 'custom';
  runningWaterTime: number;
  ilfordInversions: {
    first: number;
    second: number;
    third: number;
  };
  custom: {
    totalTime: number;
    waterChanges: number;
  };
}

export function Timer({ 
  developmentTime, 
  temperature, 
  filmName, 
  filmFormat = "35mm",
  filmIso,
  developerName,
  developerDilution,
  totalVolume = 500,
  temperatureUnit = "celsius", 
  isColor = false 
}: TimerProps) {
  const [timeLeft, setTimeLeft] = React.useState(developmentTime * 60);
  const [isRunning, setIsRunning] = React.useState(false);
  const [isPaused, setIsPaused] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState<Step | null>(null);
  const [nextAgitation, setNextAgitation] = React.useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [washingMethod, setWashingMethod] = React.useState<WashingMethod>({
    type: 'running',
    runningWaterTime: isColor ? 3 : 5,
    ilfordInversions: {
      first: 5,
      second: 10,
      third: 20
    },
    custom: {
      totalTime: 5,
      waterChanges: 3
    }
  })
  const [customTimes, setCustomTimes] = React.useState<ProcessTimes>({
    dev: developmentTime,
    stop: 1, // 1 minute default
    fix: isColor ? 2 : 5, // 2 minutes for color, 5 for B&W
    wash: isColor ? 3 : 5, // 3 minutes for color, 5 for B&W
  })
  
  // Step labels for display
  const stepLabels: Record<Step, string> = {
    dev: 'Development',
    stop: 'Stop Bath',
    fix: 'Fixer',
    wash: 'Washing'
  };

  const steps = React.useMemo(() => ({
    dev: {
      name: "Development",
      time: developmentTime * 60,
      temp: temperature,
      agitation: isColor ? {
        initial: 60,
        interval: 30,
        duration: 5
      } : {
        initial: 30,
        interval: 30,
        duration: 10
      }
    },
    stop: {
      name: "Stop Bath",
      time: customTimes.stop * 60,
      temp: 20,
      agitation: {
        initial: 30,
        interval: 30,
        duration: 5
      }
    },
    fix: {
      name: "Fixer",
      time: customTimes.fix * 60,
      temp: 20,
      agitation: {
        initial: 30,
        interval: 60,
        duration: 10
      }
    },
    wash: {
      name: "Washing",
      time: customTimes.wash * 60,
      temp: 20,
      agitation: {
        initial: 0,
        interval: 60,
        duration: 10
      }
    }
  }), [developmentTime, customTimes, temperature, isColor])

  // Timer logic
  React.useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsPaused(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, isPaused, timeLeft]);

  // Reset timer when development time changes
  React.useEffect(() => {
    // Round to nearest second when converting from minutes to seconds
    setTimeLeft(Math.round(developmentTime * 60));
  }, [developmentTime]);

  // Add effect to update wash time based on washing method
  React.useEffect(() => {
    let washTime = 5; // default
    if (washingMethod.type === 'running') {
      washTime = washingMethod.runningWaterTime;
    } else if (washingMethod.type === 'ilford') {
      // Roughly 1 minute per cycle
      washTime = 3;
    } else if (washingMethod.type === 'custom') {
      washTime = washingMethod.custom.totalTime;
    }
    setCustomTimes(prev => ({ ...prev, wash: washTime }));
  }, [washingMethod]);

  const formatTime = (seconds: number) => {
    // Round to nearest second to avoid floating point precision issues
    seconds = Math.round(seconds);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = (step: Step) => {
    setCurrentStep(step);
    setTimeLeft(steps[step].time);
    setIsRunning(true);
    setIsPaused(false);
    setNextAgitation(null);
  };

  const toggleTimer = () => {
    if (isRunning) {
      setIsPaused(!isPaused);
    }
  };

  const resetTimer = () => {
    if (currentStep) {
      setTimeLeft(steps[currentStep].time);
      setIsRunning(false);
      setIsPaused(false);
      setNextAgitation(null);
    }
  };

  const getStepTemp = (step: 'dev' | 'stop' | 'fix' | 'wash') => {
    const temp = steps[step].temp;
    return temperatureUnit === 'celsius' 
      ? `${temp}°C` 
      : `${(temp * 9/5 + 32).toFixed(1)}°F`;
  };

  const getAgitationInstructions = () => {
    if (!currentStep || !steps[currentStep].agitation) return null;
    
    const { initial, duration } = steps[currentStep].agitation;
    const totalTime = steps[currentStep].time;
    const elapsed = totalTime - timeLeft;
    
    if (currentStep === 'wash') {
      if (washingMethod.type === 'ilford') {
        const currentCycle = Math.floor(elapsed / 60) + 1;
        const inversionsForCycle = currentCycle === 1 
          ? washingMethod.ilfordInversions.first 
          : currentCycle === 2 
            ? washingMethod.ilfordInversions.second 
            : washingMethod.ilfordInversions.third;
        
        return (
          <div className="text-orange-600 font-medium">
            Cycle {currentCycle}: {inversionsForCycle} inversions
          </div>
        );
      } else if (washingMethod.type === 'custom') {
        const changeInterval = Math.floor(totalTime / washingMethod.custom.waterChanges);
        const nextChange = changeInterval - (elapsed % changeInterval);
        const currentChange = Math.floor(elapsed / changeInterval) + 1;
        
        if (currentChange <= washingMethod.custom.waterChanges) {
          return (
            <div className="text-orange-600 font-medium">
              Water change {currentChange} of {washingMethod.custom.waterChanges} in {formatTime(nextChange)}
            </div>
          );
        }
      }
    }
    
    if (elapsed < initial) {
      return (
        <div className="text-orange-600 font-medium">
          Continue initial agitation for {formatTime(nextAgitation || 0)}
        </div>
      );
    }
    
    if (nextAgitation && nextAgitation <= duration) {
      return (
        <div className="text-orange-600 font-medium">
          Agitate for {nextAgitation} seconds
        </div>
      );
    }
    
    return (
      <div className="text-gray-600">
        Next agitation in {formatTime(nextAgitation || 0)}
      </div>
    );
  };

  React.useEffect(() => {
    if (!isRunning || timeLeft > 0) return;

    // Move to next step when current step is complete
    if (currentStep === 'dev') {
      setCurrentStep('stop');
      setTimeLeft(steps.stop.time);
    } else if (currentStep === 'stop') {
      setCurrentStep('fix');
      setTimeLeft(steps.fix.time);
    } else if (currentStep === 'fix') {
      setCurrentStep('wash');
      setTimeLeft(steps.wash.time);
    } else {
      setIsRunning(false);
    }
  }, [isRunning, timeLeft, currentStep, steps]);

  const getWashingMethodDescription = () => {
    switch (washingMethod.type) {
      case 'running':
        return `• Running water rinse for ${washingMethod.runningWaterTime} minutes`;
      case 'ilford':
        return `• Ilford method: ${washingMethod.ilfordInversions.first}/${washingMethod.ilfordInversions.second}/${washingMethod.ilfordInversions.third} inversions`;
      case 'custom':
        return `• ${washingMethod.custom.waterChanges} water changes over ${washingMethod.custom.totalTime} minutes`;
      default:
        return '';
    }
  };

  // Normalize dilution display
  const normalizeDilutionDisplay = (dilution: string): string => {
    return dilution ? dilution.replace(':', '+') : dilution;
  };

  return (
    <div className="space-y-6">
      {/* Main Timer Display */}
      <div className="bg-black text-white p-6 rounded-lg">
        <div className="flex flex-col items-center justify-center">
          <h2 className="text-xl font-medium mb-2">
            {currentStep ? stepLabels[currentStep] : 'Development Process'}
          </h2>
          <div className="text-6xl font-mono font-bold my-4">
            {formatTime(timeLeft)}
          </div>
          <p className="text-lg mb-4">
            at {getStepTemp(currentStep || 'dev')}
          </p>
          <div className="flex gap-4 mt-2">
            {isRunning ? (
              <>
                <button
                  onClick={toggleTimer}
                  className="p-2 rounded-full hover:bg-gray-800 transition-colors"
                  title={isPaused ? "Resume Timer" : "Pause Timer"}
                >
                  {isPaused ? <Play className="w-8 h-8" /> : <Pause className="w-8 h-8" />}
                </button>
                <button
                  onClick={resetTimer}
                  className="p-2 rounded-full hover:bg-gray-800 transition-colors"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-8 h-8" />
                </button>
              </>
            ) : (
              <button
                onClick={() => startTimer('dev')}
                className="px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors text-lg"
              >
                Start Development
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Development Info Card */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium mb-4">Development Process</h3>
        
        {/* Film and Developer Info */}
        <div className="space-y-2 mb-4">
          {filmName && (
            <p>
              <span className="font-medium">Film:</span> {filmName} {filmFormat && `(${filmFormat})`} {filmIso && `@ ISO ${filmIso}`}
            </p>
          )}
          {developerName && (
            <p>
              <span className="font-medium">Developer:</span> {developerName} {developerDilution && `(${normalizeDilutionDisplay(developerDilution)})`}
            </p>
          )}
          {totalVolume && (
            <p>
              <span className="font-medium">Volume:</span> {totalVolume}ml
            </p>
          )}
        </div>
        
        {/* Process Steps */}
        <div className="space-y-3 mt-4">
          <div className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-100 cursor-pointer" onClick={() => !isRunning && startTimer('dev')}>
            <PlayCircle className={`w-6 h-6 ${currentStep === 'dev' ? 'text-blue-500' : 'text-gray-400'}`} />
            <div className="flex-1">
              <p className="font-medium">Development</p>
              <p className="text-sm text-gray-600">{formatTime(steps.dev.time)} at {getStepTemp('dev')}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-100 cursor-pointer" onClick={() => !isRunning && startTimer('stop')}>
            <PlayCircle className={`w-6 h-6 ${currentStep === 'stop' ? 'text-blue-500' : 'text-gray-400'}`} />
            <div className="flex-1">
              <p className="font-medium">Stop Bath</p>
              <p className="text-sm text-gray-600">{formatTime(steps.stop.time)} at {getStepTemp('stop')}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-100 cursor-pointer" onClick={() => !isRunning && startTimer('fix')}>
            <PlayCircle className={`w-6 h-6 ${currentStep === 'fix' ? 'text-blue-500' : 'text-gray-400'}`} />
            <div className="flex-1">
              <p className="font-medium">Fixer</p>
              <p className="text-sm text-gray-600">{formatTime(steps.fix.time)} at {getStepTemp('fix')}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-100 cursor-pointer" onClick={() => !isRunning && startTimer('wash')}>
            <PlayCircle className={`w-6 h-6 ${currentStep === 'wash' ? 'text-blue-500' : 'text-gray-400'}`} />
            <div className="flex-1">
              <p className="font-medium">Washing</p>
              <p className="text-sm text-gray-600">{formatTime(steps.wash.time)} at {getStepTemp('wash')}</p>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="mt-4 text-sm flex items-center gap-1 text-gray-500 hover:text-gray-700"
        >
          <Pencil size={14} /> Edit Process
        </button>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 space-y-6">
            <h3 className="text-lg font-medium">Edit Process Times</h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Stop Bath Time (min)</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={customTimes.stop}
                    onChange={(e) => setCustomTimes(prev => ({ ...prev, stop: Number(e.target.value) }))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Fixer Time (min)</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={customTimes.fix}
                    onChange={(e) => setCustomTimes(prev => ({ ...prev, fix: Number(e.target.value) }))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-3">Washing Method</h4>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <input
                        type="radio"
                        id="running-water"
                        checked={washingMethod.type === 'running'}
                        onChange={() => setWashingMethod(prev => ({
                          ...prev,
                          type: 'running'
                        }))}
                        className="mt-1"
                      />
                      <div>
                        <label htmlFor="running-water" className="text-sm font-medium">Running Water Rinse</label>
                        <p className="text-xs text-gray-500 mt-1">
                          Steady stream of water at processing temperature
                        </p>
                        {washingMethod.type === 'running' && (
                          <div className="mt-2">
                            <label className="text-sm font-medium mb-2 block">Wash Time (min)</label>
                            <input
                              type="number"
                              min="5"
                              max="20"
                              step="1"
                              value={customTimes.wash}
                              onChange={(e) => {
                                const newTime = Number(e.target.value);
                                setCustomTimes(prev => ({ ...prev, wash: newTime }));
                                setWashingMethod(prev => ({ ...prev, runningWaterTime: newTime }));
                              }}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <input
                        type="radio"
                        id="custom-method"
                        checked={washingMethod.type === 'custom'}
                        onChange={() => setWashingMethod(prev => ({
                          ...prev,
                          type: 'custom'
                        }))}
                        className="mt-1"
                      />
                      <div>
                        <label htmlFor="custom-method" className="text-sm font-medium">Custom Method</label>
                        <p className="text-xs text-gray-500 mt-1">
                          Specify total time and number of water changes
                        </p>
                        {washingMethod.type === 'custom' && (
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div>
                              <label className="text-sm mb-1 block">Total Time (min)</label>
                              <input
                                type="number"
                                min="1"
                                value={washingMethod.custom.totalTime}
                                onChange={(e) => setWashingMethod(prev => ({
                                  ...prev,
                                  custom: {
                                    ...prev.custom,
                                    totalTime: Number(e.target.value)
                                  }
                                }))}
                                className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
                              />
                            </div>
                            <div>
                              <label className="text-sm mb-1 block">Water Changes</label>
                              <input
                                type="number"
                                min="1"
                                value={washingMethod.custom.waterChanges}
                                onChange={(e) => setWashingMethod(prev => ({
                                  ...prev,
                                  custom: {
                                    ...prev.custom,
                                    waterChanges: Number(e.target.value)
                                  }
                                }))}
                                className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <input
                        type="radio"
                        id="ilford-method"
                        checked={washingMethod.type === 'ilford'}
                        onChange={() => setWashingMethod(prev => ({
                          ...prev,
                          type: 'ilford'
                        }))}
                        className="mt-1"
                      />
                      <div>
                        <label htmlFor="ilford-method" className="text-sm font-medium">Ilford Method (Fill-and-Dump)</label>
                        <p className="text-xs text-gray-500 mt-1">
                          Three cycles of filling, inverting, and dumping
                        </p>
                        {washingMethod.type === 'ilford' && (
                          <div className="grid grid-cols-3 gap-2 mt-2">
                            <div>
                              <label className="text-xs mb-1 block">First Cycle</label>
                              <input
                                type="number"
                                min="1"
                                value={washingMethod.ilfordInversions?.first || 5}
                                onChange={(e) => setWashingMethod(prev => ({
                                  ...prev,
                                  ilfordInversions: {
                                    ...prev.ilfordInversions,
                                    first: Number(e.target.value)
                                  }
                                }))}
                                className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
                              />
                            </div>
                            <div>
                              <label className="text-xs mb-1 block">Second Cycle</label>
                              <input
                                type="number"
                                min="1"
                                value={washingMethod.ilfordInversions?.second || 10}
                                onChange={(e) => setWashingMethod(prev => ({
                                  ...prev,
                                  ilfordInversions: {
                                    ...prev.ilfordInversions,
                                    second: Number(e.target.value)
                                  }
                                }))}
                                className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
                              />
                            </div>
                            <div>
                              <label className="text-xs mb-1 block">Third Cycle</label>
                              <input
                                type="number"
                                min="1"
                                value={washingMethod.ilfordInversions?.third || 20}
                                onChange={(e) => setWashingMethod(prev => ({
                                  ...prev,
                                  ilfordInversions: {
                                    ...prev.ilfordInversions,
                                    third: Number(e.target.value)
                                  }
                                }))}
                                className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsEditModalOpen(false)
                  // Reset timer if it's not running
                  if (!isRunning) {
                    resetTimer()
                  }
                }}
                className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 