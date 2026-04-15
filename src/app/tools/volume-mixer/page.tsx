"use client"

import * as React from "react"
import { VolumeMixer } from "@/components/ui/volume-mixer"

export default function VolumeMixerPage() {
  const [dilution, setDilution] = React.useState("1+1")
  const [totalVolume, setTotalVolume] = React.useState(500)

  return (
    <main className="min-h-screen flex flex-col items-center p-8 pt-12">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Volume Mixer
          </h1>
          <p className="text-muted-foreground mt-1">
            Calculate developer and water volumes for any dilution ratio.
          </p>
        </div>

        <div className="space-y-4 rounded-lg bg-card p-6 ds-card">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Dilution (e.g. 1+50, 1+1, stock)
            </label>
            <input
              type="text"
              value={dilution}
              onChange={(e) => setDilution(e.target.value)}
              placeholder="1+50"
              className="ds-input"
            />
          </div>

          <VolumeMixer
            dilution={dilution}
            totalVolume={totalVolume}
            onVolumeChange={setTotalVolume}
          />
        </div>
      </div>
    </main>
  )
}
