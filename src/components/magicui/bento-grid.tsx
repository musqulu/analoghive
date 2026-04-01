import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export function BentoGrid({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("grid w-full grid-cols-3 gap-4", className)}>
      {children}
    </div>
  )
}

export function BentoCard({
  className,
  Icon,
  name,
  description,
}: {
  className?: string
  Icon: ReactNode
  name: string
  description: string
}) {
  return (
    <div
      className={cn(
        "group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm",
        className
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-foreground">
        {Icon}
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-foreground">{name}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
