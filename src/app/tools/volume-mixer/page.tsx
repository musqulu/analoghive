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
          <h1 className="text-2xl font-bold">Volume Mixer</h1>
          <p className="text-muted-foreground mt-1">
            Calculate developer and water volumes for any dilution ratio.
          </p>
        </div>

        <div className="p-6 bg-card rounded-lg border border-border shadow-sm space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Dilution (e.g. 1+50, 1+1, stock)
            </label>
            <input
              type="text"
              value={dilution}
              onChange={(e) => setDilution(e.target.value)}
              placeholder="1+50"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
