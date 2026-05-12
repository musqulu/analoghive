"use client"

import confetti from "canvas-confetti"

export function burstCelebrationConfetti(): void {
  if (typeof window === "undefined") return
  const count = 160
  const defaults = { origin: { y: 0.72 }, ticks: 200, gravity: 0.9 }

  confetti({
    ...defaults,
    particleCount: Math.floor(count * 0.25),
    spread: 26,
    startVelocity: 55,
    scalar: 0.95,
  })
  confetti({
    ...defaults,
    particleCount: Math.floor(count * 0.2),
    spread: 60,
    scalar: 0.9,
  })
  confetti({
    ...defaults,
    particleCount: Math.floor(count * 0.35),
    spread: 100,
    decay: 0.91,
    scalar: 0.85,
    startVelocity: 35,
    colors: ["#e8e4dc", "#c4bfb6", "#1a1918"],
  })
}
