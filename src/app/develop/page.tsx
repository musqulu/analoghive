import { Suspense } from "react"
import { DevelopCalculator } from "@/app/develop/develop-calculator"
import { cn } from "@/lib/utils"
import { mainGutterX, mainUnderNav } from "@/lib/app-page-layout"

function DevelopFallback() {
  return (
    <main className={cn("flex flex-col items-center", mainUnderNav, mainGutterX)}>
      <div className="w-full max-w-md space-y-8">
        <div className="mx-auto mb-8 h-8 w-64 max-w-full rounded-md bg-muted" />
        <div className="space-y-4">
          <div className="h-40 rounded-lg bg-muted" />
          <div className="h-32 rounded-lg bg-muted" />
        </div>
      </div>
    </main>
  )
}

export default function DevelopPage() {
  return (
    <Suspense fallback={<DevelopFallback />}>
      <DevelopCalculator />
    </Suspense>
  )
}
