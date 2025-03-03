export interface DevelopmentTime {
  filmId: string;
  developerId: string;
  dilution: string;
  iso: number;
  time: number;
  temperature: number;
  format?: "35mm" | "120" | "sheet"; // Optional format-specific time
  notes?: string;
}

export const developmentTimes: DevelopmentTime[] = [
  // Tri-X 400 in D-76
  {
    filmId: "trix400",
    developerId: "d76",
    dilution: "1:0",
    iso: 400,
    time: 11,
    temperature: 20,
    notes: "Standard development"
  },
  {
    filmId: "trix400",
    developerId: "d76",
    dilution: "1:1",
    iso: 400,
    time: 13,
    temperature: 20
  },
  // Tri-X 400 in HC-110
  {
    filmId: "trix400",
    developerId: "hc110",
    dilution: "b",
    iso: 400,
    time: 5.5,
    temperature: 20
  },
  // HP5+ in D-76
  {
    filmId: "hp5plus",
    developerId: "d76",
    dilution: "1:0",
    iso: 400,
    time: 9,
    temperature: 20
  },
  {
    filmId: "hp5plus",
    developerId: "d76",
    dilution: "1:1",
    iso: 400,
    time: 11,
    temperature: 20
  },
  // HP5+ in Rodinal
  {
    filmId: "hp5plus",
    developerId: "rodinal",
    dilution: "1:50",
    iso: 400,
    time: 11,
    temperature: 20,
    notes: "Sharp grain structure"
  }
];

// Utility function to find development times for a specific film and developer combination
export function findDevelopmentTimes(filmId: string, developerId: string, format?: "35mm" | "120" | "sheet"): DevelopmentTime[] {
  return developmentTimes.filter(
    time => time.filmId === filmId && 
            time.developerId === developerId && 
            (!format || !time.format || time.format === format)
  );
}

// Utility function to find the closest ISO time
export function findClosestIsoTime(times: DevelopmentTime[], targetIso: number): DevelopmentTime | null {
  if (times.length === 0) return null;

  return times.reduce((prev, curr) => {
    return Math.abs(curr.iso - targetIso) < Math.abs(prev.iso - targetIso)
      ? curr
      : prev;
  });
}

// Utility function to get development time with temperature compensation
export function calculateCorrectedTime(baseTemp: number, baseTime: number, newTemp: number, constantAgitation: boolean = false): number {
  // Using the Q10 temperature coefficient (development rate doubles every 10°C)
  const q10 = 2;
  const tempDiff = newTemp - baseTemp;
  const factor = Math.pow(q10, tempDiff / 10);
  let correctedTime = baseTime / factor;

  // Apply constant agitation adjustment if enabled
  // Using T_effective = T_static / (1 + k·A) where k·A = 0.3 for constant agitation
  if (constantAgitation) {
    correctedTime = correctedTime / (1.3);
  }

  // Round to nearest second and ensure minimum time
  return Math.max(0.1, Math.round(correctedTime * 60) / 60);
}

// Utility function to get available dilutions for a film/developer combination
export function getAvailableDilutions(filmId: string, developerId: string): string[] {
  return [...new Set(developmentTimes
    .filter(time => time.filmId === filmId && time.developerId === developerId)
    .map(time => time.dilution))];
} 