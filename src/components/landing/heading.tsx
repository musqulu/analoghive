import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

export function Heading({
  children,
  color = "dark/light",
  className,
  ...props
}: { color?: "dark/light" | "light" } & ComponentProps<"h1">) {
  return (
    <h1
      className={cn(
        "text-balance font-semibold leading-[1.05] tracking-[-0.06em] text-[3rem] text-foreground",
        color === "light" && "text-white",
        className,
      )}
      {...props}
    >
      {children}
    </h1>
  )
}
