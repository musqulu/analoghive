"use client"

import { ArrowLeft, MessageCircleQuestion, Send, Trash2 } from "lucide-react"
import {
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtStep,
} from "@/components/ai-elements/chain-of-thought"
import { useAiChat } from "@/components/ai-chat/use-ai-chat"
import { cn } from "@/lib/utils"

const STARTER_PROMPTS: string[] = [
  "What's the difference between stand and semi-stand development?",
  "Walk me through pushing HP5+ to ISO 1600 in Rodinal.",
  "How do I read agitation patterns on my saved favorites?",
]

function previewLine(row: string | null, title: string) {
  if (row?.trim()) return row.trim()
  return title
}

function formatRelativeLabel(iso: string) {
  try {
    const d = new Date(iso)
    const now = new Date()
    const sameDay =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    if (sameDay) return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
  } catch {
    return ""
  }
}

export function AiChatPanel() {
  const chat = useAiChat()
  if (chat.view === "list") return <AiChatList chat={chat} />
  return <AiChatThread chat={chat} />
}

function AiChatList({ chat }: { chat: ReturnType<typeof useAiChat> }) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="shrink-0 border-b border-border px-5 py-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">Chats</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Tap a conversation to continue.
          </p>
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        {chat.conversations.length === 0 ? (
          <EmptyInboxOnNewPrompt onNew={() => void chat.newConversation()} />
        ) : (
          <>
            <div className="mb-2 flex justify-end">
              <button
                type="button"
                onClick={() => void chat.newConversation()}
                className="rounded-md px-2 py-1 text-xs font-medium text-primary hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                New conversation
              </button>
            </div>
            <ul className="flex flex-col gap-2">
              {chat.conversations.map((c) => (
                <li key={c.id} className="relative">
                  <button
                    type="button"
                    onClick={() => void chat.openThread(c.id)}
                    className="flex w-full flex-col items-stretch rounded-lg border border-border bg-background py-2.5 pl-3 pr-10 text-left transition-colors hover:bg-muted"
                  >
                    <div className="flex items-start gap-2">
                      <span className="flex-1 break-words text-sm font-medium text-foreground">
                        {c.title}
                      </span>
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {formatRelativeLabel(c.updatedAt)}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {previewLine(c.lastMessagePreview, c.title)}
                    </p>
                  </button>
                  <button
                    type="button"
                    aria-label="Delete conversation"
                    onClick={(e) => {
                      e.stopPropagation()
                      void chat.deleteConversation(c.id)
                    }}
                    className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
        {chat.error ? (
          <p
            role="alert"
            className="mt-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive"
          >
            {chat.error}
          </p>
        ) : null}
      </div>
    </div>
  )
}

function EmptyInboxOnNewPrompt({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      <MessageCircleQuestion className="mb-4 h-10 w-10 text-muted-foreground" aria-hidden />
      <p className="mb-6 text-sm text-muted-foreground">
        No chats yet. Start a new conversation — your assistant saves context in Supabase and
        summarizes longer threads automatically.
      </p>
      <button
        type="button"
        onClick={onNew}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        New chat
      </button>
    </div>
  )
}

function AiChatThread({ chat }: { chat: ReturnType<typeof useAiChat> }) {
  const [draft, setDraft] = useState("")
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const orderedSteps = useMemo(() => {
    const order = ["recipes", "chart", "compose"]
    const primary = order
      .map((id) => chat.steps.find((s) => s.id === id))
      .filter((s): s is NonNullable<typeof s> => Boolean(s))
    const rest = chat.steps.filter((s) => !order.includes(s.id))
    return [...primary, ...rest]
  }, [chat.steps])

  useEffect(() => {
    const node = scrollRef.current
    if (!node) return
    node.scrollTop = node.scrollHeight
  }, [chat.messages, chat.streaming])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const content = draft.trim()
    if (!content || chat.streaming) return
    setDraft("")
    await chat.send(content)
    textareaRef.current?.focus()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      event.currentTarget.form?.requestSubmit()
    }
  }

  const handleStarter = async (prompt: string) => {
    if (chat.streaming) return
    await chat.send(prompt)
  }

  const isEmpty = chat.messages.length === 0

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-4 sm:px-5">
        <button
          type="button"
          onClick={() => chat.goToList()}
          aria-label="Back to chat list"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-foreground hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{chat.activeTitle}</p>
          <p className="truncate text-xs text-muted-foreground">Grounded on your saved data.</p>
        </div>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5"
      >
        {orderedSteps.length > 0 ? (
          <div className="mb-4">
            <ChainOfThought open={chat.streaming}>
              <ChainOfThoughtHeader>Working</ChainOfThoughtHeader>
              <ChainOfThoughtContent className="space-y-1 pb-3">
                {orderedSteps.map((s) => (
                  <ChainOfThoughtStep
                    key={s.id}
                    label={s.label}
                    description={s.description}
                    status={s.status}
                  />
                ))}
              </ChainOfThoughtContent>
            </ChainOfThought>
          </div>
        ) : null}

        {isEmpty ? (
          <EmptyThread onPick={handleStarter} disabled={chat.streaming} />
        ) : (
          <ul className="flex flex-col gap-3">
            {chat.messages.map((m) => (
              <MessageBubble key={m.id} message={m} streaming={chat.streaming} />
            ))}
            {chat.streaming &&
            chat.messages[chat.messages.length - 1]?.role === "assistant" &&
            chat.messages[chat.messages.length - 1]?.content === "" ? (
              <li className="self-start">
                <TypingDots />
              </li>
            ) : null}
          </ul>
        )}
        {chat.error ? (
          <p
            role="alert"
            className="mt-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive"
          >
            {chat.error}
          </p>
        ) : null}
      </div>

      <form
        onSubmit={handleSubmit}
        className="shrink-0 border-t border-border px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3"
      >
        <div className="flex items-end gap-2 rounded-lg border border-border bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1">
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Ask about a film, developer, or technique…"
            disabled={chat.streaming}
            className="min-h-[24px] max-h-32 flex-1 resize-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-60"
            aria-label="Message"
          />
          <button
            type="submit"
            disabled={chat.streaming || draft.trim().length === 0}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </form>
    </div>
  )
}

function MessageBubble({
  message,
  streaming,
}: {
  message: { role: string; content: string }
  streaming: boolean
}) {
  const isUser = message.role === "user"
  return (
    <li className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[88%] rounded-lg px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap break-words",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
        )}
        data-streaming={!isUser && streaming ? "true" : undefined}
      >
        {message.content || (isUser ? "" : "…")}
      </div>
    </li>
  )
}

function TypingDots() {
  return (
    <div
      role="status"
      aria-label="Assistant is typing"
      className="flex items-center gap-1 rounded-lg bg-muted px-3 py-2"
    >
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground/60" />
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground/60 [animation-delay:120ms]" />
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground/60 [animation-delay:240ms]" />
    </div>
  )
}

function EmptyThread({
  onPick,
  disabled,
}: {
  onPick: (prompt: string) => void
  disabled: boolean
}) {
  return (
    <div className="flex h-full flex-col">
      <p className="text-sm text-muted-foreground">
        Ask anything about your film stocks, developers, agitation, push/pull,
        temperature correction, or troubleshooting.
      </p>
      <p className="mt-4 mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Try a starter
      </p>
      <ul className="flex flex-col gap-2">
        {STARTER_PROMPTS.map((prompt) => (
          <li key={prompt}>
            <button
              type="button"
              onClick={() => onPick(prompt)}
              disabled={disabled}
              className="block w-full rounded-md border border-border bg-background px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted disabled:opacity-50"
            >
              {prompt}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
