"use client"

import "./globals.css"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body className="bg-background font-sans text-foreground antialiased">
        <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-4 px-6 py-16 text-center">
          <h1 className="text-lg font-semibold">Something went wrong</h1>
          <p className="text-pretty text-sm text-muted-foreground">
            {error.message || "An unexpected error occurred."}
          </p>
          <button
            type="button"
            onClick={reset}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  )
}
