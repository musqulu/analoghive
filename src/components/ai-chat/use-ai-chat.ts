"use client"

import {
  assistantTextFromNdjsonBlob,
  type NdJsonLine,
  type StepStatus,
} from "@/lib/ai/chat-stream"
import { type MutableRefObject, useCallback, useEffect, useRef, useState } from "react"

export const ACTIVE_CONV_STORAGE_KEY = "analoghive.aiChat.activeConversationId"
export const CHAT_MESSAGES_PREFIX = "/api/chat/conversations"
export const CONVERSATIONS_ENDPOINT = "/api/chat/conversations"
export const CHAT_ENDPOINT = "/api/chat"

export type ChatView = "list" | "thread"

export interface ConversationListItem {
  id: string
  title: string
  lastMessagePreview: string | null
  updatedAt: string
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
}

export type CotStepUi = {
  id: string
  label: string
  status: StepStatus
  description?: string
}

function generateLocalId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return `${prefix}-${crypto.randomUUID()}`
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function persistActiveConversation(id: string | null) {
  if (typeof window === "undefined") return
  try {
    if (!id) window.localStorage.removeItem(ACTIVE_CONV_STORAGE_KEY)
    else window.localStorage.setItem(ACTIVE_CONV_STORAGE_KEY, id)
  } catch {
    /* ignore */
  }
}

function readStoredActiveConversation(): string | null {
  if (typeof window === "undefined") return null
  try {
    return window.localStorage.getItem(ACTIVE_CONV_STORAGE_KEY)
  } catch {
    return null
  }
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<{ ok: boolean; json: T | null }> {
  const res = await fetch(url, { ...init })
  try {
    const json = (await res.json()) as T
    return { ok: res.ok, json }
  } catch {
    return { ok: res.ok, json: null }
  }
}

function applyNdjsonLine(
  line: string,
  handlers: {
    mergeStep: (line: Extract<NdJsonLine, { type: "step" }>) => void
    appendToken: (t: string) => void
    onDone: (conversationId?: string) => void
  },
) {
  let ev: NdJsonLine | { error?: string }
  try {
    ev = JSON.parse(line) as NdJsonLine | { error?: string }
  } catch {
    return
  }
  if ("error" in ev && typeof ev.error === "string") throw new Error(ev.error)
  const e = ev as NdJsonLine
  if (e.type === "step") handlers.mergeStep(e)
  else if (e.type === "token" && typeof e.text === "string") handlers.appendToken(e.text)
  else if (e.type === "done") handlers.onDone(e.conversationId)
}

function drainNdjsonBuffer(
  bufferRef: MutableRefObject<string>,
  flushTail: boolean,
  handlers: {
    mergeStep: (line: Extract<NdJsonLine, { type: "step" }>) => void
    appendToken: (t: string) => void
    onDone: (conversationId?: string) => void
  },
) {
  let buf = bufferRef.current
  let nl: number
  while ((nl = buf.indexOf("\n")) !== -1) {
    const line = buf.slice(0, nl).trim()
    buf = buf.slice(nl + 1)
    if (line) applyNdjsonLine(line, handlers)
  }
  if (flushTail && buf.trim()) applyNdjsonLine(buf.trim(), handlers)
  bufferRef.current = flushTail ? "" : buf
}

export interface UseAiChatResult {
  view: ChatView
  conversations: ConversationListItem[]
  activeConversationId: string | null
  activeTitle: string
  messages: ChatMessage[]
  steps: CotStepUi[]
  streaming: boolean
  listLoading: boolean
  messagesLoading: boolean
  error: string | null
  goToList: () => void
  openThread: (conversationId: string) => Promise<void>
  newConversation: () => Promise<void>
  deleteConversation: (id: string) => Promise<void>
  send: (content: string) => Promise<void>
  refreshList: () => Promise<void>
}

export function useAiChat(): UseAiChatResult {
  const [view, setView] = useState<ChatView>("list")
  const [conversations, setConversations] = useState<ConversationListItem[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [activeTitle, setActiveTitle] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [steps, setSteps] = useState<CotStepUi[]>([])
  const [streaming, setStreaming] = useState(false)
  const [listLoading, setListLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)

  const ndjsonBufferRef = useRef("")
  const abortRef = useRef<AbortController | null>(null)

  const mergeStep = useCallback((line: Extract<NdJsonLine, { type: "step" }>) => {
    setSteps((prev) => {
      const map = new Map(prev.map((s) => [s.id, s]))
      map.set(line.id, {
        id: line.id,
        label: line.label,
        status: line.status,
        description: line.description,
      })
      return [...map.values()]
    })
  }, [])

  const refreshList = useCallback(async () => {
    const { ok, json } = await fetchJson<{ conversations: ConversationListItem[] }>(
      CONVERSATIONS_ENDPOINT,
    )
    if (!ok || !json?.conversations) return
    setConversations(json.conversations)
  }, [])

  const openThread = useCallback(async (conversationId: string) => {
    setMessagesLoading(true)
    try {
      setError(null)
      setActiveConversationId(conversationId)
      persistActiveConversation(conversationId)
      setView("thread")

      const listRes = await fetchJson<{ conversations: ConversationListItem[] }>(
        CONVERSATIONS_ENDPOINT,
      )
      const rowMeta = listRes.json?.conversations?.find((c) => c.id === conversationId)
      if (rowMeta) setActiveTitle(rowMeta.title)

      const msgRes = await fetch(`${CHAT_MESSAGES_PREFIX}/${conversationId}/messages`)
      if (!msgRes.ok) {
        if (msgRes.status === 404) persistActiveConversation(null)
        setMessages([])
        setError("Could not load messages.")
        return
      }
      const json = (await msgRes.json()) as {
        messages?: Array<{ id: string; role: "user" | "assistant"; content: string }>
      }
      if (!json?.messages) {
        setMessages([])
        setError("Could not load messages.")
        return
      }
      setMessages(
        json.messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
        })),
      )
    } finally {
      setMessagesLoading(false)
    }
  }, [])

  useEffect(() => {
    if (hydrated) return
    setHydrated(true)
    void (async () => {
      try {
        await refreshList()
      } finally {
        setListLoading(false)
      }
      const storedId = readStoredActiveConversation()
      if (storedId) await openThread(storedId)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot hydrate
  }, [])

  const goToList = useCallback(() => {
    setView("list")
    persistActiveConversation(null)
    setActiveConversationId(null)
    setActiveTitle("")
    setMessages([])
    setSteps([])
    void refreshList()
  }, [refreshList])

  const newConversation = useCallback(async () => {
    setError(null)
    const { ok, json } = await fetchJson<{ id: string; title: string }>(
      CONVERSATIONS_ENDPOINT,
      { method: "POST" },
    )
    if (!ok || !json?.id) {
      setError("Could not start a conversation.")
      return
    }
    await refreshList()
    setMessages([])
    setSteps([])
    setActiveConversationId(json.id)
    setActiveTitle(json.title ?? "New chat")
    persistActiveConversation(json.id)
    setView("thread")
  }, [refreshList])

  const deleteConversationCb = useCallback(
    async (id: string) => {
      setError(null)
      const res = await fetch(`${CONVERSATIONS_ENDPOINT}/${id}`, { method: "DELETE" })
      if (!res.ok) {
        setError("Could not delete conversation.")
        return
      }
      if (activeConversationId === id) {
        persistActiveConversation(null)
        setActiveConversationId(null)
        setActiveTitle("")
        setMessages([])
        setView("list")
      }
      await refreshList()
    },
    [activeConversationId, refreshList],
  )

  const send = useCallback(
    async (content: string) => {
      const trimmed = content.trim()
      if (!trimmed || streaming || messagesLoading) return

      let cid = activeConversationId
      if (!cid) {
        const { ok, json } = await fetchJson<{ id: string }>(CONVERSATIONS_ENDPOINT, {
          method: "POST",
        })
        if (!ok || !json?.id) {
          setError("Could not start a conversation.")
          return
        }
        cid = json.id
        setActiveConversationId(cid)
        setActiveTitle("New chat")
        persistActiveConversation(cid)
        await refreshList()
      }

      setError(null)
      setSteps([])

      const userMsgId = generateLocalId("u")
      const assistantId = generateLocalId("a")
      const userBubble: ChatMessage = { id: userMsgId, role: "user", content: trimmed }
      const placeholder: ChatMessage = { id: assistantId, role: "assistant", content: "" }

      setMessages((prev) => [...prev, userBubble, placeholder])
      setStreaming(true)
      ndjsonBufferRef.current = ""

      abortRef.current?.abort()
      const ac = new AbortController()
      abortRef.current = ac

      let assistantText = ""

      try {
        const res = await fetch(CHAT_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId: cid, content: trimmed }),
          signal: ac.signal,
        })

        if (!res.ok) {
          let msg = `Request failed (${res.status})`
          try {
            const j = (await res.json()) as { error?: string }
            if (j?.error) msg = j.error
          } catch {
            //
          }
          throw new Error(msg)
        }

        if (!res.body) throw new Error("No response body")

        const reader = res.body.getReader()
        const decoder = new TextDecoder()

        const handlers = {
          mergeStep,
          appendToken: (t: string) => {
            assistantText += t
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, content: assistantText } : m)),
            )
          },
          onDone: (conv?: string) => {
            if (conv) {
              setActiveConversationId(conv)
              persistActiveConversation(conv)
            }
          },
        }

        for (;;) {
          const { done, value } = await reader.read()
          if (done) break
          ndjsonBufferRef.current += decoder.decode(value, { stream: true })
          drainNdjsonBuffer(ndjsonBufferRef, false, handlers)
        }

        ndjsonBufferRef.current += decoder.decode()
        drainNdjsonBuffer(ndjsonBufferRef, true, handlers)

        if (!assistantText.trim()) {
          assistantText = assistantTextFromNdjsonBlob(ndjsonBufferRef.current)
        }
        ndjsonBufferRef.current = ""

        const finalAssistant = assistantText.trim()
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: finalAssistant } : m)),
        )

        await refreshList()
      } catch (err) {
        const aborted = err instanceof Error && err.name === "AbortError"
        const message =
          aborted ? "Cancelled." : err instanceof Error ? err.message : "Something went wrong."
        if (!aborted) setError(message)
        setMessages((prev) =>
          prev.filter((m) => (aborted ? m.id !== assistantId : m.id !== assistantId && m.id !== userMsgId)),
        )
      } finally {
        setStreaming(false)
        abortRef.current = null
      }
    },
    [activeConversationId, mergeStep, streaming, messagesLoading, refreshList],
  )

  useEffect(() => {
    if (!activeConversationId) return
    const row = conversations.find((c) => c.id === activeConversationId)
    if (row) setActiveTitle(row.title)
  }, [activeConversationId, conversations])

  return {
    view,
    conversations,
    activeConversationId,
    activeTitle,
    messages,
    steps,
    streaming,
    listLoading,
    messagesLoading,
    error,
    goToList,
    openThread,
    newConversation,
    deleteConversation: deleteConversationCb,
    send,
    refreshList,
  }
}
