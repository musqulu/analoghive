import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

export function Eyebrow({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("text-sm/7 font-semibold text-olive-700 dark:text-olive-400", className)}
      {...props}
    >
      {children}
    </div>
  )
}
