import type { ComponentProps } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const sizes = {
  md: "px-4 py-2",
  lg: "px-4 py-2",
}

export function Button({
  size = "md",
  type = "button",
  color = "dark/light",
  className,
  ...props
}: {
  size?: keyof typeof sizes
  color?: "dark/light" | "light"
} & ComponentProps<"button">) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-1 rounded-md text-sm/7 font-medium transition-colors",
        color === "dark/light" &&
          "bg-primary text-primary-foreground hover:bg-primary/90",
        color === "light" &&
          "bg-background text-foreground shadow-ds hover:bg-muted",
        sizes[size],
        className,
      )}
      {...props}
    />
  )
}

export function ButtonLink({
  size = "md",
  color = "dark/light",
  className,
  href,
  ...props
}: {
  href: string
  size?: keyof typeof sizes
  color?: "dark/light" | "light"
} & Omit<ComponentProps<typeof Link>, "href">) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-1 rounded-md text-sm/7 font-medium transition-colors",
        color === "dark/light" &&
          "bg-primary text-primary-foreground hover:bg-primary/90",
        color === "light" &&
          "bg-background text-foreground shadow-ds hover:bg-muted",
        sizes[size],
        className,
      )}
      {...props}
    />
  )
}

export function SoftButton({
  size = "md",
  type = "button",
  className,
  ...props
}: {
  size?: keyof typeof sizes
} & ComponentProps<"button">) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-1 rounded-md bg-muted text-sm/7 font-medium text-foreground transition-colors hover:bg-muted/80",
        sizes[size],
        className,
      )}
      {...props}
    />
  )
}

export function SoftButtonLink({
  size = "md",
  href,
  className,
  ...props
}: {
  href: string
  size?: keyof typeof sizes
} & Omit<ComponentProps<typeof Link>, "href">) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-1 rounded-md bg-muted text-sm/7 font-medium text-foreground transition-colors hover:bg-muted/80",
        sizes[size],
        className,
      )}
      {...props}
    />
  )
}

export function PlainButtonLink({
  size = "md",
  color = "dark/light",
  href,
  className,
  ...props
}: {
  href: string
  size?: keyof typeof sizes
  color?: "dark/light" | "light"
} & Omit<ComponentProps<typeof Link>, "href">) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm/7 font-medium transition-colors",
        color === "dark/light" &&
          "text-foreground hover:bg-muted",
        color === "light" && "text-white hover:bg-white/10",
        sizes[size],
        className,
      )}
      {...props}
    />
  )
}
