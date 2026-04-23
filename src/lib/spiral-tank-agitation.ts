import type { Step } from "@/types/development"

/**
 * Paterson-style / spiral-tank intermittent agitation shake cue.
 * @param elapsedSeconds Seconds since the step started (0 = step start).
 * @param stepDurationSeconds Total length of the step in seconds.
 */
export function shouldShakeSpiralTank(
  step: Step,
  elapsedSeconds: number,
  stepDurationSeconds: number,
): boolean {
  if (step === "preSoak" || step === "wash") return false

  const S = stepDurationSeconds
  if (S <= 0) return false

  const e = Math.floor(Math.max(0, elapsedSeconds))

  if (step === "dev" || step === "fix") {
    return e < S && e % 60 < 10
  }

  if (step === "stop") {
    if (S <= 10) return e < S
    if (S < 60) return e < 10
    return e < S && e % 60 < 10
  }

  return false
}
