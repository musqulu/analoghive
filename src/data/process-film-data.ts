const fs = require('fs');
const path = require('path');

interface RawFilmData {
  Film: string;
  Developer: string;
  Dilution: string;
  "ASA/ISO": string;
  "35mm": string;
  "120": string;
  Sheet: string;
  Temp: string;
}

interface Film {
  id: string;
  name: string;
  type: "B&W" | "Color";
  isos: number[];
  manufacturer: string;
  alias?: string[];
  formats: ("35mm" | "120" | "sheet")[];
}

interface DevelopmentTime {
  filmId: string;
  developerId: string;
  dilution: string;
  iso: number;
  time: number;
  temperature: number;
  format?: "35mm" | "120" | "sheet";
  notes?: string;
}

// Function to generate a unique ID from a film name
function generateFilmId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/\s+/g, '');
}

// Function to generate a unique ID from a developer name
function generateDeveloperId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/\s+/g, '');
}

// Function to extract temperature value from string like "20C" or "68F"
function extractTemperature(tempStr: string): number {
  const match = tempStr.match(/(\d+)/);
  if (!match) return 20; // Default to 20°C if no match
  
  const temp = parseInt(match[1], 10);
  if (tempStr.includes('F')) {
    // Convert Fahrenheit to Celsius
    return Math.round((temp - 32) * 5 / 9);
  }
  return temp;
}

// Process all film data files
async function processFilmData() {
  const filmDataDir = path.join(__dirname, 'film_data');
  const files = fs.readdirSync(filmDataDir).filter(file => file.endsWith('.json'));
  
  const films = new Map();
  const developmentTimes = [];
  
  for (const file of files) {
    const filePath = path.join(filmDataDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    for (const entry of data) {
      // Skip entries with no development times
      if (!entry['35mm'] && !entry['120'] && !entry.Sheet) continue;
      
      // Process film data
      const filmName = entry.Film;
      const manufacturer = filmName.split(' ')[0]; // Extract first word as manufacturer
      const filmId = generateFilmId(filmName);
      
      if (!films.has(filmId)) {
        films.set(filmId, {
          id: filmId,
          name: filmName,
          type: "B&W", // Assuming all are B&W for now
          isos: [],
          manufacturer,
          formats: []
        });
      }
      
      // Add ISO if not already in the list
      const iso = parseInt(entry['ASA/ISO'], 10);
      if (!isNaN(iso) && !films.get(filmId).isos.includes(iso)) {
        films.get(filmId).isos.push(iso);
      }
      
      // Add formats
      if (entry['35mm'] && !films.get(filmId).formats.includes('35mm')) {
        films.get(filmId).formats.push('35mm');
      }
      if (entry['120'] && !films.get(filmId).formats.includes('120')) {
        films.get(filmId).formats.push('120');
      }
      if (entry.Sheet && !films.get(filmId).formats.includes('sheet')) {
        films.get(filmId).formats.push('sheet');
      }
      
      // Process development times
      const developerId = generateDeveloperId(entry.Developer);
      const temperature = extractTemperature(entry.Temp);
      
      // Add 35mm development time
      if (entry['35mm']) {
        developmentTimes.push({
          filmId,
          developerId,
          dilution: entry.Dilution,
          iso,
          time: parseFloat(entry['35mm']),
          temperature,
          format: '35mm'
        });
      }
      
      // Add 120 development time
      if (entry['120']) {
        developmentTimes.push({
          filmId,
          developerId,
          dilution: entry.Dilution,
          iso,
          time: parseFloat(entry['120']),
          temperature,
          format: '120'
        });
      }
      
      // Add sheet development time
      if (entry.Sheet) {
        developmentTimes.push({
          filmId,
          developerId,
          dilution: entry.Dilution,
          iso,
          time: parseFloat(entry.Sheet),
          temperature,
          format: 'sheet'
        });
      }
    }
  }
  
  // Sort ISOs numerically for each film
  for (const film of films.values()) {
    film.isos.sort((a, b) => a - b);
  }
  
  // Convert to arrays for export
  const filmsArray = Array.from(films.values());
  
  // Write to files
  fs.writeFileSync(
    path.join(__dirname, 'processed-films.ts'),
    `export interface Film {
  id: string;
  name: string;
  type: "B&W" | "Color";
  isos: number[];
  manufacturer: string;
  alias?: string[];
  formats: ("35mm" | "120" | "sheet")[];
}

export const films: Film[] = ${JSON.stringify(filmsArray, null, 2)};

// Utility function to find a film by name
export function findFilmByName(name: string): Film | undefined {
  return films.find(film => 
    film.name === name || 
    film.alias?.includes(name)
  );
}

// Utility function to get available ISOs for a film
export function getFilmIsos(filmId: string): number[] {
  const film = films.find(f => f.id === filmId);
  return film?.isos || [];
}

// Utility function to get available formats for a film
export function getFilmFormats(filmId: string): ("35mm" | "120" | "sheet")[] {
  const film = films.find(f => f.id === filmId);
  return film?.formats || [];
}
`
  );
  
  fs.writeFileSync(
    path.join(__dirname, 'processed-development-times.ts'),
    `export interface DevelopmentTime {
  filmId: string;
  developerId: string;
  dilution: string;
  iso: number;
  time: number;
  temperature: number;
  format?: "35mm" | "120" | "sheet";
  notes?: string;
}

export const developmentTimes: DevelopmentTime[] = ${JSON.stringify(developmentTimes, null, 2)};

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
export function getAvailableDilutions(filmId: string, developerId: string, format?: "35mm" | "120" | "sheet"): string[] {
  return [...new Set(developmentTimes
    .filter(time => time.filmId === filmId && 
                   time.developerId === developerId && 
                   (!format || !time.format || time.format === format))
    .map(time => time.dilution))];
}
`
  );
  
  console.log('Film data processing complete!');
}

// Run the processing function
processFilmData().catch(console.error); 