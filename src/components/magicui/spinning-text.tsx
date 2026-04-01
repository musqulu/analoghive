"use client"

import { cn } from "@/lib/utils"

interface SpinningTextProps {
  children: string
  className?: string
  duration?: number
  radius?: number
}

export function SpinningText({
  children,
  className,
  duration = 10,
  radius = 5,
}: SpinningTextProps) {
  const characters = children.split("")
  const angleStep = 360 / characters.length

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: `${radius * 2}rem`, height: `${radius * 2}rem` }}
    >
      <div
        className="absolute inset-0 animate-spin"
        style={{ animationDuration: `${duration}s`, animationTimingFunction: "linear" }}
      >
        {characters.map((char, i) => (
          <span
            key={i}
            className="absolute left-1/2 top-0 origin-[0_var(--radius)] text-sm font-medium tracking-widest text-olive-950 dark:text-white"
            style={{
              transform: `rotate(${i * angleStep}deg)`,
              "--radius": `${radius}rem`,
            } as React.CSSProperties}
          >
            {char}
          </span>
        ))}
      </div>
    </div>
  )
}
