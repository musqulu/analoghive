import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

export function Subheading({
  children,
  color = "dark/light",
  className,
  ...props
}: { color?: "dark/light" | "light" } & ComponentProps<"h2">) {
  return (
    <h2
      className={cn(
        "text-pretty font-semibold leading-tight tracking-[-0.06em] text-[2rem] text-foreground sm:text-[2.5rem] sm:leading-[1.2]",
        color === "light" && "text-white",
        className,
      )}
      {...props}
    >
      {children}
    </h2>
  )
}
