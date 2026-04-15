"use client"

import * as React from "react"
import { PlayCircle, Pencil } from "lucide-react"
import { useTimer } from "@/hooks/use-timer"
import { useWakeLock } from "@/hooks/use-wake-lock"
import { normalizeDilutionDisplay } from "@/utils/normalize-dilution"
import { displayTemp } from "@/utils/temperature"
import { TimerDisplay } from "@/components/timer/timer-display"
import { StepIndicator } from "@/components/timer/step-indicator"
import { ProcessEditor } from "@/components/timer/process-editor"
import { DevelopmentMode } from "@/components/development-mode"
import type { ProcessTimes, WashingMethod, Step } from "@/types/development"

interface TimerProps {
  developmentTime: number
  temperature: number
  filmName?: string
  filmFormat?: "35mm" | "120" | "sheet"
  filmIso?: string
  developerName?: string
  developerDilution?: string
  totalVolume?: number
  temperatureUnit?: string
  isColor?: boolean
  /** e.g. "Pushed +2 (EI 1600)" */
  pushPullLine?: string
  /** e.g. "From chart" / approximate note */
  chartNote?: string
}

export function Timer({
  developmentTime,
  temperature,
  filmName,
  filmFormat = "35mm",
  filmIso,
  developerName,
  developerDilution,
  totalVolume = 500,
  temperatureUnit = "celsius",
  isColor = false,
  pushPullLine,
  chartNote,
}: TimerProps) {
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false)
  const [isDevelopmentModeOpen, setIsDevelopmentModeOpen] = React.useState(false)
  const [washingMethod, setWashingMethod] = React.useState<WashingMethod>({
    type: "running",
    runningWaterTime: isColor ? 3 : 5,
    ilfordInversions: { first: 5, second: 10, third: 20 },
    custom: { totalTime: 5, waterChanges: 3 },
  })
  const [customTimes, setCustomTimes] = React.useState<ProcessTimes>({
    dev: developmentTime,
    stop: 1,
    fix: isColor ? 2 : 5,
    wash: isColor ? 3 : 5,
  })

  const timer = useTimer({ developmentTime, temperature, isColor, customTimes })
  const wakeLock = useWakeLock()

  React.useEffect(() => {
    let washTime = 5
    if (washingMethod.type === "running") washTime = washingMethod.runningWaterTime
    else if (washingMethod.type === "ilford") washTime = 3
    else if (washingMethod.type === "custom") washTime = washingMethod.custom.totalTime
    setCustomTimes((prev) => ({ ...prev, wash: washTime }))
  }, [washingMethod])

  React.useEffect(() => {
    if (timer.isRunning) {
      wakeLock.request()
    } else {
      wakeLock.release()
    }
  }, [timer.isRunning, wakeLock])

  const getStepTemp = (step: Step) =>
    displayTemp(timer.steps[step].temp, temperatureUnit)

  return (
    <div className="space-y-6" data-testid="timer-component">
      <TimerDisplay
        timeLeft={timer.timeLeft}
        currentStep={timer.currentStep}
        isRunning={timer.isRunning}
        isPaused={timer.isPaused}
        shouldShake={timer.shouldShake}
        initialShakePeriod={timer.initialShakePeriod}
        temperatureDisplay={getStepTemp(timer.currentStep || "dev")}
        onStart={() => timer.startTimer("dev")}
        onToggle={timer.toggleTimer}
        onReset={timer.resetTimer}
      />

      <div className="w-full mt-4">
        <button
          onClick={() => setIsDevelopmentModeOpen(true)}
          className="w-full px-6 py-4 bg-foreground text-background hover:bg-foreground/90 transition-colors text-lg flex items-center justify-center gap-2 rounded-lg"
        >
          <PlayCircle className="w-5 h-5" /> Darkroom mode
        </button>
      </div>

      <div className="rounded-lg bg-card p-6 ds-card">
        <h3 className="mb-4 text-lg font-medium">Development Process</h3>
        <div className="space-y-2 mb-4">
          {filmName && (
            <p>
              <span className="font-medium">Film:</span> {filmName}{" "}
              {filmFormat && `(${filmFormat})`} {filmIso && `@ ISO ${filmIso}`}
            </p>
          )}
          {developerName && (
            <p>
              <span className="font-medium">Developer:</span> {developerName}{" "}
              {developerDilution &&
                `(${normalizeDilutionDisplay(developerDilution)})`}
            </p>
          )}
          {totalVolume && (
            <p>
              <span className="font-medium">Volume:</span> {totalVolume}ml
            </p>
          )}
          {pushPullLine && (
            <p className="text-sm text-muted-foreground">{pushPullLine}</p>
          )}
          {chartNote && (
            <p className="text-sm text-muted-foreground">{chartNote}</p>
          )}
        </div>

        <StepIndicator
          steps={timer.steps}
          currentStep={timer.currentStep}
          isRunning={timer.isRunning}
          onStartStep={timer.startTimer}
          getStepTemp={getStepTemp}
        />

        <button
          onClick={() => setIsEditModalOpen(true)}
          className="mt-4 text-sm flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Pencil size={14} /> Edit Process
        </button>
      </div>

      {isEditModalOpen && (
        <ProcessEditor
          customTimes={customTimes}
          onCustomTimesChange={setCustomTimes}
          washingMethod={washingMethod}
          onWashingMethodChange={setWashingMethod}
          onClose={() => setIsEditModalOpen(false)}
          onSave={() => {
            setIsEditModalOpen(false)
            if (!timer.isRunning) timer.resetTimer()
          }}
        />
      )}

      <DevelopmentMode
        isOpen={isDevelopmentModeOpen}
        onClose={() => setIsDevelopmentModeOpen(false)}
        filmName={filmName || "Unknown Film"}
        developerName={developerName || "Unknown Developer"}
        volume={totalVolume.toString()}
        dilution={developerDilution || "Unknown"}
        time={developmentTime * 60}
      />
    </div>
  )
}
