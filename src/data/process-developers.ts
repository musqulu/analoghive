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

interface Developer {
  id: string;
  name: string;
  type: "B&W" | "Color";
  manufacturer: string;
  dilutions: Record<string, {
    ratio: string;
    times: Record<number, number>;
    temperature: number;
  }>;
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

// Function to normalize dilution format
function normalizeDilution(dilution: string): string {
  // Convert formats like "1+100" to "1:100"
  return dilution.replace('+', ':');
}

// Function to get manufacturer from developer name (best guess)
function guessManufacturer(developerName: string): string {
  const manufacturerMap: Record<string, string[]> = {
    'Kodak': ['D-76', 'HC-110', 'Xtol', 'T-Max', 'TMax', 'Microdol', 'Dektol'],
    'Ilford': ['ID-11', 'Microphen', 'Perceptol', 'Ilfosol', 'Ilfotec', 'DD-X'],
    'Agfa': ['Rodinal', 'Atomal', 'Neutol'],
    'Adox': ['Adonal', 'FX-39', 'Atomal'],
    'Fuji': ['Fuji', 'Superprodol'],
    'Tetenal': ['Tetenal', 'Ultrafin', 'Paranol'],
    'Foma': ['Foma', 'Fomadon'],
    'Compard': ['Compard', 'R09', 'Calbe'],
    'Moersch': ['Moersch', 'Finol', 'Eco'],
    'Rollei': ['Rollei', 'RLS', 'RHC'],
    'Cinestill': ['Cinestill', 'Df96', 'D96'],
    'Bellini': ['Bellini', 'Hydrofen', 'Eco']
  };

  for (const [manufacturer, keywords] of Object.entries(manufacturerMap)) {
    for (const keyword of keywords) {
      if (developerName.includes(keyword)) {
        return manufacturer;
      }
    }
  }

  // If the developer name starts with a manufacturer name
  const firstWord = developerName.split(' ')[0];
  if (Object.keys(manufacturerMap).includes(firstWord)) {
    return firstWord;
  }

  return 'Generic';
}

// Process all film data files to extract developer information
async function processDeveloperData() {
  const filmDataDir = path.join(__dirname, 'film_data');
  const files = fs.readdirSync(filmDataDir).filter(file => file.endsWith('.json'));
  
  const developers = new Map<string, Developer>();
  
  // Read existing developers.ts file
  const developersFile = fs.readFileSync(path.join(__dirname, 'developers.ts'), 'utf8');
  const developersMatch = developersFile.match(/export const developers: Developer\[\] = (\[[\s\S]*?\]);/);
  
  if (developersMatch) {
    try {
      // Replace single quotes with double quotes for JSON parsing
      const jsonStr = developersMatch[1].replace(/'/g, '"');
      const existingDevelopers = JSON.parse(jsonStr);
      
      // Add existing developers to the map
      for (const dev of existingDevelopers) {
        developers.set(dev.id, dev);
      }
    } catch (error) {
      console.error('Error parsing existing developers:', error);
      // Continue with empty map if parsing fails
    }
  }
  
  for (const file of files) {
    const filePath = path.join(filmDataDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    for (const entry of data) {
      // Skip entries with no development times or no developer info
      if ((!entry['35mm'] && !entry['120'] && !entry.Sheet) || !entry.Developer) continue;
      
      const developerName = entry.Developer.trim();
      const developerId = generateDeveloperId(developerName);
      
      // Skip if we already have this developer with the same ID
      if (developers.has(developerId)) {
        const developer = developers.get(developerId);
        
        // Add dilution if it doesn't exist
        const dilutionKey = normalizeDilution(entry.Dilution);
        if (!developer.dilutions[dilutionKey]) {
          const temperature = extractTemperature(entry.Temp);
          developer.dilutions[dilutionKey] = {
            ratio: entry.Dilution,
            temperature,
            times: {}
          };
        }
        
        // Add ISO time if it doesn't exist
        const iso = parseInt(entry['ASA/ISO'], 10);
        if (!isNaN(iso) && !developer.dilutions[dilutionKey].times[iso]) {
          // Use 35mm time as default, fallback to 120 or sheet if 35mm not available
          let time = 0;
          if (entry['35mm']) {
            time = parseFloat(entry['35mm']);
          } else if (entry['120']) {
            time = parseFloat(entry['120']);
          } else if (entry.Sheet) {
            time = parseFloat(entry.Sheet);
          }
          
          if (time > 0) {
            developer.dilutions[dilutionKey].times[iso] = time;
          }
        }
      } else {
        // Create new developer
        const manufacturer = guessManufacturer(developerName);
        const dilutionKey = normalizeDilution(entry.Dilution);
        const temperature = extractTemperature(entry.Temp);
        
        // Use 35mm time as default, fallback to 120 or sheet if 35mm not available
        let time = 0;
        if (entry['35mm']) {
          time = parseFloat(entry['35mm']);
        } else if (entry['120']) {
          time = parseFloat(entry['120']);
        } else if (entry.Sheet) {
          time = parseFloat(entry.Sheet);
        }
        
        if (time > 0) {
          const iso = parseInt(entry['ASA/ISO'], 10);
          if (!isNaN(iso)) {
            developers.set(developerId, {
              id: developerId,
              name: developerName,
              manufacturer,
              type: "B&W", // Assuming all are B&W for now
              dilutions: {
                [dilutionKey]: {
                  ratio: entry.Dilution,
                  temperature,
                  times: {
                    [iso]: time
                  }
                }
              }
            });
          }
        }
      }
    }
  }
  
  // Convert to array for export
  const developersArray = Array.from(developers.values());
  
  // Write to file
  fs.writeFileSync(
    path.join(__dirname, 'processed-developers.ts'),
    `export interface Developer {
  id: string;
  name: string;
  type: "B&W" | "Color";
  manufacturer: string;
  dilutions: Record<string, {
    ratio: string;
    times: Record<number, number>;
    temperature: number;
  }>;
}

export const developers: Developer[] = ${JSON.stringify(developersArray, null, 2)};

// Utility function to find a developer by name
export function findDeveloperByName(name: string): Developer | undefined {
  return developers.find(dev => dev.name === name);
}

// Utility function to get available dilutions for a developer
export function getDeveloperDilutions(developerId: string): string[] {
  const developer = developers.find(dev => dev.id === developerId);
  return developer ? Object.keys(developer.dilutions).map(key => developer.dilutions[key].ratio) : [];
}

// Utility function to get development time for specific conditions
export function getDevelopmentTime(developerId: string, dilutionKey: string, iso: number): number | undefined {
  const developer = developers.find(dev => dev.id === developerId);
  if (!developer) return undefined;

  const dilution = developer.dilutions[dilutionKey];
  if (!dilution) return undefined;

  return dilution.times[iso];
}
`
  );
  
  console.log('Developer data processing complete!');
}

// Run the processing function
processDeveloperData().catch(console.error); 