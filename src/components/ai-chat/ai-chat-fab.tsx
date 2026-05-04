"use client"

import * as Dialog from "@radix-ui/react-dialog"
import { MessageCircle, X } from "lucide-react"
import { useState } from "react"
import { AiChatPanel } from "@/components/ai-chat/ai-chat-panel"
import { useAuthSession } from "@/components/auth-session-provider"

export function AiChatFab() {
  const { showAuthed } = useAuthSession()
  const [open, setOpen] = useState(false)

  if (!showAuthed) return null

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-label="Open darkroom assistant"
          className="fixed bottom-4 right-4 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-ds-card-lg transition-transform hover:scale-105 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 print:hidden sm:bottom-6 sm:right-6"
        >
          <MessageCircle className="h-6 w-6" aria-hidden />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 right-0 z-[60] flex h-full w-full flex-col border-l border-border bg-background shadow-ds outline-none focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-right-4 data-[state=open]:slide-in-from-right-4 sm:w-[420px] md:w-[460px]"
        >
          <Dialog.Title className="sr-only">Darkroom assistant</Dialog.Title>
          <Dialog.Close asChild>
            <button
              type="button"
              aria-label="Close darkroom assistant"
              className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </Dialog.Close>
          <AiChatPanel />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
