"use client"

import React, { useState, useEffect, useRef } from "react"
import { X, RotateCcw } from "lucide-react"
import { AgitationCue } from "@/components/timer/agitation-cue"
import { shouldShakeSpiralTank } from "@/lib/spiral-tank-agitation"
import type { Step } from "@/types/development"

type DarkroomStep = "presoak" | "developer" | "stop" | "fixer" | "wash" | "complete"

function darkroomStepToAgitationStep(step: DarkroomStep): Step | null {
  switch (step) {
    case "developer":
      return "dev"
    case "stop":
      return "stop"
    case "fixer":
      return "fix"
    default:
      return null
  }
}

function agitationStepDuration(
  step: Step,
  devSeconds: number,
  stopSeconds: number,
  fixSeconds: number,
): number {
  if (step === "dev") return devSeconds
  if (step === "stop") return stopSeconds
  return fixSeconds
}

function durationSeconds(value: number | undefined): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0
  return Math.max(0, Math.round(value))
}

interface DevelopmentModeProps {
  isOpen: boolean
  onClose: () => void
  filmName: string
  developerName: string
  volume: string
  dilution: string
  time: number
  /** When set and greater than 0, run this many seconds before development (matches main timer pre-soak). */
  preSoakSeconds?: number
  /** Stop bath duration in seconds (matches main timer). */
  stopSeconds?: number
  /** Fixer duration in seconds (matches main timer). */
  fixSeconds?: number
  /** Wash duration in seconds (matches main timer). */
  washSeconds?: number
  /** Fires once when the developer countdown completes. */
  onDevComplete?: (sessionId: number) => void
  /** When wash finishes by countdown only (not "Next Step" skip). */
  onProcessComplete?: (sessionId: number) => void
}

export function DevelopmentMode({
  isOpen,
  onClose,
  filmName,
  developerName,
  volume,
  dilution,
  time,
  preSoakSeconds,
  stopSeconds = 30,
  fixSeconds = 300,
  washSeconds = 600,
  onDevComplete,
  onProcessComplete,
}: DevelopmentModeProps) {
  const devDuration = durationSeconds(time)
  const preSoakDuration = durationSeconds(preSoakSeconds)
  const stopDuration = durationSeconds(stopSeconds)
  const fixDuration = durationSeconds(fixSeconds)
  const washDuration = durationSeconds(washSeconds)
  const hasPreSoak = preSoakDuration > 0

  const [seconds, setSeconds] = useState(() => (hasPreSoak ? preSoakDuration : devDuration))
  const [isRunning, setIsRunning] = useState(false)
  const [currentStep, setCurrentStep] = useState<DarkroomStep>(() =>
    hasPreSoak ? "presoak" : "developer",
  )
  const scrollPositionRef = useRef<number>(0)
  const devCompleteFiredRef = useRef(false)
  const processCompleteFiredRef = useRef(false)
  const sessionCounterRef = useRef(0)
  const currentSessionIdRef = useRef(0)
  const sessionStartedRef = useRef(false)
  const onDevCompleteRef = useRef(onDevComplete)
  const onProcessCompleteRef = useRef(onProcessComplete)
  const [shouldShake, setShouldShake] = useState(false)

  useEffect(() => {
    onDevCompleteRef.current = onDevComplete
  }, [onDevComplete])

  useEffect(() => {
    onProcessCompleteRef.current = onProcessComplete
  }, [onProcessComplete])

  // Save scroll position when opening and restore when closing
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      scrollPositionRef.current = window.scrollY

      // Prevent scrolling
      document.body.style.overflow = "hidden"
      document.documentElement.style.overflow = "hidden"
      document.documentElement.classList.add("darkroom-mode-active")
    } else {
      // Restore scrolling
      document.body.style.overflow = ""
      document.documentElement.style.overflow = ""
      document.documentElement.classList.remove("darkroom-mode-active")

      // Restore scroll position after a short delay to ensure DOM updates
      setTimeout(() => {
        window.scrollTo(0, scrollPositionRef.current)
      }, 50)
    }

    return () => {
      document.body.style.overflow = ""
      document.documentElement.style.overflow = ""
      document.documentElement.classList.remove("darkroom-mode-active")
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const presoak = preSoakDuration > 0
    setCurrentStep(presoak ? "presoak" : "developer")
    setSeconds(presoak ? preSoakDuration : devDuration)
    setIsRunning(false)
    devCompleteFiredRef.current = false
    processCompleteFiredRef.current = false
    currentSessionIdRef.current = 0
    sessionStartedRef.current = false
    setShouldShake(false)
  }, [isOpen, devDuration, preSoakDuration, stopDuration, fixDuration, washDuration])

  // Format time as MM:SS
  const formatTime = (timeInSeconds: number) => {
    const safeSeconds = durationSeconds(timeInSeconds)
    const minutes = Math.floor(safeSeconds / 60)
    const sec = safeSeconds % 60
    return `${minutes.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`
  }

  // Handle timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prev) => Math.max(0, prev - 1))
      }, 1000)
    } else if (seconds === 0 && isRunning) {
      setIsRunning(false)
      // Move to next step
      if (currentStep === "presoak") setCurrentStep("developer")
      else if (currentStep === "developer") {
        if (!devCompleteFiredRef.current) {
          devCompleteFiredRef.current = true
          onDevCompleteRef.current?.(currentSessionIdRef.current)
        }
        setCurrentStep("stop")
      } else if (currentStep === "stop") setCurrentStep("fixer")
      else if (currentStep === "fixer") setCurrentStep("wash")
      else if (currentStep === "wash") {
        if (!processCompleteFiredRef.current) {
          processCompleteFiredRef.current = true
          onProcessCompleteRef.current?.(currentSessionIdRef.current)
        }
        setCurrentStep("complete")
      }
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, seconds, currentStep])

  // Set appropriate time for each step
  useEffect(() => {
    if (currentStep === "presoak") {
      setSeconds(preSoakDuration)
      setShouldShake(false)
    } else if (currentStep === "developer") {
      setSeconds(devDuration)
    } else if (currentStep === "stop") {
      setSeconds(stopDuration)
      setShouldShake(false)
    } else if (currentStep === "fixer") {
      setSeconds(fixDuration)
      setShouldShake(false)
    } else if (currentStep === "wash") {
      setSeconds(washDuration)
      setShouldShake(false)
    }
  }, [currentStep, devDuration, preSoakDuration, stopDuration, fixDuration, washDuration])

  // Spiral tank / Paterson-style agitation (developer, stop, fixer)
  useEffect(() => {
    const agStep = darkroomStepToAgitationStep(currentStep)
    if (!agStep || !isRunning) {
      setShouldShake(false)
      return
    }
    const stepTotal = agitationStepDuration(agStep, devDuration, stopDuration, fixDuration)
    const elapsedSeconds = stepTotal - seconds
    setShouldShake(shouldShakeSpiralTank(agStep, elapsedSeconds, stepTotal))
  }, [currentStep, isRunning, seconds, devDuration, stopDuration, fixDuration])

  // Reset development process
  const resetDevelopment = () => {
    setIsRunning(false)
    const first: DarkroomStep = hasPreSoak ? "presoak" : "developer"
    setCurrentStep(first)
    setSeconds(first === "presoak" ? preSoakDuration : devDuration)
    devCompleteFiredRef.current = false
    processCompleteFiredRef.current = false
    currentSessionIdRef.current = 0
    sessionStartedRef.current = false
    setShouldShake(false)
  }

  const ensureDevelopmentSession = () => {
    if (sessionStartedRef.current) return
    sessionCounterRef.current += 1
    currentSessionIdRef.current = sessionCounterRef.current
    sessionStartedRef.current = true
  }

  // Handle close with scroll position preservation
  const handleClose = () => {
    onClose()
  }

  if (!isOpen) return null

  const showAgitationCue =
    (currentStep === "developer" ||
      currentStep === "stop" ||
      currentStep === "fixer") &&
    isRunning

  return (
    <div className="fixed inset-0 bg-black z-[9999] flex flex-col items-center overflow-hidden">
      {/* Header with info and close button */}
      <div className="w-full flex justify-between items-center bg-black border-b border-red-900/30">
        <div className="text-red-600 text-sm md:text-base p-2">
          {dilution} @ {formatTime(devDuration)}
        </div>
        <button
          onClick={handleClose}
          className="text-red-600 hover:text-red-400 transition-colors p-2"
          aria-label="Close development mode"
        >
          <X size={24} />
        </button>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-full max-w-4xl mx-auto px-8 py-8">
        {/* Development info */}
        <h1 className="mb-8 text-center text-2xl font-semibold text-red-600 md:text-3xl">
          Development Mode
        </h1>

        <div className="w-full text-red-600 mb-8 flex justify-center">
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between">
              <span className="text-right mr-3">Film:</span>
              <span className="font-semibold">{filmName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-right mr-3">Developer:</span>
              <span className="font-semibold">{developerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-right mr-3">Volume:</span>
              <span className="font-semibold">{volume}ml</span>
            </div>
            <div className="flex justify-between">
              <span className="text-right mr-3">Dilution:</span>
              <span className="font-semibold">{dilution}</span>
            </div>
          </div>
        </div>

        {/* Timer display */}
        <div className="text-red-600 text-center mb-8 w-full">
          <div className="mb-4 font-mono text-8xl font-semibold text-red-600 md:text-9xl">
            {formatTime(seconds)}
          </div>
          <p className="text-xl font-semibold uppercase md:text-2xl">
            {currentStep === "complete"
              ? "DEVELOPMENT COMPLETE"
              : `${currentStep.toUpperCase()} STEP`}
          </p>

          {showAgitationCue && (
            <div className="mt-4 max-w-md mx-auto">
              <AgitationCue shouldShake={shouldShake} variant="dark" />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-6">
          {currentStep !== "complete" && (
            <button
              onClick={() => {
                if (isRunning) {
                  setIsRunning(false)
                } else {
                  if (currentStep === "presoak" || currentStep === "developer") {
                    ensureDevelopmentSession()
                  }
                  setIsRunning(true)
                }
              }}
              className="px-4 md:px-6 py-2 md:py-3 bg-red-900/30 text-red-600 border border-red-900 rounded-md hover:bg-red-900/50 transition-colors text-base md:text-xl"
            >
              {isRunning ? "Pause" : "Start"}
            </button>
          )}

          {!isRunning && currentStep !== "complete" && (
            <button
              onClick={() => {
                if (currentStep === "presoak") setCurrentStep("developer")
                else if (currentStep === "developer") setCurrentStep("stop")
                else if (currentStep === "stop") setCurrentStep("fixer")
                else if (currentStep === "fixer") setCurrentStep("wash")
                else if (currentStep === "wash") setCurrentStep("complete")
              }}
              className="px-4 md:px-6 py-2 md:py-3 bg-red-900/30 text-red-600 border border-red-900 rounded-md hover:bg-red-900/50 transition-colors text-base md:text-xl"
            >
              Next Step
            </button>
          )}

          <button
            onClick={resetDevelopment}
            className="px-4 md:px-6 py-2 md:py-3 bg-red-900/30 text-red-600 border border-red-900 rounded-md hover:bg-red-900/50 transition-colors text-base md:text-xl flex items-center gap-2"
          >
            <RotateCcw size={16} /> Reset
          </button>
        </div>
      </div>

      {/* Process steps */}
      <div className="w-full flex justify-center gap-1 md:gap-4 px-2 overflow-x-auto py-4 border-t border-red-900/30">
        {hasPreSoak ? (
          <div
            className={`p-2 md:p-4 border rounded-md text-xs md:text-base ${currentStep === "presoak" ? "border-red-600 bg-red-900/30" : "border-red-900/50 bg-transparent"}`}
          >
            <p className="font-semibold text-red-600">Pre soak</p>
          </div>
        ) : null}
        <div
          className={`p-2 md:p-4 border rounded-md text-xs md:text-base ${currentStep === "developer" ? "border-red-600 bg-red-900/30" : "border-red-900/50 bg-transparent"}`}
        >
          <p className="font-semibold text-red-600">Developer</p>
        </div>
        <div
          className={`p-2 md:p-4 border rounded-md text-xs md:text-base ${currentStep === "stop" ? "border-red-600 bg-red-900/30" : "border-red-900/50 bg-transparent"}`}
        >
          <p className="font-semibold text-red-600">Stop Bath</p>
        </div>
        <div
          className={`p-2 md:p-4 border rounded-md text-xs md:text-base ${currentStep === "fixer" ? "border-red-600 bg-red-900/30" : "border-red-900/50 bg-transparent"}`}
        >
          <p className="font-semibold text-red-600">Fixer</p>
        </div>
        <div
          className={`p-2 md:p-4 border rounded-md text-xs md:text-base ${currentStep === "wash" ? "border-red-600 bg-red-900/30" : "border-red-900/50 bg-transparent"}`}
        >
          <p className="font-semibold text-red-600">Wash</p>
        </div>
        <div
          className={`p-2 md:p-4 border rounded-md text-xs md:text-base ${currentStep === "complete" ? "border-red-600 bg-red-900/30" : "border-red-900/50 bg-transparent"}`}
        >
          <p className="font-semibold text-red-600">Complete</p>
        </div>
      </div>
    </div>
  )
}
