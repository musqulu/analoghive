"use client"

import * as React from "react"
import { shouldShakeSpiralTank } from "@/lib/spiral-tank-agitation"
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
  /**
   * Fires once each time the dev step countdown finishes from a `startTimer("dev")`
   * (or auto-advance from `preSoak`). Re-arms when `startTimer` enters `dev` again.
   * Used by /develop/timer to auto-record a darkroom log entry.
   */
  onDevComplete?: () => void
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
  onDevComplete,
}: UseTimerOptions) {
  const [timeLeft, setTimeLeft] = React.useState(() =>
    initialIdleSeconds(customTimes, developmentTime),
  )
  const [isRunning, setIsRunning] = React.useState(false)
  const [isPaused, setIsPaused] = React.useState(false)
  const [currentStep, setCurrentStep] = React.useState<Step | null>(null)
  const [shouldShake, setShouldShake] = React.useState(false)

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
        time: Math.round(customTimes.stop * 60),
        temp: 20,
        agitation: { initial: 30, interval: 30, duration: 5 },
      },
      fix: {
        name: "Fixer",
        time: Math.round(customTimes.fix * 60),
        temp: 20,
        agitation: { initial: 30, interval: 60, duration: 10 },
      },
      wash: {
        name: "Washing",
        time: Math.round(customTimes.wash * 60),
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

  // Spiral tank / Paterson-style agitation cues (dev, stop, fix)
  React.useEffect(() => {
    if (!currentStep || !isRunning) {
      setShouldShake(false)
      return
    }
    if (currentStep !== "dev" && currentStep !== "stop" && currentStep !== "fix") {
      setShouldShake(false)
      return
    }
    const stepTotal = steps[currentStep].time
    const elapsedSeconds = stepTotal - timeLeft
    setShouldShake(
      shouldShakeSpiralTank(currentStep, elapsedSeconds, stepTotal),
    )
  }, [currentStep, isRunning, timeLeft, steps])

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

  // Keep latest callback in a ref so the auto-advance effect doesn't re-trigger
  // when callers pass an inline arrow.
  const onDevCompleteRef = React.useRef(onDevComplete)
  React.useEffect(() => {
    onDevCompleteRef.current = onDevComplete
  }, [onDevComplete])

  // Guards `onDevComplete` to fire once per `startTimer("dev")` invocation; resets
  // when dev is started again (or via resetTimer mid-dev).
  const devCompleteFiredRef = React.useRef(false)

  // Auto-advance steps
  React.useEffect(() => {
    if (!isRunning || timeLeft > 0) return
    if (currentStep) {
      if (currentStep === "dev" && !devCompleteFiredRef.current) {
        devCompleteFiredRef.current = true
        onDevCompleteRef.current?.()
      }
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
    if (step === "dev" || step === "preSoak") {
      devCompleteFiredRef.current = false
    }
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
      if (currentStep === "dev" || currentStep === "preSoak") {
        devCompleteFiredRef.current = false
      }
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
    steps,
    startTimer,
    toggleTimer,
    resetTimer,
  }
}
