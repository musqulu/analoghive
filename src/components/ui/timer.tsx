"use client"

import * as React from "react"
import { Play, Pause, RotateCcw, PlayCircle } from "lucide-react"

interface TimerProps {
  developmentTime: number
  temperatureUnit: string
  temperature: number
  isColor?: boolean
}

type Step = 'dev' | 'stop' | 'fix' | 'wash';

export function Timer({ developmentTime, temperatureUnit, temperature, isColor = false }: TimerProps) {
  const [isRunning, setIsRunning] = React.useState(false)
  const [currentStep, setCurrentStep] = React.useState<Step>('dev')
  const [timeLeft, setTimeLeft] = React.useState(developmentTime * 60)
  const [nextAgitation, setNextAgitation] = React.useState<number | null>(null)
  
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
      time: 60,
      temp: 20,
      agitation: {
        initial: 30,
        interval: 30,
        duration: 5
      }
    },
    fix: {
      name: "Fixer",
      time: isColor ? 120 : 300,
      temp: 20,
      agitation: {
        initial: 30,
        interval: 60,
        duration: 10
      }
    },
    wash: {
      name: "Washing",
      time: isColor ? 180 : 300, // 3 minutes for color, 5 minutes for B&W
      temp: 20,
      agitation: {
        initial: 0,
        interval: 60,
        duration: 10
      }
    }
  }), [developmentTime, temperature, isColor])

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
            
            if (elapsed < initial) {
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
    
    const { initial, duration } = steps[currentStep].agitation;
    const totalTime = steps[currentStep].time;
    const elapsed = totalTime - timeLeft;
    
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
          Agitate now for {duration} seconds
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

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="text-4xl font-mono font-bold text-center">
          {timeLeft > 0 ? formatTime(timeLeft) : "0:00"}
        </div>
        
        {currentStep && (
          <div className="text-center space-y-2">
            <p className="text-lg font-medium">{steps[currentStep].name}</p>
            <p className="text-sm text-gray-600">Temperature: {getStepTemp(currentStep)}</p>
            {isRunning && getAgitationInstructions()}
          </div>
        )}

        <div className="flex justify-center space-x-4">
          {timeLeft > 0 ? (
            <>
              <button
                onClick={toggleTimer}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </button>
              <button
                onClick={resetTimer}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
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
                • Running water, gentle agitation every minute
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 