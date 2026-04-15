import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Stories | Analog Hive",
  description:
    "Articles and notes on analog film development, darkroom practice, and the craft of shooting film.",
}

export default function StoriesPage() {
  return (
    <main className="min-h-screen px-8 pb-16 pt-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Stories
        </h1>
        <p className="mt-2 text-muted-foreground">
          Field notes, how-tos, and longer reads on film photography and
          development. New posts will appear here.
        </p>
      </div>
    </main>
  )
}
