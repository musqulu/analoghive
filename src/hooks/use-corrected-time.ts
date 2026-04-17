"use client"

import * as React from "react"
import { calculateCorrectedTime } from "@/data/processed-development-times"
import { celsiusToFahrenheit, fahrenheitToCelsius } from "@/utils/temperature"
import type { DevelopmentOption } from "@/types/development"

export function useCorrectedTime(selectedInfo: DevelopmentOption | undefined | null) {
  const [temperatureUnit, setTemperatureUnit] = React.useState("celsius")
  const [modifiedTemperature, setModifiedTemperature] = React.useState(20)
  const [correctedTime, setCorrectedTime] = React.useState<number | null>(null)
  const [constantAgitation, setConstantAgitation] = React.useState(false)

  const prevOptionKeyRef = React.useRef<string | undefined>(undefined)
  React.useEffect(() => {
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
