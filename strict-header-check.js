import fs from 'fs';
import path from 'path';

const CONTENT_DIR = './src/content';

function walk(dir) {
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
  const lines = content.split('\n');

  // We assume the Page Title (in frontmatter) acts as H1.
  // So the "context" starts at Level 1.
  let lastLevel = 1;
  let inCodeBlock = false;
  let inFrontmatter = false;

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // 1. Ignore Frontmatter (--- to ---)
    if (trimmed === '---') {
      inFrontmatter = !inFrontmatter;
      return;
    }
    if (inFrontmatter) return;

    // 2. Ignore Code Blocks (``` to ```)
    if (trimmed.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      return;
    }
    if (inCodeBlock) return;

    // 3. Detect Headers
    // Matches: # Header, ## Header, etc.
    const match = line.match(/^(#{1,6})\s+(.*)/);

    if (match) {
      const currentLevel = match[1].length;
      const headerText = match[2];

      // THE RULE: You can only step down 1 level at a time.
      // Valid: H2 -> H3 (2 -> 3)
      // Valid: H3 -> H2 (3 -> 2)
      // Valid: H2 -> H2 (2 -> 2)
      // INVALID: H2 -> H4 (Step of 2 is illegal)
      // INVALID: Start -> H3 (Since we start at 1, 3 is illegal)

      if (currentLevel > lastLevel + 1) {
        console.log(`\n❌ \x1b[1m${filePath}\x1b[0m`);
        console.log(`   Line ${index + 1}: \x1b[31mInvalid Jump (H${lastLevel} -> H${currentLevel})\x1b[0m`);
        console.log(`   Content: "${headerText}"`);
        console.log(`   \x1b[33mFix: Change this to H${lastLevel + 1} (match parent) or add an intermediate H${currentLevel - 1}.\x1b[0m`);
      }

      // Update tracking
      lastLevel = currentLevel;
    }
  });
}

console.log("🔍 Scanning for broken header hierarchy...");
walk(CONTENT_DIR);
console.log("Done.");
