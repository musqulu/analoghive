"use client"

import * as React from "react"
import type { Step, ProcessTimes } from "@/types/development"

interface StepConfig {
  name: string
  time: number
  temp: number
  agitation: { initial: number; interval: number; duration: number }
}

interface UseTimerOptions {
  developmentTime: number
  temperature: number
  isColor?: boolean
  customTimes: ProcessTimes
}

export function useTimer({
  developmentTime,
  temperature,
  isColor = false,
  customTimes,
}: UseTimerOptions) {
  const [timeLeft, setTimeLeft] = React.useState(developmentTime * 60)
  const [isRunning, setIsRunning] = React.useState(false)
  const [isPaused, setIsPaused] = React.useState(false)
  const [currentStep, setCurrentStep] = React.useState<Step | null>(null)
  const [shouldShake, setShouldShake] = React.useState(false)
  const [initialShakePeriod, setInitialShakePeriod] = React.useState(true)

  const steps = React.useMemo<Record<Step, StepConfig>>(
    () => ({
      dev: {
        name: "Development",
        time: developmentTime * 60,
        temp: temperature,
        agitation: isColor
          ? { initial: 60, interval: 30, duration: 5 }
          : { initial: 30, interval: 30, duration: 10 },
      },
      stop: {
        name: "Stop Bath",
        time: customTimes.stop * 60,
        temp: 20,
        agitation: { initial: 30, interval: 30, duration: 5 },
      },
      fix: {
        name: "Fixer",
        time: customTimes.fix * 60,
        temp: 20,
        agitation: { initial: 30, interval: 60, duration: 10 },
      },
      wash: {
        name: "Washing",
        time: customTimes.wash * 60,
        temp: 20,
        agitation: { initial: 0, interval: 60, duration: 10 },
      },
    }),
    [developmentTime, customTimes, temperature, isColor]
  )

  React.useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) return 0
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning, isPaused, timeLeft])

  React.useEffect(() => {
    setTimeLeft(Math.round(developmentTime * 60))
  }, [developmentTime])

  // Shaking logic
  React.useEffect(() => {
    if (currentStep !== "dev" || !isRunning || isPaused) {
      setShouldShake(false)
      return
    }
    const totalTime = developmentTime * 60
    const elapsedSeconds = totalTime - timeLeft
    if (elapsedSeconds < 30) {
      setShouldShake(true)
      setInitialShakePeriod(true)
    } else {
      if (initialShakePeriod) {
        setInitialShakePeriod(false)
        setShouldShake(false)
      }
      if (!initialShakePeriod && elapsedSeconds >= 60) {
        const secondsInCurrentMinute = timeLeft % 60
        setShouldShake(secondsInCurrentMinute >= 50)
      }
    }
  }, [currentStep, isRunning, isPaused, timeLeft, developmentTime, initialShakePeriod])

  React.useEffect(() => {
    if (currentStep === "dev") {
      setInitialShakePeriod(true)
    } else {
      setShouldShake(false)
      setInitialShakePeriod(false)
    }
  }, [currentStep])

  // Auto-advance steps
  React.useEffect(() => {
    if (!isRunning || timeLeft > 0) return
    const nextStepMap: Record<Step, Step | null> = {
      dev: "stop",
      stop: "fix",
      fix: "wash",
      wash: null,
    }
    if (currentStep) {
      const next = nextStepMap[currentStep]
      if (next) {
        setCurrentStep(next)
        setTimeLeft(steps[next].time)
      } else {
        setIsRunning(false)
      }
    }
  }, [isRunning, timeLeft, currentStep, steps])

  const startTimer = (step: Step) => {
    setCurrentStep(step)
    setTimeLeft(steps[step].time)
    setIsRunning(true)
    setIsPaused(false)
  }

  const toggleTimer = () => {
    if (isRunning) setIsPaused(!isPaused)
  }

  const resetTimer = () => {
    if (currentStep) {
      setTimeLeft(steps[currentStep].time)
      setIsRunning(false)
      setIsPaused(false)
    }
  }

  return {
    timeLeft,
    isRunning,
    isPaused,
    currentStep,
    shouldShake,
    initialShakePeriod,
    steps,
    startTimer,
    toggleTimer,
    resetTimer,
  }
}
