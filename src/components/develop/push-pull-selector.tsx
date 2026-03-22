"use client"

import { findClosestAvailableIso } from "@/utils/available-chart-iso"

const STOP_OPTIONS = [
  { value: -2, label: "Pull -2" },
  { value: -1, label: "Pull -1" },
  { value: 0, label: "Box speed" },
  { value: 1, label: "Push +1" },
  { value: 2, label: "Push +2" },
]

interface PushPullSelectorProps {
  ratingIso: number
  availableIsoValues: number[]
  pushPullStops: number
  onPushPullChange: (stops: number, iso: string) => void
}

function calculateTargetEI(ratingIso: number, stops: number): number {
  return Math.round(ratingIso * Math.pow(2, stops))
}

export function PushPullSelector({
  ratingIso,
  availableIsoValues,
  pushPullStops,
  onPushPullChange,
}: PushPullSelectorProps) {
  const targetEI = calculateTargetEI(ratingIso, pushPullStops)
  const closestAvailable = findClosestAvailableIso(
    targetEI,
    availableIsoValues
  )
  const isExactMatch = closestAvailable === targetEI

  const handleStopChange = (stops: number) => {
    const ei = calculateTargetEI(ratingIso, stops)
    const closest = findClosestAvailableIso(ei, availableIsoValues)
    if (closest !== null) {
      onPushPullChange(stops, closest.toString())
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium">Push / Pull</label>
        <span className="text-xs text-muted-foreground">
          Rated ISO: {ratingIso}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {STOP_OPTIONS.map((opt) => {
          const ei = calculateTargetEI(ratingIso, opt.value)
          const hasExact = availableIsoValues.includes(ei)
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleStopChange(opt.value)}
              className={`py-1.5 px-3 rounded-md text-xs font-medium transition-colors ${
                pushPullStops === opt.value
                  ? "bg-primary text-primary-foreground"
                  : hasExact
                    ? "bg-muted hover:bg-muted/80"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
      {pushPullStops !== 0 && (
        <div className="text-sm">
          <span className="font-medium">Target EI {targetEI}</span>
          {!isExactMatch && closestAvailable !== null && (
            <span className="text-amber-600 ml-2 text-xs">
              (closest available in chart: ISO {closestAvailable})
            </span>
          )}
        </div>
      )}
    </div>
  )
}
