/** Normalize Replicate `run()` outputs for Claude text completions. */

export function coerceReplicateTextOutput(output: unknown): string {
  if (typeof output === "string") return output
  if (Array.isArray(output)) {
    return output.map((chunk) => (typeof chunk === "string" ? chunk : String(chunk))).join("")
  }
  if (output && typeof output === "object") {
    const o = output as Record<string, unknown>
    if (typeof o.text === "string") return o.text
  }
  if (output == null) return ""
  try {
    return JSON.stringify(output)
  } catch {
    return String(output)
  }
}
