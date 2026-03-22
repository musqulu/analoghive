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
  currentStep: Step | null
  isRunning: boolean
  onStartStep: (step: Step) => void
  getStepTemp: (step: Step) => string
}

const STEP_ORDER: Step[] = ["dev", "stop", "fix", "wash"]

export function StepIndicator({
  steps,
  currentStep,
  isRunning,
  onStartStep,
  getStepTemp,
}: StepIndicatorProps) {
  return (
    <div className="space-y-3 mt-4">
      {STEP_ORDER.map((step) => (
        <div
          key={step}
          className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-100 cursor-pointer"
          onClick={() => !isRunning && onStartStep(step)}
        >
          <PlayCircle
            className={`w-6 h-6 ${currentStep === step ? "text-blue-500" : "text-gray-400"}`}
          />
          <div className="flex-1">
            <p className="font-medium">{steps[step].name}</p>
            <p className="text-sm text-gray-600">
              {formatTime(steps[step].time)} at {getStepTemp(step)}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
