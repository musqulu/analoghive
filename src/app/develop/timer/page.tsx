"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { cn } from "@/lib/utils"
import { mainGutterX, mainUnderNav } from "@/lib/app-page-layout"
import { TimerPageWithDiary } from "@/app/develop/timer/with-diary"
import {
  decodeDiaryReplayParam,
  DIARY_TIMER_REPLAY_PARAM,
} from "@/lib/diary-timer-replay"
import { buildTimerHydrationFromQueryAndReplay } from "@/lib/timer-route-hydration"
import type { FilmFormat } from "@/types/development"

function TimerContent() {
  const params = useSearchParams()

  const filmName = params.get("film") || "Unknown Film"
  const filmFormat = (params.get("format") || "35mm") as FilmFormat
  const filmIso = params.get("iso") || ""
  const developerName = params.get("developer") || "Unknown Developer"
  const recipeId = params.get("recipeId") || null
  const favoriteId = params.get("favoriteId") || null
  const optionKeyParam = params.get("optionKey")
  const pushPullParam = params.get("pushPull")
  const replaySnapshot = decodeDiaryReplayParam(params.get(DIARY_TIMER_REPLAY_PARAM))

  const {
    developmentTimeMinutes,
    temperature,
    totalVolume,
    developerDilution,
    tempUnitParam,
  } = buildTimerHydrationFromQueryAndReplay(
    {
      time: params.get("time"),
      temp: params.get("temp"),
      volume: params.get("volume"),
      dilution: params.get("dilution"),
      tempUnit: params.get("tempUnit"),
    },
    replaySnapshot,
  )

  return (
    <main className={cn("flex flex-col items-center", mainUnderNav, mainGutterX)}>
      <div className="max-w-md w-full">
        <TimerPageWithDiary
          filmName={filmName}
          filmFormat={filmFormat}
          filmIso={filmIso}
          developerName={developerName}
          developerDilution={developerDilution}
          developmentTime={developmentTimeMinutes}
          temperature={temperature}
          totalVolume={totalVolume}
          recipeId={recipeId}
          favoriteId={favoriteId}
          optionKeyParam={optionKeyParam}
          tempUnitParam={tempUnitParam}
          pushPullParam={pushPullParam}
          replaySnapshot={replaySnapshot}
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
