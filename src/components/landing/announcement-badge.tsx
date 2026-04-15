import type { ComponentProps, ReactNode } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"

export function AnnouncementBadge({
  text,
  href,
  cta = "Learn more",
  variant = "normal",
  className,
  ...props
}: {
  text: ReactNode
  href: string
  cta?: ReactNode
  variant?: "normal" | "overlay"
} & Omit<ComponentProps<typeof Link>, "href" | "children">) {
  return (
    <Link
      href={href}
      {...props}
      className={cn(
        "group relative inline-flex max-w-full gap-x-3 overflow-hidden rounded-full px-3 py-0.5 text-xs font-medium max-sm:flex-col sm:items-center",
        variant === "normal" &&
          "bg-[#ebf5ff] text-[#0068d6] hover:bg-[#ebf5ff]/90",
        variant === "overlay" &&
          "bg-white/15 text-white hover:bg-white/25",
        className,
      )}
    >
      <span className="text-pretty sm:truncate">{text}</span>
      <span
        className={cn(
          "h-3 w-px max-sm:hidden",
          variant === "normal" && "bg-[#0068d6]/20",
          variant === "overlay" && "bg-white/20",
        )}
      />
      <span
        className={cn(
          "inline-flex shrink-0 items-center gap-2 font-medium",
          variant === "normal" && "text-[#0068d6]",
        )}
      >
        {cta} <ChevronRight className="size-3.5 shrink-0" />
      </span>
    </Link>
  )
}
