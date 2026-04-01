import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

export function AnimatedGradientText({ className, children, ...props }: ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "animate-gradient bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:300%_100%] bg-clip-text text-transparent",
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
