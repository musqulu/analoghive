"use client"

import { useSearchParams } from "next/navigation"
import { Timer } from "@/components/ui/timer"
import { Suspense } from "react"

function TimerContent() {
  const params = useSearchParams()

  const filmName = params.get("film") || "Unknown Film"
  const filmFormat = (params.get("format") || "35mm") as "35mm" | "120" | "sheet"
  const filmIso = params.get("iso") || ""
  const developerName = params.get("developer") || "Unknown Developer"
  const developerDilution = params.get("dilution") || ""
  const developmentTime = parseFloat(params.get("time") || "10")
  const temperature = parseFloat(params.get("temp") || "20")
  const totalVolume = parseInt(params.get("volume") || "500")

  return (
    <main className="min-h-screen flex flex-col items-center p-8 pt-12">
      <div className="max-w-md w-full">
        <Timer
          filmName={filmName}
          filmFormat={filmFormat}
          filmIso={filmIso}
          developerName={developerName}
          developerDilution={developerDilution}
          developmentTime={developmentTime}
          temperature={temperature}
          totalVolume={totalVolume}
        />
      </div>
    </main>
  )
}

export default function TimerPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-muted-foreground">Loading timer...</div>
      }
    >
      <TimerContent />
    </Suspense>
  )
}
