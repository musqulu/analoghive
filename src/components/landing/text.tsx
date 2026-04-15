import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

export function Text({
  children,
  className,
  size = "md",
  ...props
}: ComponentProps<"div"> & { size?: "md" | "lg" }) {
  return (
    <div
      className={cn(
        size === "md" && "text-base/7",
        size === "lg" && "text-xl leading-[1.8]",
        "text-muted-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
