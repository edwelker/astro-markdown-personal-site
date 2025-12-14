import fs from 'fs';
import path from 'path';

// CHANGE THIS if your files are in src/pages or just 'content'
const ROOT_DIR = '.';

function walk(dir) {
  // Skip node_modules and .git to be fast
  if (dir.includes('node_modules') || dir.includes('.git') || dir.includes('.astro')) return;

  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      walk(filePath);
    } else if (file.endsWith('.md') || file.endsWith('.mdx')) {
      checkFile(filePath);
    }
  });
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  // Search for the specific unique book title from your snippet
  const index = content.indexOf('Little Schemer');

  if (index !== -1) {
    console.log(`\n🎯 \x1b[1mFOUND IT IN: ${filePath}\x1b[0m`);

    // Grab the 100 characters BEFORE the match to see the tag structure
    const start = Math.max(0, index - 100);
    const snippet = content.substring(start, index + 20);

    console.log('--- RAW CONTENT SNIPPET ---');
    console.log(JSON.stringify(snippet));
    console.log('---------------------------');
    console.log("Only looking for <pre lang=\"xml\">? " + /<pre lang="xml">/.test(content));
  }
}

console.log("🕵️‍♀️ Hunting for 'The Little Schemer'...");
walk(ROOT_DIR);
