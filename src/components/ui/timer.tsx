"use client"

import * as React from "react"
import { Play, Pause, RotateCcw } from "lucide-react"

interface TimerProps {
  developmentTime: number
  temperatureUnit: string
  temperature: number
  isColor?: boolean
}

export function Timer({ developmentTime, temperatureUnit, temperature, isColor = false }: TimerProps) {
  const [isRunning, setIsRunning] = React.useState(false)
  const [currentStep, setCurrentStep] = React.useState<'dev' | 'stop' | 'fix' | null>(null)
  const [timeLeft, setTimeLeft] = React.useState(0)
  const [nextAgitation, setNextAgitation] = React.useState<number | null>(null)
  
  const steps = {
    dev: {
      name: "Development",
      time: developmentTime * 60, // Convert to seconds
      temp: temperature,
      agitation: isColor ? {
        initial: 60, // 1 minute continuous for color
        interval: 30, // Invert every 30 seconds for color
        duration: 5 // 5 seconds of agitation
      } : {
        initial: 30, // 30 seconds continuous for B&W
        interval: 30, // Every 30 seconds for B&W
        duration: 10 // 10 seconds of agitation
      }
    },
    stop: {
      name: "Stop Bath",
      time: 60, // 1 minute
      temp: 20, // Room temperature
      agitation: {
        initial: 30,
        interval: 30,
        duration: 5
      }
    },
    fix: {
      name: "Fixer",
      time: 300, // 5 minutes
      temp: 20, // Room temperature
      agitation: {
        initial: 30,
        interval: 60, // Every minute
        duration: 10
      }
    }
  }

  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          const newTime = time - 1;
          
          // Update next agitation time
          if (currentStep && steps[currentStep].agitation) {
            const { initial, interval, duration } = steps[currentStep].agitation;
            const totalTime = steps[currentStep].time;
            const elapsed = totalTime - newTime;
            
            if (elapsed < initial) {
              // During initial agitation
              setNextAgitation(initial - elapsed);
            } else {
              // Calculate time until next interval agitation
              const timeSinceInitial = elapsed - initial;
              const timeUntilNext = interval - (timeSinceInitial % interval);
              setNextAgitation(timeUntilNext);
            }
          }
          
          return newTime;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      setNextAgitation(null);
      if (currentStep === 'dev') {
        // Move to stop bath
        setCurrentStep('stop');
        setTimeLeft(steps.stop.time);
      } else if (currentStep === 'stop') {
        // Move to fixer
        setCurrentStep('fix');
        setTimeLeft(steps.fix.time);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, currentStep, steps]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = (step: 'dev' | 'stop' | 'fix') => {
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
    setCurrentStep(null);
    setTimeLeft(0);
    setNextAgitation(null);
  };

  const getStepTemp = (step: 'dev' | 'stop' | 'fix') => {
    const temp = steps[step].temp;
    return temperatureUnit === 'celsius' 
      ? `${temp}°C` 
      : `${(temp * 9/5 + 32).toFixed(1)}°F`;
  };

  const getAgitationInstructions = () => {
    if (!currentStep || !steps[currentStep].agitation) return null;
    
    const { initial, interval, duration } = steps[currentStep].agitation;
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
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => startTimer('dev')}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Start Development ({formatTime(steps.dev.time)})
              </button>
              <button
                onClick={() => startTimer('stop')}
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
              >
                Start Stop Bath ({formatTime(steps.stop.time)})
              </button>
              <button
                onClick={() => startTimer('fix')}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                Start Fixer ({formatTime(steps.fix.time)})
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium">Process Steps:</h3>
        <div className="space-y-1 text-sm">
          <div>
            <p>1. Development: {formatTime(steps.dev.time)} at {getStepTemp('dev')}</p>
            <p className="text-sm text-gray-600 pl-4">
              {isColor ? 
                "• 1 minute initial agitation, then invert every 30 seconds" :
                "• 30 seconds initial agitation, then 10 seconds every 30 seconds"}
            </p>
          </div>
          <div>
            <p>2. Stop Bath: {formatTime(steps.stop.time)} at {getStepTemp('stop')}</p>
            <p className="text-sm text-gray-600 pl-4">
              • 30 seconds initial agitation, then 5 seconds every 30 seconds
            </p>
          </div>
          <div>
            <p>3. Fixer: {formatTime(steps.fix.time)} at {getStepTemp('fix')}</p>
            <p className="text-sm text-gray-600 pl-4">
              • 30 seconds initial agitation, then 10 seconds every minute
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 