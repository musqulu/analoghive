"use client"

import Link from "next/link"
import { Trash2 } from "lucide-react"
import { normalizeDilutionDisplay } from "@/utils/normalize-dilution"
import type { Preset } from "@/types/development"

interface PresetCardProps {
  preset: Preset
  onDelete: (id: string) => void
}

export function PresetCard({ preset, onDelete }: PresetCardProps) {
  const timeDisplay =
    preset.correctedTime !== null
      ? `${Math.floor(preset.correctedTime)}:${String(
          Math.round((preset.correctedTime % 1) * 60)
        ).padStart(2, "0")} min`
      : "—"

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm flex items-start justify-between">
      <div className="space-y-1 flex-1 min-w-0">
        <p className="font-medium truncate">{preset.label}</p>
        <p className="text-sm text-gray-600">
          {preset.filmName} ({preset.filmFormat}) · ISO {preset.filmIso}
        </p>
        <p className="text-sm text-gray-500">
          {preset.developerName} (
          {normalizeDilutionDisplay(preset.developerDilution)}) · {timeDisplay}
        </p>
        <p className="text-xs text-gray-400">
          {preset.totalVolume}ml · {preset.modifiedTemperature}
          {preset.temperatureUnit === "celsius" ? "°C" : "°F"}
        </p>
      </div>
      <div className="flex gap-2 ml-4 shrink-0">
        <Link
          href={`/develop?preset=${preset.id}`}
          className="px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Start
        </Link>
        <button
          onClick={() => onDelete(preset.id)}
          className="p-1.5 rounded hover:bg-gray-100 text-red-500 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}
