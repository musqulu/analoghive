const fs = require('fs');
const path = require('path');

// Path to the processed development times file
const filePath = path.join(__dirname, 'processed-development-times.ts');

// Read the file content
let content = fs.readFileSync(filePath, 'utf8');

// Update the interface definition to allow null values for iso
content = content.replace(
  'export interface DevelopmentTime {',
  'export interface DevelopmentTime {'
);

content = content.replace(
  'iso: number;',
  'iso: number | null;'
);

// Update the findClosestIsoTime function to handle null values
content = content.replace(
  'export function findClosestIsoTime(times: DevelopmentTime[], targetIso: number): DevelopmentTime | null {',
  'export function findClosestIsoTime(times: DevelopmentTime[], targetIso: number): DevelopmentTime | null {'
);

content = content.replace(
  'if (times.length === 0) return null;',
  `if (times.length === 0) return null;

  // Filter out entries with null ISO values
  const validTimes = times.filter(time => time.iso !== null);
  if (validTimes.length === 0) return null;`
);

content = content.replace(
  'return times.reduce((prev, curr) => {',
  'return validTimes.reduce((prev, curr) => {'
);

content = content.replace(
  'return Math.abs(curr.iso - targetIso) < Math.abs(prev.iso - targetIso)',
  'return Math.abs(curr.iso as number - targetIso) < Math.abs(prev.iso as number - targetIso)'
);

// Write the updated content back to the file
fs.writeFileSync(filePath, content);

console.log('Fixed ISO type issues in processed-development-times.ts'); 