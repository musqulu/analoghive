import type { Metadata } from "next"
import { cn } from "@/lib/utils"
import { mainGutterX, mainUnderNav, pageTitle } from "@/lib/app-page-layout"

export const metadata: Metadata = {
  title: "Stories | Analog Hive",
  description:
    "Articles and notes on analog film development, darkroom practice, and the craft of shooting film.",
}

export default function StoriesPage() {
  return (
    <main className={cn(mainUnderNav, mainGutterX)}>
      <div className="mx-auto max-w-2xl">
        <h1 className={pageTitle}>Stories</h1>
        <p className="mt-2 text-muted-foreground">
          Field notes, how-tos, and longer reads on film photography and
          development. New posts will appear here.
        </p>
      </div>
    </main>
  )
}
