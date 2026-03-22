import type { Preset, CustomDevelopmentTime } from "@/types/development"

const PRESETS_KEY = "fdc:presets"
const CUSTOM_TIMES_KEY = "fdc:custom-times"

function readJSON<T>(key: string): T[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeJSON<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data))
}

export function getPresets(): Preset[] {
  return readJSON<Preset>(PRESETS_KEY)
}

export function savePreset(preset: Preset): void {
  const presets = getPresets()
  const idx = presets.findIndex((p) => p.id === preset.id)
  if (idx >= 0) {
    presets[idx] = preset
  } else {
    presets.push(preset)
  }
  writeJSON(PRESETS_KEY, presets)
}

export function deletePreset(id: string): void {
  writeJSON(
    PRESETS_KEY,
    getPresets().filter((p) => p.id !== id)
  )
}

export function getCustomTimes(): CustomDevelopmentTime[] {
  return readJSON<CustomDevelopmentTime>(CUSTOM_TIMES_KEY)
}

export function saveCustomTime(time: CustomDevelopmentTime): void {
  const times = getCustomTimes()
  const idx = times.findIndex((t) => t.id === time.id)
  if (idx >= 0) {
    times[idx] = time
  } else {
    times.push(time)
  }
  writeJSON(CUSTOM_TIMES_KEY, times)
}

export function deleteCustomTime(id: string): void {
  writeJSON(
    CUSTOM_TIMES_KEY,
    getCustomTimes().filter((t) => t.id !== id)
  )
}
