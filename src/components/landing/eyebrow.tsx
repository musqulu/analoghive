import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

export function Eyebrow({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("text-sm/7 font-medium text-muted-foreground", className)}
      {...props}
    >
      {children}
    </div>
  )
}
