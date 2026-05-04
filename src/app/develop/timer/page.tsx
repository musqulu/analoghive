"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { Timer } from "@/components/ui/timer"
import { Suspense } from "react"
import { cn } from "@/lib/utils"
import { mainGutterX, mainUnderNav } from "@/lib/app-page-layout"
import { logDevelopmentRun } from "@/lib/log-development-run"
import type { FilmFormat } from "@/types/development"

function TimerContent() {
  const params = useSearchParams()

  const filmName = params.get("film") || "Unknown Film"
  const filmFormat = (params.get("format") || "35mm") as FilmFormat
  const filmIso = params.get("iso") || ""
  const developerName = params.get("developer") || "Unknown Developer"
  const developerDilution = params.get("dilution") || ""
  const developmentTime = parseFloat(params.get("time") || "10")
  const temperature = parseFloat(params.get("temp") || "20")
  const totalVolume = parseInt(params.get("volume") || "500")
  const recipeId = params.get("recipeId") || null
  const favoriteId = params.get("favoriteId") || null
  const optionKeyParam = params.get("optionKey")
  const tempUnitParam = params.get("tempUnit")
  const pushPullParam = params.get("pushPull")

  // Same-page guard: a single page-load should only log one entry, even if the
  // user resets the dev step and re-runs it (e.g. to retry).
  const loggedRef = React.useRef(false)

  const handleDevComplete = React.useCallback(() => {
    if (loggedRef.current) return
    loggedRef.current = true
    const optionKey =
      optionKeyParam ?? (developerDilution ? `${developerDilution}|${temperature}` : `|${temperature}`)
    const temperatureUnit =
      tempUnitParam === "fahrenheit" ? "fahrenheit" : tempUnitParam === "celsius" ? "celsius" : null
    const pushPullStops = pushPullParam !== null ? Number(pushPullParam) : null
    void (async () => {
      const logged = await logDevelopmentRun({
        film_name: filmName,
        film_format: filmFormat,
        film_iso: filmIso,
        developer_name: developerName,
        option_key: optionKey,
        total_volume: Number.isFinite(totalVolume) ? totalVolume : null,
        temperature_unit: temperatureUnit,
        modified_temperature: Number.isFinite(temperature) ? temperature : null,
        push_pull_stops: Number.isFinite(pushPullStops as number) ? pushPullStops : null,
        recipe_id: recipeId,
        favorite_id: favoriteId,
      })
      if (!logged) loggedRef.current = false
    })()
  }, [
    filmName,
    filmFormat,
    filmIso,
    developerName,
    developerDilution,
    optionKeyParam,
    tempUnitParam,
    pushPullParam,
    temperature,
    totalVolume,
    recipeId,
    favoriteId,
  ])

  return (
    <main className={cn("flex flex-col items-center", mainUnderNav, mainGutterX)}>
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
          onDevComplete={handleDevComplete}
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
