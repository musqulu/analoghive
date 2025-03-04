const fs = require('fs');
const path = require('path');

// Path to the processed development times file
const filePath = path.join(__dirname, 'processed-development-times.ts');

// Read the file content
let content = fs.readFileSync(filePath, 'utf8');

// Split the content into lines
const lines = content.split('\n');

// Check if lines 238304 and 238308 both contain the duplicate declaration
if (lines.length >= 238308 && 
    lines[238303].includes('const validTimes = times.filter') && 
    lines[238307].includes('const validTimes = times.filter')) {
  
  // Remove the second declaration (line 238308) and keep the first one
  lines.splice(238307, 1);
  
  // Join the lines back together
  const updatedContent = lines.join('\n');
  
  // Write the updated content back to the file
  fs.writeFileSync(filePath, updatedContent);
  console.log('Fixed duplicate variable declaration in processed-development-times.ts');
} else {
  console.log('Could not find the expected duplicate declaration pattern.');
} 