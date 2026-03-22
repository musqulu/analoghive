import type { TimeSource } from "@/lib/approximate-development-time"

export type FilmFormat = "35mm" | "120" | "sheet"

export interface DevelopmentOption {
  dilution: string
  time: number
  temperature: number
  /** How time was resolved from chart data */
  timeSource?: TimeSource
  /** Short note e.g. "From chart" / "Approximate (interpolated...)" */
  approximateNote?: string
}

export type Step = "dev" | "stop" | "fix" | "wash"

export interface ProcessTimes {
  dev: number
  stop: number
  fix: number
  wash: number
}

export interface WashingMethod {
  type: "running" | "ilford" | "custom"
  runningWaterTime: number
  ilfordInversions: {
    first: number
    second: number
    third: number
  }
  custom: {
    totalTime: number
    waterChanges: number
  }
}

export interface Preset {
  id: string
  label: string
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
  processTimes: ProcessTimes
  washingMethod: WashingMethod
  createdAt: number
}

export interface CustomDevelopmentTime {
  id: string
  label: string
  filmName: string
  developerName: string
  dilution: string
  iso: number
  time: number
  temperature: number
  format: FilmFormat
  notes?: string
  source: "custom"
  createdAt: number
}
