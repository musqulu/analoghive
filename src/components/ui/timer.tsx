"use client"

import * as React from "react"
import { Play, Pause, RotateCcw, PlayCircle, Pencil } from "lucide-react"

interface TimerProps {
  developmentTime: number
  temperatureUnit: string
  temperature: number
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

export function Timer({ developmentTime, temperatureUnit, temperature, isColor = false }: TimerProps) {
  const [isRunning, setIsRunning] = React.useState(false)
  const [currentStep, setCurrentStep] = React.useState<Step>('dev')
  const [timeLeft, setTimeLeft] = React.useState(developmentTime * 60)
  const [nextAgitation, setNextAgitation] = React.useState<number | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false)
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

  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          const newTime = time - 1;
          
          // Update next agitation time
          if (currentStep && steps[currentStep].agitation) {
            const { initial, interval: agitationInterval, duration } = steps[currentStep].agitation;
            const totalTime = steps[currentStep].time;
            const elapsed = totalTime - newTime;
            
            // Start initial agitation immediately
            if (elapsed === 0) {
              setNextAgitation(initial);
            } else if (elapsed < initial) {
              // During initial agitation
              setNextAgitation(initial - elapsed);
            } else {
              // Calculate time until next interval agitation
              const timeSinceInitial = elapsed - initial;
              const timeUntilNext = agitationInterval - (timeSinceInitial % agitationInterval);
              if (timeUntilNext <= duration) {
                // Show agitation instruction
                setNextAgitation(timeUntilNext);
              } else {
                // Show countdown to next agitation
                setNextAgitation(timeUntilNext);
              }
            }
          }
          
          return newTime;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      setNextAgitation(null);
      if (currentStep === 'dev') {
        setCurrentStep('stop');
        setTimeLeft(steps.stop.time);
      } else if (currentStep === 'stop') {
        setCurrentStep('fix');
        setTimeLeft(steps.fix.time);
      } else if (currentStep === 'fix') {
        setCurrentStep('wash');
        setTimeLeft(steps.wash.time);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, currentStep, steps]);

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

  const startTimer = (step: 'dev' | 'stop' | 'fix' | 'wash') => {
    setCurrentStep(step);
    setTimeLeft(steps[step].time);
    // Set initial agitation duration immediately
    setNextAgitation(steps[step].agitation.initial);
    setIsRunning(true);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setCurrentStep('dev');
    setTimeLeft(developmentTime * 60);
    setNextAgitation(null);
  };

  const getStepTemp = (step: 'dev' | 'stop' | 'fix' | 'wash') => {
    const temp = steps[step].temp;
    return temperatureUnit === 'celsius' 
      ? `${temp}°C` 
      : `${(temp * 9/5 + 32).toFixed(1)}°F`;
  };

  const getAgitationInstructions = () => {
    if (!currentStep || !steps[currentStep].agitation) return null;
    
    const { initial, interval: agitationInterval, duration } = steps[currentStep].agitation;
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Development</h3>
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          title="Edit Process Times"
        >
          <Pencil className="w-4 h-4" />
          <span>Edit times</span>
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

      <div className="space-y-4">
        <div className="text-4xl font-mono font-bold text-center">
          {timeLeft > 0 ? formatTime(timeLeft) : "0:00"}
        </div>
        
        {currentStep && (
          <div className="text-center space-y-2">
            <p className="text-lg font-medium">{steps[currentStep].name}</p>
            <p className="text-sm text-gray-600">Temperature: {getStepTemp(currentStep)}</p>
            {(isRunning || nextAgitation) && getAgitationInstructions()}
          </div>
        )}

        <div className="flex justify-center space-x-4">
          {timeLeft > 0 ? (
            <>
              <button
                onClick={toggleTimer}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                title={isRunning ? "Pause" : "Resume"}
              >
                {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </button>
              <button
                onClick={resetTimer}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="Reset Timer"
              >
                <RotateCcw className="w-6 h-6" />
              </button>
            </>
          ) : (
            <button
              onClick={() => startTimer('dev')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Start Development ({formatTime(steps.dev.time)})
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium">Process Steps:</h3>
        <div className="space-y-1 text-sm">
          <div className="flex items-start gap-2">
            <button 
              onClick={() => !isRunning && startTimer('dev')}
              className="mt-1 p-1 hover:bg-gray-100 rounded-full transition-colors"
              disabled={isRunning}
              title="Start Development"
            >
              <PlayCircle className="w-5 h-5 text-blue-500" />
            </button>
            <div className="flex-1">
              <p>1. Development: {formatTime(steps.dev.time)} at {getStepTemp('dev')}</p>
              <p className="text-sm text-gray-600 pl-4">
                {isColor ? 
                  "• 1 minute initial agitation, then invert every 30 seconds" :
                  "• 30 seconds initial agitation, then 10 seconds every 30 seconds"}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <button 
              onClick={() => !isRunning && startTimer('stop')}
              className="mt-1 p-1 hover:bg-gray-100 rounded-full transition-colors"
              disabled={isRunning}
              title="Start Stop Bath"
            >
              <PlayCircle className="w-5 h-5 text-yellow-500" />
            </button>
            <div className="flex-1">
              <p>2. Stop Bath: {formatTime(steps.stop.time)} at {getStepTemp('stop')}</p>
              <p className="text-sm text-gray-600 pl-4">
                • 30 seconds initial agitation, then 5 seconds every 30 seconds
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <button 
              onClick={() => !isRunning && startTimer('fix')}
              className="mt-1 p-1 hover:bg-gray-100 rounded-full transition-colors"
              disabled={isRunning}
              title="Start Fixer"
            >
              <PlayCircle className="w-5 h-5 text-green-500" />
            </button>
            <div className="flex-1">
              <p>3. Fixer: {formatTime(steps.fix.time)} at {getStepTemp('fix')}</p>
              <p className="text-sm text-gray-600 pl-4">
                • 30 seconds initial agitation, then 10 seconds every minute
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <button 
              onClick={() => !isRunning && startTimer('wash')}
              className="mt-1 p-1 hover:bg-gray-100 rounded-full transition-colors"
              disabled={isRunning}
              title="Start Washing"
            >
              <PlayCircle className="w-5 h-5 text-cyan-500" />
            </button>
            <div className="flex-1">
              <p>4. Washing: {formatTime(steps.wash.time)} at {getStepTemp('wash')}</p>
              <p className="text-sm text-gray-600 pl-4">
                {getWashingMethodDescription()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 