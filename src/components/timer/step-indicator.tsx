"use client"

import { PlayCircle } from "lucide-react"
import { formatTime } from "@/utils/format-time"
import type { Step } from "@/types/development"

interface StepConfig {
  name: string
  time: number
  temp: number
}

interface StepIndicatorProps {
  steps: Record<Step, StepConfig>
  /** Steps to show in order (e.g. pre-soak first when enabled) */
  stepOrder: Step[]
  currentStep: Step | null
  isRunning: boolean
  /** When true, step jumps are disabled (e.g. darkroom shares the same session). */
  disabled?: boolean
  onStartStep: (step: Step) => void
}

const STEP_TEST_IDS: Record<Step, string> = {
  preSoak: "pre-soak-step",
  dev: "development-step",
  stop: "stop-bath-step",
  fix: "fixer-step",
  wash: "washing-step",
}

export function StepIndicator({
  steps,
  stepOrder,
  currentStep,
  isRunning,
  disabled = false,
  onStartStep,
}: StepIndicatorProps) {
  const stepControlsDisabled = disabled || isRunning
  return (
    <div className="space-y-3 mt-4">
      {stepOrder.map((step) => (
        <div
          key={step}
          data-testid={STEP_TEST_IDS[step]}
          className={`flex items-center gap-3 rounded-md p-3 ${
            stepControlsDisabled
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer hover:bg-muted"
          }`}
          onClick={() => !stepControlsDisabled && onStartStep(step)}
        >
          <PlayCircle
            className={`h-6 w-6 ${currentStep === step ? "text-link" : "text-muted-foreground"}`}
          />
          <div className="flex-1">
            <p className="font-medium">{steps[step].name}</p>
            <p className="text-sm text-muted-foreground">
              {formatTime(steps[step].time)}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
