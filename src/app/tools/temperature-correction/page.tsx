"use client"

import * as React from "react"
import { calculateCorrectedTime } from "@/data/processed-development-times"

export default function TemperatureCorrectionPage() {
  const [baseTemp, setBaseTemp] = React.useState(20)
  const [baseTime, setBaseTime] = React.useState(10)
  const [newTemp, setNewTemp] = React.useState(20)
  const [constantAgitation, setConstantAgitation] = React.useState(false)

  const correctedTime = React.useMemo(
    () => calculateCorrectedTime(baseTemp, baseTime, newTemp, constantAgitation),
    [baseTemp, baseTime, newTemp, constantAgitation]
  )

  const formatTime = (minutes: number) => {
    const mins = Math.floor(minutes)
    const secs = String(Math.round((minutes % 1) * 60)).padStart(2, "0")
    return `${mins}:${secs}`
  }

  const inputClass =
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"

  return (
    <main className="min-h-screen flex flex-col items-center p-8 pt-12">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Temperature Correction</h1>
          <p className="text-muted-foreground mt-1">
            Adjust development time for a different processing temperature.
          </p>
        </div>

        <div className="p-6 bg-card rounded-lg border border-border shadow-sm space-y-4">
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
            <p className="text-3xl font-mono font-bold">
              {formatTime(correctedTime)} min
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
