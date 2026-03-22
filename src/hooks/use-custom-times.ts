"use client"

import * as React from "react"
import {
  getCustomTimes,
  saveCustomTime,
  deleteCustomTime,
} from "@/lib/storage"
import type { CustomDevelopmentTime } from "@/types/development"

export function useCustomTimes() {
  const [customTimes, setCustomTimes] = React.useState<CustomDevelopmentTime[]>(
    []
  )

  React.useEffect(() => {
    setCustomTimes(getCustomTimes())
  }, [])

  const add = (time: CustomDevelopmentTime) => {
    saveCustomTime(time)
    setCustomTimes(getCustomTimes())
  }

  const remove = (id: string) => {
    deleteCustomTime(id)
    setCustomTimes(getCustomTimes())
  }

  const update = (time: CustomDevelopmentTime) => {
    saveCustomTime(time)
    setCustomTimes(getCustomTimes())
  }

  return { customTimes, add, remove, update }
}
