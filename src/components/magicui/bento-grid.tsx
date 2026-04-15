import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { PlainButtonLink } from "@/components/landing/button"

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
  href,
  cta,
}: {
  className?: string
  Icon: ReactNode
  name: string
  description: string
  href: string
  cta: string
}) {
  return (
    <div
      className={cn(
        "group relative flex h-full flex-col gap-4 overflow-hidden rounded-lg bg-card p-6 ds-card",
        className
      )}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground ds-ring">
        {Icon}
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-2">
        <p className="text-2xl font-semibold tracking-[-0.06em] text-foreground">{name}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="pt-1">
        <PlainButtonLink
          href={href}
          size="md"
          color="dark/light"
          className="gap-1 px-2 py-1 text-sm font-medium"
        >
          {cta}
        </PlainButtonLink>
      </div>
    </div>
  )
}
