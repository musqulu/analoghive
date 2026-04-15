"use client"

import { Vibrate } from "lucide-react"

interface AgitationCueProps {
  shouldShake: boolean
  initialShakePeriod: boolean
  variant?: "light" | "dark"
}

export function AgitationCue({
  shouldShake,
  initialShakePeriod,
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
          {shouldShake ? "SHAKE NOW!" : "Rest"}
        </span>
      </div>
      {initialShakePeriod && shouldShake && (
        <p className="text-sm mt-2 text-center opacity-70">
          Continuous initial shaking
        </p>
      )}
      {!initialShakePeriod && (
        <p className="text-sm mt-2 text-center opacity-70">
          Shake for 10 seconds every minute
        </p>
      )}
    </div>
  )
}
