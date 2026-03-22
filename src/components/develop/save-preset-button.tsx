"use client"

import * as React from "react"
import { Bookmark } from "lucide-react"
import { usePresets } from "@/hooks/use-presets"
import type { Preset, FilmFormat, ProcessTimes, WashingMethod } from "@/types/development"

interface SavePresetButtonProps {
  filmName: string
  filmFormat: FilmFormat
  filmIso: string
  developerName: string
  developerDilution: string
  totalVolume: number
  temperatureUnit: string
  modifiedTemperature: number
  correctedTime: number | null
  constantAgitation: boolean
}

const DEFAULT_PROCESS_TIMES: ProcessTimes = { dev: 0, stop: 1, fix: 5, wash: 5 }
const DEFAULT_WASH: WashingMethod = {
  type: "running",
  runningWaterTime: 5,
  ilfordInversions: { first: 5, second: 10, third: 20 },
  custom: { totalTime: 5, waterChanges: 3 },
}

export function SavePresetButton(props: SavePresetButtonProps) {
  const { add } = usePresets()
  const [saved, setSaved] = React.useState(false)

  const handleSave = () => {
    const preset: Preset = {
      id: crypto.randomUUID(),
      label: `${props.filmName} — ${props.developerName} (${props.filmIso})`,
      filmName: props.filmName,
      filmFormat: props.filmFormat,
      filmIso: props.filmIso,
      developerName: props.developerName,
      developerDilution: props.developerDilution,
      totalVolume: props.totalVolume,
      temperatureUnit: props.temperatureUnit,
      modifiedTemperature: props.modifiedTemperature,
      correctedTime: props.correctedTime,
      constantAgitation: props.constantAgitation,
      processTimes: DEFAULT_PROCESS_TIMES,
      washingMethod: DEFAULT_WASH,
      createdAt: Date.now(),
    }
    add(preset)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <button
      onClick={handleSave}
      className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors bg-muted hover:bg-muted/80"
    >
      <Bookmark size={14} />
      {saved ? "Saved!" : "Save as Preset"}
    </button>
  )
}
