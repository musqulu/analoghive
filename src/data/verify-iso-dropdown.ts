const fs = require('fs');
const path = require('path');

// Import the development times
const { developmentTimes } = require('./processed-development-times');

// Test film and developer combination
const testFilmId = 'ilforddelta400';
const testDeveloperId = 'rodinal';
const testFormat = '35mm';

// Filter development times for the test film and developer
const times = developmentTimes.filter(
  time => time.filmId === testFilmId && 
          time.developerId === testDeveloperId && 
          (!testFormat || !time.format || time.format === testFormat)
);

// Extract unique ISO values that have development times, filtering out null values
const availableIsoValues = [...new Set(times
  .filter(time => time.iso !== null)
  .map(time => time.iso))]
  .sort((a, b) => a - b);

console.log(`Available ISO values for Ilford Delta 400 with Rodinal (${testFormat}):`);
console.log(availableIsoValues);

// For each ISO, show available dilutions
availableIsoValues.forEach(iso => {
  console.log(`\nISO ${iso} dilutions:`);
  
  // Filter times to only include exact ISO matches
  const exactIsoTimes = times.filter(time => time.iso === iso);
  
  // Group exact ISO times by dilution
  const dilutions = [...new Set(exactIsoTimes.map(time => time.dilution))];
  
  dilutions.forEach(dilution => {
    const time = exactIsoTimes.find(t => t.dilution === dilution);
    console.log(`  ${dilution}: ${time.time} min @ ${time.temperature}°C`);
  });
}); 