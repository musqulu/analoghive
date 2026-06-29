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

export interface TimerSessionRefs {
  counter: React.MutableRefObject<number>
  current: React.MutableRefObject<number>
}

interface UseTimerOptions {
  developmentTime: number
  temperature: number
  isColor?: boolean
  customTimes: ProcessTimes
  /** When set, shares session ids with DevelopmentMode (or other timer UI). */
  sessionRefs?: TimerSessionRefs
  /**
   * Fires once each time the dev step countdown finishes from a `startTimer("dev")`
   * (or auto-advance from `preSoak`). Re-arms when `startTimer` enters `dev` again.
   * Used by /develop/timer to auto-record a darkroom log entry.
   */
  onDevComplete?: (sessionId: number) => void
  /**
   * Fires once when the wash step finishes naturally (timer reaches zero) and there
   * is no further step — not when skipping steps manually. Resets like `onDevComplete`
   * when entering `preSoak` / `dev` via `startTimer`, or when starting any step after a
   * completed wash countdown. `resetTimer` does not clear this guard.
   */
  onProcessComplete?: (sessionId: number) => void
  /** Fires when a new development session id is allocated (pre-soak or dev start). */
  onSessionStart?: (sessionId: number) => void
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
  sessionRefs,
  onDevComplete,
  onProcessComplete,
  onSessionStart,
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
    if (!isRunning && currentStep === null) setTimeLeft(idleFirstSeconds)
  }, [idleFirstSeconds, isRunning, currentStep])

  const prevActiveStepDurationRef = React.useRef<number | null>(null)
  React.useEffect(() => {
    if (!isRunning || !currentStep || currentStep === "dev") {
      prevActiveStepDurationRef.current = null
      return
    }
    const stepDuration = steps[currentStep].time
    const prevDuration = prevActiveStepDurationRef.current
    if (prevDuration !== null && prevDuration !== stepDuration) {
      setTimeLeft(stepDuration)
    }
    prevActiveStepDurationRef.current = stepDuration
  }, [currentStep, isRunning, steps])

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

  const onProcessCompleteRef = React.useRef(onProcessComplete)
  React.useEffect(() => {
    onProcessCompleteRef.current = onProcessComplete
  }, [onProcessComplete])

  const onSessionStartRef = React.useRef(onSessionStart)
  React.useEffect(() => {
    onSessionStartRef.current = onSessionStart
  }, [onSessionStart])

  // Guards `onDevComplete` to fire once per `startTimer("dev")` invocation; resets
  // when dev is started again (or via resetTimer mid-dev).
  const devCompleteFiredRef = React.useRef(false)
  /** Once per wash completion from the countdown (not skips). Reset with dev guard + resetTimer. */
  const processCompleteFiredRef = React.useRef(false)
  const internalSessionCounterRef = React.useRef(0)
  const internalCurrentSessionIdRef = React.useRef(0)
  const sessionCounterRef = sessionRefs?.counter ?? internalSessionCounterRef
  const currentSessionIdRef = sessionRefs?.current ?? internalCurrentSessionIdRef

  // Auto-advance steps
  React.useEffect(() => {
    if (!isRunning || timeLeft > 0) return
    if (currentStep) {
      if (currentStep === "dev" && !devCompleteFiredRef.current) {
        devCompleteFiredRef.current = true
        onDevCompleteRef.current?.(currentSessionIdRef.current)
      }
      const next = getNextStep(currentStep)
      if (next) {
        setCurrentStep(next)
        setTimeLeft(steps[next].time)
      } else {
        if (currentStep === "wash" && !processCompleteFiredRef.current) {
          processCompleteFiredRef.current = true
          onProcessCompleteRef.current?.(currentSessionIdRef.current)
        }
        setIsRunning(false)
      }
    }
  }, [isRunning, timeLeft, currentStep, steps, getNextStep])

  const startTimer = (step: Step) => {
    const shouldStartNewSession =
      step === "dev" ||
      step === "preSoak" ||
      (!isRunning && processCompleteFiredRef.current)
    if (shouldStartNewSession) {
      sessionCounterRef.current += 1
      currentSessionIdRef.current = sessionCounterRef.current
      devCompleteFiredRef.current = false
      processCompleteFiredRef.current = false
      onSessionStartRef.current?.(currentSessionIdRef.current)
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
      setCurrentStep(null)
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
