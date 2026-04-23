/** Pre–explicit-label HC-110 chart rows (single letter only). */
export const HC110_LEGACY_LETTER_TO_DILUTION: Readonly<Record<string, string>> = {
  A: "A 1+15",
  B: "B 1+31",
  C: "C 1+19",
  D: "D 1+39",
  E: "E 1+47",
  F: "F 1+79",
  G: "G 1+119",
  H: "H 1+63",
  J: "J 1+150",
} as const

export function tryHc110LegacyOptionKey(
  oldOptionKey: string
): string | null {
  const m = oldOptionKey.match(/^([A-HJ])\|(-?\d+(?:\.\d+)?)$/)
  if (!m) return null
  const letter = m[1] ?? ""
  const newDilution = HC110_LEGACY_LETTER_TO_DILUTION[letter]
  if (!newDilution) return null
  return `${newDilution}|${m[2]}`
}
