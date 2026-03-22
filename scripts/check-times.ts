const { findDevelopmentTimes, findClosestIsoTime } = require('./processed-development-times');

// Check times for Kentmere films with 510-Pyro developer
const filmId = 'kentmerefilms';
const developerId = '510pyro';
const format = '35mm';
const targetIso = 200;

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

const times = findDevelopmentTimes(filmId, developerId, format);
console.log('Available times for Kentmere films with 510-Pyro developer:');
console.log(JSON.stringify(times, null, 2));

// Check ISO 200 times
const iso200Times = times.filter((t: DevelopmentTime) => t.iso === targetIso);
console.log(`\nISO ${targetIso} times:`);
console.log(JSON.stringify(iso200Times, null, 2));

// Find closest ISO time
const closestTime = findClosestIsoTime(times, targetIso);
console.log(`\nClosest time to ISO ${targetIso}:`);
console.log(JSON.stringify(closestTime, null, 2)); 