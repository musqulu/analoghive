import {
  assistantTextFromNdjsonBlob,
  encodeNdJsonLine,
  NDJSON_CONTENT_TYPE,
  parseNdjsonLines,
} from "./chat-stream"

describe("chat-stream", () => {
  it("encodes and parses ndjson round-trip", () => {
    const line = { type: "token" as const, text: "Hi" }
    const bytes = encodeNdJsonLine(line)
    const decoder = new TextDecoder()
    expect(decoder.decode(bytes).endsWith("\n")).toBe(true)
    expect(parseNdjsonLines(decoder.decode(bytes))).toEqual([line])
  })

  it("extracts assistant text from token lines", () => {
    const blob = [
      JSON.stringify({ type: "step", id: "x", label: "L", status: "complete" }),
      JSON.stringify({ type: "token", text: "a" }),
      JSON.stringify({ type: "token", text: "b" }),
    ].join("\n")
    expect(assistantTextFromNdjsonBlob(blob)).toBe("ab")
  })

  it("exports a charsetful ndjson content type", () => {
    expect(NDJSON_CONTENT_TYPE).toContain("ndjson")
  })
})
