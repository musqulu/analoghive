"use client"

import * as React from "react"
import { calculateCorrectedTime } from "@/data/processed-development-times"
import { formatTime } from "@/utils/format-time"

export default function TemperatureCorrectionPage() {
  const [baseTemp, setBaseTemp] = React.useState(20)
  const [baseTime, setBaseTime] = React.useState(10)
  const [newTemp, setNewTemp] = React.useState(20)
  const [constantAgitation, setConstantAgitation] = React.useState(false)

  const correctedTime = React.useMemo(
    () => calculateCorrectedTime(baseTemp, baseTime, newTemp, constantAgitation),
    [baseTemp, baseTime, newTemp, constantAgitation]
  )

  const inputClass = "ds-input"

  return (
    <main className="min-h-screen flex flex-col items-center p-8 pt-12">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Temperature Correction
          </h1>
          <p className="text-muted-foreground mt-1">
            Adjust development time for a different processing temperature.
          </p>
        </div>

        <div className="space-y-4 rounded-lg bg-card p-6 ds-card">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Recommended Temp (°C)
              </label>
              <input
                type="number"
                value={baseTemp}
                onChange={(e) => setBaseTemp(Number(e.target.value))}
                step="0.5"
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Recommended Time (min)
              </label>
              <input
                type="number"
                value={baseTime}
                onChange={(e) => setBaseTime(Number(e.target.value))}
                step="0.5"
                min="0.1"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Your Temperature (°C)
            </label>
            <input
              type="number"
              value={newTemp}
              onChange={(e) => setNewTemp(Number(e.target.value))}
              step="0.5"
              className={inputClass}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="constant-agitation"
              checked={constantAgitation}
              onChange={(e) => setConstantAgitation(e.target.checked)}
              className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
            />
            <label htmlFor="constant-agitation" className="text-sm font-medium">
              Constant Agitation
            </label>
          </div>

          <div className="p-4 bg-muted rounded-lg text-center">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Adjusted Development Time
            </p>
            <p className="font-mono text-3xl font-semibold text-foreground">
              {formatTime(correctedTime * 60)}
            </p>
            {newTemp !== baseTemp && (
              <p className="text-xs text-muted-foreground mt-2">
                Original: {baseTime} min @ {baseTemp}°C → {newTemp}°C
              </p>
            )}
            {constantAgitation && (
              <p className="text-xs text-muted-foreground mt-1">
                Adjusted for constant agitation
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
