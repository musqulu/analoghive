import {
  PROMPT_MESSAGE_WINDOW,
  SUMMARY_ROLLUP_THRESHOLD,
  buildCompressedChatPrompt,
  foldMessagesToAnthropicPrompt,
  rollupSummaryUserPrompt,
  titleGenerationPrompt,
  truncatePreview,
} from "@/lib/ai/summary-memory"

describe("summary-memory", () => {
  it("truncatePreview clamps long strings", () => {
    expect(truncatePreview("hi")).toBe("hi")
    const long = "a".repeat(200)
    expect(truncatePreview(long, 120).length).toBeLessThanOrEqual(121)
    expect(truncatePreview(long, 120)).toMatch(/…$/)
  })

  it("foldMessagesToAnthropicPrompt ends with Assistant prompt line", () => {
    expect(
      foldMessagesToAnthropicPrompt([
        { role: "user", content: "q" },
        { role: "assistant", content: "a" },
      ]),
    ).toMatch(/Assistant:\s*$/s)
    expect(foldMessagesToAnthropicPrompt([{ role: "user", content: "q" }])).toContain("Human: q")
  })

  it("buildCompressedChatPrompt includes summary block when present", () => {
    const p = buildCompressedChatPrompt({
      summary: "Talked about HP5 and Rodinal.",
      recentMessages: [{ role: "user", content: "What next?" }],
    })
    expect(p).toContain("Earlier in this thread")
    expect(p).toContain("HP5")
    expect(p).toContain("Most recent messages")
    expect(p).toContain("What next?")
    expect(p.endsWith("\n\nAssistant:")).toBe(true)
  })

  it("buildCompressedChatPrompt omits summary when null", () => {
    const p = buildCompressedChatPrompt({
      summary: null,
      recentMessages: [{ role: "user", content: "x" }],
    })
    expect(p).not.toContain("Earlier in this thread")
    expect(p).toContain("Human: x")
  })

  it("rollupSummaryUserPrompt references previous summary when set", () => {
    const t = rollupSummaryUserPrompt({
      previousSummary: "Old.",
      newMessages: [{ role: "user", content: "new" }],
    })
    expect(t).toContain("Previous summary:")
    expect(t).toContain("Old.")
    expect(t).toContain("new")
  })

  it("titleGenerationPrompt includes user and assistant snippets", () => {
    const p = titleGenerationPrompt({
      userMessage: "Best ISO for HP5?",
      assistantMessage: "Try EI 800 in Rodinal.",
    })
    expect(p).toContain("User:")
    expect(p).toContain("Best ISO for HP5?")
    expect(p).toContain("Assistant:")
    expect(p).toContain("Try EI 800 in Rodinal.")
  })

  it("exports window constants used by route", () => {
    expect(PROMPT_MESSAGE_WINDOW).toBe(6)
    expect(SUMMARY_ROLLUP_THRESHOLD).toBe(8)
  })
})
