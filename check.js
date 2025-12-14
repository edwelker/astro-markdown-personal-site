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
      simulateToc(filePath);
    }
  });
}

function simulateToc(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  // This Map simulates the "parentHeadings" map in the component
  // It stores which header exists at which level (2, 3, 4...)
  const parentHeadings = new Map();
  let inCodeBlock = false;
  let inFrontmatter = false;

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed === '---') { inFrontmatter = !inFrontmatter; return; }
    if (inFrontmatter) return;
    if (trimmed.startsWith('```')) { inCodeBlock = !inCodeBlock; return; }
    if (inCodeBlock) return;

    const match = line.match(/^(#{1,6})\s+(.*)/);

    if (match) {
      const depth = match[1].length;
      const text = match[2];

      // LOGIC CHECK: This mirrors the TableOfContents.astro logic exactly

      // RULE 1: The component treats Depth 2 as the "Root".
      // If we see Depth 1 (H1), it goes to the 'else' block and crashes
      // because it looks for Depth 0.
      if (depth === 1) {
        console.log(`\n💥 \x1b[1m${filePath}\x1b[0m`);
        console.log(`   Line ${index + 1}: \x1b[31mFatal H1 detected\x1b[0m`);
        console.log(`   Reason: The theme expects the body to start at H2. H1 triggers a crash.`);
        console.log(`   Fix: Change '# ${text}' to '## ${text}'`);
        return; // Stop checking this file, we found the killer
      }

      // RULE 2: If it's H2, it's safe (Push to root).
      if (depth === 2) {
        parentHeadings.set(depth, text);
      }
      // RULE 3: If it's H3, H4, etc... it MUST have a parent.
      else {
        const parent = parentHeadings.get(depth - 1);

        if (!parent) {
          console.log(`\n💥 \x1b[1m${filePath}\x1b[0m`);
          console.log(`   Line ${index + 1}: \x1b[31mOrphan Header (H${depth})\x1b[0m`);
          console.log(`   Reason: Found H${depth} ("${text}") but no H${depth - 1} was found before it.`);
          console.log(`   Fix: Change to H${depth - 1} or ensure an H${depth - 1} exists above it.`);
        }

        // Register this header so children can find it
        parentHeadings.set(depth, text);
      }
    }
  });
}

console.log("🔍 Simulating Table of Contents crashes...");
walk(CONTENT_DIR);
