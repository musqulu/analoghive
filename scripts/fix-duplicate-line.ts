const fs = require('fs');
const path = require('path');

// Path to the processed development times file
const filePath = path.join(__dirname, 'processed-development-times.ts');

// Read the file content
let content = fs.readFileSync(filePath, 'utf8');

// Find and fix the duplicate line in findClosestIsoTime function
const duplicatePattern = '  // Filter out entries with null ISO values\n  const validTimes = times.filter(time => time.iso !== null);\n  if (validTimes.length === 0) return null;\n\n  // Filter out entries with null ISO values\n  if (validTimes.length === 0) return null;';
const fixedContent = '  // Filter out entries with null ISO values\n  const validTimes = times.filter(time => time.iso !== null);\n  if (validTimes.length === 0) return null;';

// Replace the duplicate pattern
content = content.replace(duplicatePattern, fixedContent);

// Write the updated content back to the file
fs.writeFileSync(filePath, content);

console.log('Fixed duplicate line in findClosestIsoTime function'); 