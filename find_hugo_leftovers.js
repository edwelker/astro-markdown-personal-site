import fs from 'fs';
import path from 'path';

const CONTENT_DIR = './src/content';

function walk(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`Directory not found: ${dir}`);
    return;
  }

  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      walk(filePath);
    } else if (file.endsWith('.md') || file.endsWith('.mdx')) {
      scanFile(filePath);
    }
  });
}

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let fileHasMatch = false;

  lines.forEach((line, index) => {
    // Regex matches {{< ... >}} or {{% ... %}}
    // This catches figures, tweets, youtube, gists, etc.
    if (line.match(/\{\{[<%].*?[%>]\}\}/)) {

      // Print the filename only once per file
      if (!fileHasMatch) {
        console.log(`\n📄 \x1b[1m${filePath}\x1b[0m`);
        fileHasMatch = true;
      }

      // Print the line number and the offending code
      console.log(`   Line ${index + 1}: \x1b[33m${line.trim()}\x1b[0m`);
    }
  });
}

console.log("🔍 Scanning for leftover Hugo specific syntax...");
walk(CONTENT_DIR);
console.log("\nScan complete.");
