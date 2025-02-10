export interface Film {
  id: string;
  name: string;
  type: "B&W" | "Color";
  isos: number[];
  manufacturer: string;
  alias?: string[];
}

export const films: Film[] = [
  { 
    id: "trix400",
    name: "Tri-X 400",
    manufacturer: "Kodak",
    type: "B&W",
    isos: [200, 400, 800, 1600],
    alias: ["TX", "Tri-X"]
  },
  { 
    id: "hp5plus",
    name: "HP5+",
    manufacturer: "Ilford",
    type: "B&W",
    isos: [200, 400, 800, 1600, 3200],
    alias: ["HP5", "HP5 Plus"]
  },
  { 
    id: "delta3200",
    name: "Delta 3200",
    manufacturer: "Ilford",
    type: "B&W",
    isos: [1600, 3200, 6400, 12800],
    alias: ["Delta"]
  }
];

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