"use client"

import * as React from "react"
import { PlayCircle, Pencil } from "lucide-react"
import { useTimer } from "@/hooks/use-timer"
import { useWakeLock } from "@/hooks/use-wake-lock"
import { normalizeDilutionDisplay } from "@/utils/normalize-dilution"
import { TimerDisplay } from "@/components/timer/timer-display"
import { StepIndicator } from "@/components/timer/step-indicator"
import { ProcessEditor } from "@/components/timer/process-editor"
import { DevelopmentMode } from "@/components/development-mode"
import { buildDevelopmentProcessSnapshot } from "@/lib/process-snapshot"
import type { DevelopmentProcessSnapshot } from "@/types/development-log"
import type { ProcessTimes, WashingMethod, Step } from "@/types/development"

export type DevelopmentSessionId = string

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
  /** Hydrate step durations and wash method from a saved recipe */
  initialProcessTimes?: ProcessTimes
  initialWashingMethod?: WashingMethod
  /** Personal notes (saved recipes), shown separately from chart reference */
  recipeNotes?: string
  /** Fires once each time the dev step countdown completes (current process edits included). */
  onDevComplete?: (
    snapshot: DevelopmentProcessSnapshot,
    sessionId: DevelopmentSessionId,
  ) => void
  /** Full process finished naturally after wash countdown. */
  onProcessComplete?: (
    snapshot: DevelopmentProcessSnapshot,
    sessionId: DevelopmentSessionId,
  ) => void
  /** Fires when a new development session starts (pre-soak or dev). */
  onSessionStart?: (sessionId: DevelopmentSessionId) => void
  /** Fires when resetTimer clears an in-progress step. */
  onSessionReset?: (sessionId: DevelopmentSessionId) => void
  /** Fires when any process step is active (started) vs idle. */
  onRollActiveChange?: (active: boolean) => void
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
  temperatureUnit,
  isColor = false,
  initialProcessTimes,
  initialWashingMethod,
  recipeNotes,
  onDevComplete,
  onProcessComplete,
  onSessionStart,
  onSessionReset,
  onRollActiveChange,
}: TimerProps) {
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false)
  const [isDevelopmentModeOpen, setIsDevelopmentModeOpen] = React.useState(false)
  const [darkroomRollActive, setDarkroomRollActive] = React.useState(false)
  const [washingMethod, setWashingMethod] = React.useState<WashingMethod>(() => {
    if (initialWashingMethod) return initialWashingMethod
    return {
      type: "running",
      runningWaterTime: isColor ? 3 : 5,
      ilfordInversions: { first: 5, second: 10, third: 20 },
      custom: { totalTime: 5, waterChanges: 3 },
    }
  })
  const [customTimes, setCustomTimes] = React.useState<ProcessTimes>(() => {
    if (initialProcessTimes) return initialProcessTimes
    return {
      dev: developmentTime,
      stop: 1,
      fix: isColor ? 2 : 5,
      wash: isColor ? 3 : 5,
    }
  })

  React.useEffect(() => {
    setCustomTimes((prev) => ({ ...prev, dev: developmentTime }))
  }, [developmentTime])

  /** Diary/replay hydrate `wash` via `initialProcessTimes`; skip first derive-from-method pass so wash is not overwritten. */
  const skipInitialWashDeriveRef = React.useRef(
    initialProcessTimes != null && initialWashingMethod != null,
  )

  const snapshotInputRef = React.useRef({
    developmentTime,
    developerDilution,
    temperature,
    temperatureUnit,
    totalVolume,
    isColor,
    customTimes,
    washingMethod,
  })
  snapshotInputRef.current = {
    developmentTime,
    developerDilution,
    temperature,
    temperatureUnit,
    totalVolume,
    isColor,
    customTimes,
    washingMethod,
  }

  const sessionDevelopmentTimeRef = React.useRef(new Map<number, number>())

  const buildCurrentSnapshot = React.useCallback((numericSessionId?: number) => {
    const sIn = snapshotInputRef.current
    const frozenDevTime =
      numericSessionId != null
        ? sessionDevelopmentTimeRef.current.get(numericSessionId)
        : undefined
    const developmentTimeMinutes = frozenDevTime ?? sIn.developmentTime
    return buildDevelopmentProcessSnapshot({
      developmentTimeMinutes,
      developerDilution: sIn.developerDilution ?? null,
      temperature: sIn.temperature,
      temperatureUnit: sIn.temperatureUnit ?? null,
      totalVolume:
        typeof sIn.totalVolume === "number" && Number.isFinite(sIn.totalVolume)
          ? sIn.totalVolume
          : null,
      isColor: sIn.isColor,
      customTimes: { ...sIn.customTimes, dev: developmentTimeMinutes },
      washingMethod: sIn.washingMethod,
    })
  }, [])

  const parseNumericSessionId = React.useCallback((sessionId: DevelopmentSessionId) => {
    const match = /^session:(\d+)$/.exec(sessionId)
    return match ? Number(match[1]) : undefined
  }, [])

  const emitDevComplete = React.useCallback(
    (sessionId: DevelopmentSessionId) => {
      onDevComplete?.(buildCurrentSnapshot(parseNumericSessionId(sessionId)), sessionId)
    },
    [buildCurrentSnapshot, onDevComplete, parseNumericSessionId],
  )

  const emitProcessComplete = React.useCallback(
    (sessionId: DevelopmentSessionId) => {
      onProcessComplete?.(buildCurrentSnapshot(parseNumericSessionId(sessionId)), sessionId)
    },
    [buildCurrentSnapshot, onProcessComplete, parseNumericSessionId],
  )

  const sessionCounterRef = React.useRef(0)
  const currentSessionIdRef = React.useRef(0)
  const processCompleteFiredRef = React.useRef(false)
  const sessionRefs = React.useMemo(
    () => ({
      counter: sessionCounterRef,
      current: currentSessionIdRef,
      processCompleteFired: processCompleteFiredRef,
    }),
    [],
  )
  const formatSessionId = React.useCallback(
    (sessionId: number): DevelopmentSessionId => `session:${sessionId}`,
    [],
  )

  const onSessionStartRef = React.useRef(onSessionStart)
  React.useEffect(() => {
    onSessionStartRef.current = onSessionStart
  }, [onSessionStart])

  const onSessionResetRef = React.useRef(onSessionReset)
  React.useEffect(() => {
    onSessionResetRef.current = onSessionReset
  }, [onSessionReset])

  const timer = useTimer({
    developmentTime,
    temperature,
    isColor,
    customTimes,
    sessionRefs,
    onSessionStart: (sessionId) => {
      sessionDevelopmentTimeRef.current.set(sessionId, developmentTime)
      onSessionStartRef.current?.(formatSessionId(sessionId))
    },
    onSessionReset: (sessionId) => {
      onSessionResetRef.current?.(formatSessionId(sessionId))
    },
    onDevComplete: (sessionId) => emitDevComplete(formatSessionId(sessionId)),
    onProcessComplete: (sessionId) => emitProcessComplete(formatSessionId(sessionId)),
  })

  const stepOrder = React.useMemo((): Step[] => {
    const order: Step[] = []
    if ((customTimes.preSoak ?? 0) > 0) {
      order.push("preSoak")
    }
    order.push("dev", "stop", "fix", "wash")
    return order
  }, [customTimes.preSoak])

  const firstStep = stepOrder[0] ?? "dev"
  const wakeLock = useWakeLock()

  React.useEffect(() => {
    if (skipInitialWashDeriveRef.current) {
      skipInitialWashDeriveRef.current = false
      return
    }
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

  const onRollActiveChangeRef = React.useRef(onRollActiveChange)
  React.useEffect(() => {
    onRollActiveChangeRef.current = onRollActiveChange
  }, [onRollActiveChange])

  React.useEffect(() => {
    onRollActiveChangeRef.current?.(timer.currentStep !== null || darkroomRollActive)
  }, [timer.currentStep, darkroomRollActive])

  return (
    <div className="space-y-6" data-testid="timer-component">
      <TimerDisplay
        timeLeft={timer.timeLeft}
        currentStep={timer.currentStep}
        isRunning={timer.isRunning}
        isPaused={timer.isPaused}
        shouldShake={timer.shouldShake}
        onStart={() => timer.startTimer(firstStep)}
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
        <h3 className="mb-3 text-lg font-medium">Development calculator</h3>
        <div className="mb-4 space-y-1 text-sm text-muted-foreground">
          {filmName && (
            <p>
              <span className="font-medium text-foreground">Film:</span>{" "}
              {filmName} {filmFormat && `(${filmFormat})`}{" "}
              {filmIso && `@ ISO ${filmIso}`}
            </p>
          )}
          {developerName && (
            <p>
              <span className="font-medium text-foreground">Developer:</span>{" "}
              {developerName}{" "}
              {developerDilution &&
                `(${normalizeDilutionDisplay(developerDilution)})`}
            </p>
          )}
          {totalVolume ? (
            <p>
              <span className="font-medium text-foreground">Volume:</span>{" "}
              {totalVolume}ml
            </p>
          ) : null}
          {recipeNotes && (
            <p className="whitespace-pre-wrap pt-1">
              <span className="font-medium text-foreground">Notes: </span>
              {recipeNotes}
            </p>
          )}
        </div>

        <StepIndicator
          steps={timer.steps}
          stepOrder={stepOrder}
          currentStep={timer.currentStep}
          isRunning={timer.isRunning}
          onStartStep={timer.startTimer}
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
        preSoakSeconds={
          (customTimes.preSoak ?? 0) > 0
            ? Math.round((customTimes.preSoak ?? 0) * 60)
            : undefined
        }
        stopSeconds={Math.round(customTimes.stop * 60)}
        fixSeconds={Math.round(customTimes.fix * 60)}
        washSeconds={Math.round(customTimes.wash * 60)}
        sessionRefs={sessionRefs}
        onSessionStart={(sessionId) =>
          onSessionStartRef.current?.(formatSessionId(sessionId))
        }
        onRollActiveChange={setDarkroomRollActive}
        onDevComplete={(sessionId) => emitDevComplete(formatSessionId(sessionId))}
        onProcessComplete={(sessionId) => emitProcessComplete(formatSessionId(sessionId))}
      />
    </div>
  )
}
