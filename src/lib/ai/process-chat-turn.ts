import Replicate from "replicate"
import type { SupabaseClient } from "@supabase/supabase-js"
import {
  encodeNdJsonLine,
  NDJSON_CONTENT_TYPE,
  type NdJsonLine,
} from "@/lib/ai/chat-stream"
import {
  appendMessage,
  countMessages,
  createConversation,
  getConversation,
  getMessagesAfterCount,
  getRecentMessagesForPrompt,
  NEW_CHAT_TITLE,
  updateConversationMeta,
} from "@/lib/ai/conversation-store"
import { findRelevantDeveloperRows, loadUserContext } from "@/lib/ai/context-loader"
import { buildSystemPrompt } from "@/lib/ai/system-prompt"
import { coerceReplicateTextOutput } from "@/lib/ai/replicate-output"
import {
  buildCompressedChatPrompt,
  PROMPT_MESSAGE_WINDOW,
  rollupSummaryUserPrompt,
  SUMMARY_MODEL_MAX_TOKENS,
  SUMMARY_ROLLUP_THRESHOLD,
  titleGenerationPrompt,
  TITLE_MODEL_MAX_TOKENS,
  truncatePreview,
} from "@/lib/ai/summary-memory"

export const MODEL = "anthropic/claude-4.5-sonnet" as const

function pushLine(
  encoder: TextEncoder,
  controller: ReadableStreamDefaultController<Uint8Array>,
  line: NdJsonLine,
) {
  controller.enqueue(encodeNdJsonLine(line))
}

async function rollupIfNeeded(params: {
  replicate: InstanceType<typeof Replicate>
  supabase: SupabaseClient
  userId: string
  conversationId: string
}) {
  const { replicate, supabase, userId, conversationId } = params

  try {
    const conv = await getConversation(supabase, userId, conversationId)
    if (!conv) return

    const total = await countMessages(supabase, userId, conversationId)
    const uncovered = total - conv.summary_message_count
    if (uncovered < SUMMARY_ROLLUP_THRESHOLD) return

    const slice = await getMessagesAfterCount(
      supabase,
      userId,
      conversationId,
      conv.summary_message_count,
    )

    const out = await replicate.run(MODEL, {
      input: {
        prompt: rollupSummaryUserPrompt({
          previousSummary: conv.summary,
          newMessages: slice,
        }),
        system_prompt:
          "Return only plain text paragraphs. Analog photography assistant memory; no greetings.",
        max_tokens: SUMMARY_MODEL_MAX_TOKENS,
        temperature: 0.2,
      },
    })

    const nextSummary = coerceReplicateTextOutput(out).trim()
    if (nextSummary.length === 0) return

    await updateConversationMeta(supabase, userId, conversationId, {
      summary: nextSummary,
      summary_message_count: total,
    })
  } catch {
    /* non-blocking */
  }
}

async function maybeSetTitle(params: {
  replicate: InstanceType<typeof Replicate>
  supabase: SupabaseClient
  userId: string
  conversationId: string
  userMessage: string
  assistantMessage: string
}) {
  const { replicate, supabase, userId, conversationId, userMessage, assistantMessage } = params

  try {
    const conv = await getConversation(supabase, userId, conversationId)
    if (!conv || conv.title !== NEW_CHAT_TITLE) return

    let titleAccumulator = ""
    for await (const event of replicate.stream(MODEL, {
      input: {
        prompt: titleGenerationPrompt({ userMessage, assistantMessage }),
        system_prompt: "Output only the title string. No quotes around it.",
        max_tokens: TITLE_MODEL_MAX_TOKENS,
        temperature: 0.4,
      },
    })) {
      if (event.event === "error") throw new Error(String(event.data ?? "title stream error"))
      if (event.event === "done") break
      if (event.event === "output" && typeof event.data === "string" && event.data.length > 0) {
        titleAccumulator += event.data
      }
    }

    const title = titleAccumulator
      .trim()
      .replace(/^["']+|["']+$/g, "")
      .slice(0, 80)
    if (title.length < 2) return

    await updateConversationMeta(supabase, userId, conversationId, { title })
  } catch {
    /* non-blocking */
  }
}

export function createNdjsonChatStream(params: {
  supabase: SupabaseClient
  userId: string
  replicateToken: string
  conversationId: string | null | undefined
  content: string
}): ReadableStream<Uint8Array> {
  const { supabase, userId, replicateToken } = params
  const trimmedContent = params.content.trim()
  const replicate = new Replicate({ auth: replicateToken })

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder()
      try {
        let cid = params.conversationId ?? null
        if (!cid) {
          const created = await createConversation(supabase, userId)
          cid = created.id
        }

        const conv = await getConversation(supabase, userId, cid)
        if (!conv) {
          controller.enqueue(
            encoder.encode(
              `${JSON.stringify({ error: "Conversation not found" })}\n`,
            ),
          )
          controller.close()
          return
        }

        await appendMessage(supabase, userId, cid, "user", trimmedContent)

        await updateConversationMeta(supabase, userId, cid, {
          last_message_preview: truncatePreview(trimmedContent),
        })

        const ctx = await loadUserContext(supabase, userId)
        const refreshed = await getConversation(supabase, userId, cid)
        if (!refreshed) {
          controller.error(new Error("Conversation missing"))
          return
        }

        const developerRows = findRelevantDeveloperRows(trimmedContent, ctx.recipes)

        pushLine(encoder, controller, {
          type: "step",
          id: "recipes",
          label: "Loaded your data",
          status: "complete",
          description: `${ctx.recipes.length} recipes, ${ctx.favorites.length} favorites, ${ctx.recentLogs.length} recent logs`,
        })
        pushLine(encoder, controller, {
          type: "step",
          id: "chart",
          label: "Matched chart developers",
          status: "complete",
          description:
            developerRows.length > 0
              ? `${developerRows.length}: ${developerRows.map((r) => r.name).join(", ")}`
              : "none matched this prompt",
        })
        pushLine(encoder, controller, {
          type: "step",
          id: "compose",
          label: "Composing reply",
          status: "active",
        })

        const systemPrompt = buildSystemPrompt({ context: ctx, developerRows })
        const recent = await getRecentMessagesForPrompt(
          supabase,
          userId,
          cid,
          PROMPT_MESSAGE_WINDOW,
        )
        const prompt = buildCompressedChatPrompt({
          summary: refreshed.summary,
          recentMessages: recent,
        })

        let assistantAccumulator = ""

        for await (const event of replicate.stream(MODEL, {
          input: {
            prompt,
            system_prompt: systemPrompt,
            max_tokens: 1500,
            temperature: 0.4,
          },
        })) {
          if (event.event === "error") {
            controller.error(new Error(String(event.data ?? "stream error")))
            return
          }
          if (event.event === "done") break
          if (event.event === "output" && typeof event.data === "string" && event.data.length > 0) {
            assistantAccumulator += event.data
            pushLine(encoder, controller, { type: "token", text: event.data })
          }
        }

        const reply = assistantAccumulator.trim()
        await appendMessage(supabase, userId, cid, "assistant", reply)

        await updateConversationMeta(supabase, userId, cid, {
          last_message_preview: truncatePreview(reply || "(empty reply)"),
        })

        pushLine(encoder, controller, {
          type: "step",
          id: "compose",
          label: "Composing reply",
          status: "complete",
        })
        pushLine(encoder, controller, { type: "done", conversationId: cid })

        controller.close()

        void maybeSetTitle({
          replicate,
          supabase,
          userId,
          conversationId: cid,
          userMessage: trimmedContent,
          assistantMessage: reply || "(empty reply)",
        })
        void rollupIfNeeded({ replicate, supabase, userId, conversationId: cid })
      } catch (err) {
        controller.error(err)
      }
    },
  })
}

export function ndjsonHeaders(): HeadersInit {
  return {
    "Content-Type": NDJSON_CONTENT_TYPE,
    "Cache-Control": "no-store",
    "X-Accel-Buffering": "no",
  }
}
