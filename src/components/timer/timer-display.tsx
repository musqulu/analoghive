"use client"

import { Play, Pause, RotateCcw } from "lucide-react"
import { formatTime } from "@/utils/format-time"
import { AgitationCue } from "./agitation-cue"
import type { Step } from "@/types/development"

const STEP_LABELS: Record<Step, string> = {
  dev: "Development",
  stop: "Stop Bath",
  fix: "Fixer",
  wash: "Washing",
}

interface TimerDisplayProps {
  timeLeft: number
  currentStep: Step | null
  isRunning: boolean
  isPaused: boolean
  shouldShake: boolean
  initialShakePeriod: boolean
  temperatureDisplay: string
  onStart: () => void
  onToggle: () => void
  onReset: () => void
}

export function TimerDisplay({
  timeLeft,
  currentStep,
  isRunning,
  isPaused,
  shouldShake,
  initialShakePeriod,
  temperatureDisplay,
  onStart,
  onToggle,
  onReset,
}: TimerDisplayProps) {
  return (
    <div className="bg-black text-white p-6 rounded-lg">
      <div className="flex flex-col items-center justify-center">
        <h2 className="text-xl font-medium mb-2">
          {currentStep ? STEP_LABELS[currentStep] : "Development Process"}
        </h2>
        <div className="text-6xl font-mono font-bold my-4">
          {formatTime(timeLeft)}
        </div>
        <p className="text-lg mb-4">at {temperatureDisplay}</p>

        {currentStep === "dev" && isRunning && !isPaused && (
          <AgitationCue
            shouldShake={shouldShake}
            initialShakePeriod={initialShakePeriod}
            variant="light"
          />
        )}

        {isRunning ? (
          <div className="flex gap-4 mt-2">
            <button
              onClick={onToggle}
              className="p-2 rounded-full hover:bg-gray-800 transition-colors"
              title={isPaused ? "Resume Timer" : "Pause Timer"}
            >
              {isPaused ? (
                <Play className="w-8 h-8" />
              ) : (
                <Pause className="w-8 h-8" />
              )}
            </button>
            <button
              onClick={onReset}
              className="p-2 rounded-full hover:bg-gray-800 transition-colors"
              title="Reset Timer"
            >
              <RotateCcw className="w-8 h-8" />
            </button>
          </div>
        ) : (
          <button
            onClick={onStart}
            className="p-4 rounded-full bg-white text-black hover:bg-gray-200 transition-colors"
            title="Start Timer"
          >
            <Play className="w-8 h-8" />
          </button>
        )}
      </div>
    </div>
  )
}
