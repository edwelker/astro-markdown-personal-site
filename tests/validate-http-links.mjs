import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.join(__dirname, '../src/content');

function getFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(filePath));
    } else {
      if (file.endsWith('.md') || file.endsWith('.mdx')) {
        results.push(filePath);
      }
    }
  }
  return results;
}

console.log('Scanning content for insecure HTTP links...');

const files = getFiles(contentDir);
let hasError = false;
let filesChecked = 0;

for (const file of files) {
  filesChecked++;
  const content = fs.readFileSync(file, 'utf-8');
  
  // Split by code blocks to ignore them.
  // The regex matches ```...``` including newlines.
  // The split results in an array of text segments that are NOT inside code blocks.
  const parts = content.split(/```[\s\S]*?```/g);
  
  parts.forEach((part) => {
    // Regex for http://
    // We use a simple check. If we needed to be stricter about word boundaries we could,
    // but generally http:// shouldn't exist in prose.
    const httpRegex = /http:\/\//g;
    let match;
    while ((match = httpRegex.exec(part)) !== null) {
        console.error(`\n[FAIL] Found 'http://' in ${path.relative(process.cwd(), file)}`);
        
        // Show some context
        const start = Math.max(0, match.index - 30);
        const end = Math.min(part.length, match.index + 50);
        const context = part.substring(start, end).replace(/\n/g, ' ');
        console.error(`Context: "...${context}..."`);
        
        hasError = true;
    }
  });
}

console.log(`Checked ${filesChecked} files.`);

if (hasError) {
  console.error('\nFAILED: Insecure HTTP links found.');
  process.exit(1);
} else {
  console.log('\nPASSED: No insecure HTTP links found in content (ignoring code blocks).');
  process.exit(0);
}
