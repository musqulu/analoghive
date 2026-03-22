"use client"

import * as React from "react"

export function useWakeLock() {
  const wakeLockRef = React.useRef<WakeLockSentinel | null>(null)

  const request = React.useCallback(async () => {
    try {
      if ("wakeLock" in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request("screen")
      }
    } catch {
      // Wake Lock not available or denied
    }
  }, [])

  const release = React.useCallback(async () => {
    try {
      await wakeLockRef.current?.release()
      wakeLockRef.current = null
    } catch {
      // Already released
    }
  }, [])

  React.useEffect(() => {
    return () => {
      wakeLockRef.current?.release()
    }
  }, [])

  return { request, release }
}
