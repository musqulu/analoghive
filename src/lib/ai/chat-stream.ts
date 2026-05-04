/** Line-delimited JSON for chat streaming (NDJSON). */

export const NDJSON_CONTENT_TYPE = "application/x-ndjson; charset=utf-8"

export type StepStatus = "pending" | "active" | "complete"

export type NdJsonLine =
  | {
      type: "step"
      id: string
      label: string
      status: StepStatus
      description?: string
    }
  | { type: "token"; text: string }
  | { type: "done"; conversationId: string }

const enc = new TextEncoder()

export function encodeNdJsonLine(line: NdJsonLine): Uint8Array {
  return enc.encode(`${JSON.stringify(line)}\n`)
}

export function parseNdjsonLines(blob: string): NdJsonLine[] {
  const lines: NdJsonLine[] = []
  for (const raw of blob.split("\n")) {
    const line = raw.trim()
    if (!line) continue
    try {
      lines.push(JSON.parse(line) as NdJsonLine)
    } catch {
      // skip
    }
  }
  return lines
}

export function assistantTextFromNdjsonBlob(blob: string): string {
  return parseNdjsonLines(blob)
    .filter((o): o is { type: "token"; text: string } => o.type === "token" && typeof o.text === "string")
    .map((o) => o.text)
    .join("")
}
