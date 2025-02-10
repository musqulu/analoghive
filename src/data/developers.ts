export interface Developer {
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

export const developers: Developer[] = [
  {
    id: "d76",
    name: "D-76",
    manufacturer: "Kodak",
    type: "B&W",
    dilutions: {
      "1:0": {
        ratio: "1:0",
        temperature: 20,
        times: {
          200: 9,
          400: 11,
          800: 13,
          1600: 15,
          3200: 17,
          6400: 19,
          12800: 21
        }
      },
      "1:1": {
        ratio: "1:1",
        temperature: 20,
        times: {
          200: 11,
          400: 13,
          800: 15,
          1600: 17,
          3200: 19,
          6400: 21,
          12800: 23
        }
      }
    }
  },
  {
    id: "hc110",
    name: "HC-110",
    manufacturer: "Kodak",
    type: "B&W",
    dilutions: {
      "b": {
        ratio: "Dilution B (1:31)",
        temperature: 20,
        times: {
          200: 4.5,
          400: 5.5,
          800: 7,
          1600: 9,
          3200: 11,
          6400: 13,
          12800: 15
        }
      },
      "e": {
        ratio: "Dilution E (1:47)",
        temperature: 20,
        times: {
          200: 6.5,
          400: 7.5,
          800: 9,
          1600: 11,
          3200: 13,
          6400: 15,
          12800: 17
        }
      },
      "h": {
        ratio: "Dilution H (1:63)",
        temperature: 20,
        times: {
          200: 9,
          400: 10,
          800: 12,
          1600: 14,
          3200: 16,
          6400: 18,
          12800: 20
        }
      }
    }
  },
  {
    id: "id11",
    name: "ID-11",
    manufacturer: "Ilford",
    type: "B&W",
    dilutions: {
      "1:0": {
        ratio: "1:0",
        temperature: 20,
        times: {
          200: 8,
          400: 10,
          800: 12,
          1600: 14,
          3200: 16,
          6400: 18,
          12800: 20
        }
      },
      "1:1": {
        ratio: "1:1",
        temperature: 20,
        times: {
          200: 10,
          400: 12,
          800: 14,
          1600: 16,
          3200: 18,
          6400: 20,
          12800: 22
        }
      },
      "1:3": {
        ratio: "1:3",
        temperature: 20,
        times: {
          200: 15,
          400: 17,
          800: 19,
          1600: 21,
          3200: 23,
          6400: 25,
          12800: 27
        }
      }
    }
  },
  {
    id: "rodinal",
    name: "Rodinal",
    manufacturer: "Agfa",
    type: "B&W",
    dilutions: {
      "1:25": {
        ratio: "1:25",
        temperature: 20,
        times: {
          200: 5,
          400: 6,
          800: 8,
          1600: 11,
          3200: 14,
          6400: 17,
          12800: 20
        }
      },
      "1:50": {
        ratio: "1:50",
        temperature: 20,
        times: {
          200: 8,
          400: 11,
          800: 14,
          1600: 17,
          3200: 20,
          6400: 23,
          12800: 26
        }
      },
      "1:100": {
        ratio: "1:100",
        temperature: 20,
        times: {
          200: 14,
          400: 18,
          800: 22,
          1600: 26,
          3200: 30,
          6400: 34,
          12800: 38
        }
      }
    }
  }
];

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