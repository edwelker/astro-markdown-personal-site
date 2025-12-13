import fs from 'fs';
import path from 'path';

// Adjust this if your content lives elsewhere
const CONTENT_DIR = './src/content';

function walk(dir) {
  // Check if directory exists before trying to read it
  if (!fs.existsSync(dir)) {
    console.log(`Could not find directory: ${dir}`);
    return;
  }

  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      walk(filePath);
    } else if (file.endsWith('.md') || file.endsWith('.mdx')) {
      checkHeaders(filePath);
    }
  });
}

function checkHeaders(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  // We start at level 1 (assuming the Page Title is the H1)
  let lastLevel = 1;
  let hasError = false;

  lines.forEach((line, index) => {
    // Regex to capture lines starting with ##, ###, etc.
    const match = line.match(/^(#{2,6})\s/);

    if (match) {
      const currentLevel = match[1].length;

      // The Crash Condition:
      if (currentLevel > lastLevel + 1) {
        console.log(`\x1b[31m[FAIL]\x1b[0m ${filePath}:${index + 1}`);
        console.log(`       Jumped from H${lastLevel} to H${currentLevel}`);
        hasError = true;
      }

      lastLevel = currentLevel;
    }
  });
}

console.log("Scanning for header hierarchy issues...");
walk(CONTENT_DIR);
