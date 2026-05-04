import type { ChatRole } from "@/lib/ai/conversation-store"

export const PROMPT_MESSAGE_WINDOW = 6
export const SUMMARY_ROLLUP_THRESHOLD = 8
export const SUMMARY_MODEL_MAX_TOKENS = 280
export const TITLE_MODEL_MAX_TOKENS = 24

/** How many chars of assistant reply to stash in preview. */
export function truncatePreview(text: string, maxLen = 120): string {
  const t = text.trim()
  if (t.length <= maxLen) return t
  return `${t.slice(0, Math.max(0, maxLen - 1)).trim()}…`
}

export function foldMessagesToAnthropicPrompt(
  messages: Array<{ role: ChatRole; content: string }>,
): string {
  const lines: string[] = []
  for (const m of messages) {
    const tag = m.role === "user" ? "Human" : "Assistant"
    lines.push(`${tag}: ${m.content.trim()}`)
  }
  lines.push("Assistant:")
  return lines.join("\n\n")
}

/**
 * Compose the plain-text prompt block sent to Claude: optional rolling summary +
 * verbatim recent transcript tail (already clipped to K).
 */
export function buildCompressedChatPrompt(args: {
  summary: string | null
  recentMessages: Array<{ role: ChatRole; content: string }>
}): string {
  const { summary, recentMessages } = args
  const parts: string[] = []
  if (summary?.trim()) {
    parts.push(
      "Earlier in this thread (compressed memory you can rely on for context; do not contradict recent messages below):\n" +
        summary.trim(),
    )
  }
  if (recentMessages.length > 0) {
    const body = recentMessages
      .map((m) => {
        const tag = m.role === "user" ? "Human" : "Assistant"
        return `${tag}: ${m.content.trim()}`
      })
      .join("\n\n")
    parts.push("Most recent messages (verbatim):", body)
  }
  parts.push("Assistant:")
  return parts.join("\n\n")
}

export function rollupSummaryUserPrompt(args: {
  previousSummary: string | null
  newMessages: Array<{ role: ChatRole; content: string }>
}): string {
  const { previousSummary, newMessages } = args
  const transcript = newMessages
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content.trim()}`)
    .join("\n")
  if (previousSummary?.trim()) {
    return (
      "You maintain a running summary of an analog-photography / darkroom chat.\n\nPrevious summary:\n" +
      previousSummary.trim() +
      "\n\nNew messages to fold in:\n" +
      transcript +
      "\n\nWrite an updated summary (max ~200 words). Focus on: film stocks, developers, dilutions, temperatures, times, techniques, and open questions. Plain text, no markdown."
    )
  }
  return (
    "Summarize this analog-photography / darkroom chat for future context (max ~200 words). Focus on film, developer, times, temperatures, techniques. Plain text, no markdown.\n\n" +
    transcript
  )
}

export function titleGenerationPrompt(firstUserMessage: string): string {
  return (
    'Create a very short chat title (max 6 words, no quotes) for a darkroom/film photography conversation that starts with:\n\n"' +
    firstUserMessage.trim().slice(0, 500) +
    '"\n\nReply with only the title, nothing else.'
  )
}
