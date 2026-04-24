/**
 * Canonical app-shell layout under the sticky nav (h-[4.5rem] in nav.tsx).
 * Generous top padding so page headlines sit clearly below the nav with breathing room.
 * (Classes must live in a Tailwind `content` path — see tailwind.config.ts.)
 */
export const mainUnderNav =
  "min-h-[calc(100vh-4.5rem)] bg-background pt-12 pb-16 sm:pt-14 sm:pb-20 lg:pt-16 lg:pb-24" as const

/** Horizontal padding aligned with Container (container.tsx). */
export const mainGutterX = "px-6 lg:px-10" as const

export const pageTitle = "text-2xl font-semibold tracking-tight text-foreground" as const
