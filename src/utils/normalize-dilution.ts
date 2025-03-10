/**
 * Normalizes dilution display format from colon (:) to plus (+)
 * This handles standard dilution formats like "1:50" → "1+50"
 * For complex formats like "HC-110:B:1:31", it specifically converts
 * the ratio part (e.g., "1:31") to maintain expected patterns
 * @param dilution The dilution string to normalize
 * @returns Normalized dilution string
 */
export const normalizeDilutionDisplay = (dilution: string | undefined): string | undefined => {
  if (!dilution) return dilution;
  
  // Special case for complex formats like "HC-110:B:1:31"
  if (dilution.split(':').length > 2) {
    // For cases like "HC-110:B:1:31", we want to replace only the colon between 1 and 31
    const match = dilution.match(/(\d+):(\d+)$/);
    if (match) {
      return dilution.replace(`${match[1]}:${match[2]}`, `${match[1]}+${match[2]}`);
    }
  }
  
  // Standard case for simple formats like "1:50"
  return dilution.replace(':', '+');
}; 