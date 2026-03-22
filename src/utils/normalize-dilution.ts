export function normalizeDilutionDisplay(dilution: string | undefined): string {
  if (!dilution) return ""

  if (dilution.split(":").length > 2) {
    const match = dilution.match(/(\d+):(\d+)$/)
    if (match) {
      return dilution.replace(`${match[1]}:${match[2]}`, `${match[1]}+${match[2]}`)
    }
  }

  return dilution.replace(":", "+")
}
