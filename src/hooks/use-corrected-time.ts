"use client"

import * as React from "react"
import { calculateCorrectedTime } from "@/data/processed-development-times"
import { celsiusToFahrenheit, fahrenheitToCelsius } from "@/utils/temperature"
import type { DevelopmentOption } from "@/types/development"
import type { DevelopmentFavoriteSnapshot } from "@/types/favorite"

export function useCorrectedTime(
  selectedInfo: DevelopmentOption | undefined | null,
  initialHydration: DevelopmentFavoriteSnapshot | null = null,
) {
  const [temperatureUnit, setTemperatureUnit] = React.useState<
    "celsius" | "fahrenheit"
  >(() => (initialHydration?.temperatureUnit === "fahrenheit" ? "fahrenheit" : "celsius"))
  const [modifiedTemperature, setModifiedTemperature] = React.useState(() => {
    if (initialHydration) return initialHydration.modifiedTemperature
    return 20
  })
  const [correctedTime, setCorrectedTime] = React.useState<number | null>(null)
  const [constantAgitation, setConstantAgitation] = React.useState(
    () => initialHydration?.constantAgitation ?? false,
  )

  /** While set, block chart-row defaulting so saved correction values win after dilution resolves. */
  const pendingCorrectionSnapRef = React.useRef<DevelopmentFavoriteSnapshot | null>(null)

  React.useLayoutEffect(() => {
    if (!initialHydration) {
      pendingCorrectionSnapRef.current = null
      return
    }
    pendingCorrectionSnapRef.current = initialHydration
    setTemperatureUnit(initialHydration.temperatureUnit)
    setModifiedTemperature(initialHydration.modifiedTemperature)
    setConstantAgitation(initialHydration.constantAgitation)
  }, [initialHydration])

  const prevOptionKeyRef = React.useRef<string | undefined>(undefined)

  /** Re-apply snapshot temps once selected row matches (after favorite restore). */
  React.useEffect(() => {
    const snap = pendingCorrectionSnapRef.current
    if (!snap || !selectedInfo) return
    if (selectedInfo.optionKey !== snap.optionKey) return
    setTemperatureUnit(snap.temperatureUnit)
    setModifiedTemperature(snap.modifiedTemperature)
    setConstantAgitation(snap.constantAgitation)
    prevOptionKeyRef.current = selectedInfo.optionKey
    pendingCorrectionSnapRef.current = null
  }, [selectedInfo])

  React.useEffect(() => {
    if (pendingCorrectionSnapRef.current) {
      prevOptionKeyRef.current = selectedInfo?.optionKey
      return
    }
    const key = selectedInfo?.optionKey
    if (key && key !== prevOptionKeyRef.current) {
      const temp = selectedInfo!.temperature
      setModifiedTemperature(
        temperatureUnit === "fahrenheit"
          ? Number(celsiusToFahrenheit(temp).toFixed(1))
          : temp
      )
    }
    prevOptionKeyRef.current = key
  }, [selectedInfo, temperatureUnit])

  React.useEffect(() => {
    if (selectedInfo) {
      const newTime = calculateCorrectedTime(
        selectedInfo.temperature,
        selectedInfo.time,
        modifiedTemperature,
        constantAgitation
      )
      setCorrectedTime(newTime)
    } else {
      setCorrectedTime(null)
    }
  }, [selectedInfo, modifiedTemperature, constantAgitation])

  const handleTemperatureUnitChange = (value: string) => {
    if (value !== "celsius" && value !== "fahrenheit") return
    setTemperatureUnit(value)
    if (value === "fahrenheit") {
      setModifiedTemperature(
        Number(celsiusToFahrenheit(modifiedTemperature).toFixed(1))
      )
    } else {
      setModifiedTemperature(
        Number(fahrenheitToCelsius(modifiedTemperature).toFixed(1))
      )
    }
  }

  return {
    temperatureUnit,
    setTemperatureUnit,
    modifiedTemperature,
    setModifiedTemperature,
    correctedTime,
    constantAgitation,
    setConstantAgitation,
    handleTemperatureUnitChange,
  }
}
