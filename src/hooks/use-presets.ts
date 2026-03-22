"use client"

import * as React from "react"
import { getPresets, savePreset, deletePreset } from "@/lib/storage"
import type { Preset } from "@/types/development"

export function usePresets() {
  const [presets, setPresets] = React.useState<Preset[]>([])

  React.useEffect(() => {
    setPresets(getPresets())
  }, [])

  const add = (preset: Preset) => {
    savePreset(preset)
    setPresets(getPresets())
  }

  const remove = (id: string) => {
    deletePreset(id)
    setPresets(getPresets())
  }

  const update = (preset: Preset) => {
    savePreset(preset)
    setPresets(getPresets())
  }

  return { presets, add, remove, update }
}
