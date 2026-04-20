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

function hasPreSoakDuration(customTimes: ProcessTimes): boolean {
  return (customTimes.preSoak ?? 0) > 0
}

function initialIdleSeconds(customTimes: ProcessTimes, developmentTime: number): number {
  if (hasPreSoakDuration(customTimes)) {
    return Math.round((customTimes.preSoak ?? 0) * 60)
  }
  return Math.round(developmentTime * 60)
}

export function useTimer({
  developmentTime,
  temperature,
  isColor = false,
  customTimes,
}: UseTimerOptions) {
  const [timeLeft, setTimeLeft] = React.useState(() =>
    initialIdleSeconds(customTimes, developmentTime),
  )
  const [isRunning, setIsRunning] = React.useState(false)
  const [isPaused, setIsPaused] = React.useState(false)
  const [currentStep, setCurrentStep] = React.useState<Step | null>(null)
  const [shouldShake, setShouldShake] = React.useState(false)
  const [initialShakePeriod, setInitialShakePeriod] = React.useState(true)

  const preSoakActive = hasPreSoakDuration(customTimes)

  const steps = React.useMemo<Record<Step, StepConfig>>(
    () => ({
      preSoak: {
        name: "Pre soak",
        time: Math.max(0, Math.round((customTimes.preSoak ?? 0) * 60)),
        temp: temperature,
        agitation: { initial: 0, interval: 60, duration: 5 },
      },
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
    [developmentTime, customTimes, temperature, isColor],
  )

  const idleFirstSeconds = React.useMemo(() => {
    if (preSoakActive) {
      return Math.round((customTimes.preSoak ?? 0) * 60)
    }
    return Math.round(developmentTime * 60)
  }, [preSoakActive, customTimes.preSoak, developmentTime])

  React.useEffect(() => {
    setTimeLeft(idleFirstSeconds)
  }, [idleFirstSeconds])

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

  // Shaking logic (development only)
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

  const getNextStep = React.useCallback((step: Step): Step | null => {
    switch (step) {
      case "preSoak":
        return "dev"
      case "dev":
        return "stop"
      case "stop":
        return "fix"
      case "fix":
        return "wash"
      case "wash":
        return null
      default:
        return null
    }
  }, [])

  // Auto-advance steps
  React.useEffect(() => {
    if (!isRunning || timeLeft > 0) return
    if (currentStep) {
      const next = getNextStep(currentStep)
      if (next) {
        setCurrentStep(next)
        setTimeLeft(steps[next].time)
      } else {
        setIsRunning(false)
      }
    }
  }, [isRunning, timeLeft, currentStep, steps, getNextStep])

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
