export function formatTime(seconds: number): string {
  seconds = Math.round(seconds)
  if (seconds < 0) return "0:00"
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export function formatTimePadded(seconds: number): string {
  seconds = Math.round(seconds)
  if (seconds < 0) return "00:00"
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}
