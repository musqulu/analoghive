"use client"

import { Vibrate } from "lucide-react"

interface AgitationCueProps {
  shouldShake: boolean
  variant?: "light" | "dark"
}

export function AgitationCue({
  shouldShake,
  variant = "light",
}: AgitationCueProps) {
  const activeColor = variant === "dark" ? "text-red-500" : "text-white"
  const inactiveColor =
    variant === "dark" ? "text-red-600/50" : "text-white/50"
  const iconColor = variant === "dark" ? "text-red-600" : "text-white"

  return (
    <div className="mb-4">
      <div
        className={`flex items-center justify-center gap-2 ${shouldShake ? "animate-pulse" : ""}`}
      >
        <Vibrate
          size={32}
          className={`${iconColor} ${shouldShake ? "animate-vibrate" : "opacity-50"}`}
          strokeWidth={shouldShake ? 2.5 : 1.5}
        />
        <span
          className={`text-lg font-semibold ${shouldShake ? activeColor : inactiveColor}`}
        >
          {shouldShake ? "Agitate" : "Rest"}
        </span>
      </div>
      {shouldShake && (
        <p className="text-sm mt-2 text-center opacity-70">
          4 gentle inversions, or gentle rotation/twists if you are not inverting
          the tank
        </p>
      )}
      {!shouldShake && (
        <p className="text-sm mt-2 text-center opacity-70">
          Intermittent agitation: first 10 seconds of each minute (spiral tank /
          Paterson-style)
        </p>
      )}
    </div>
  )
}
