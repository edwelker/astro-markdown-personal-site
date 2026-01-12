import { test, expect } from 'vitest';
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

test('Content files should not contain insecure HTTP links (excluding code blocks)', () => {
  const files = getFiles(contentDir);
  const errors = [];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');

    // Split by code blocks to ignore them.
    // The regex matches ```...``` including newlines.
    const parts = content.split(/```[\s\S]*?```/g);

    parts.forEach((part) => {
      const httpRegex = /http:\/\//g;
      let match;
      while ((match = httpRegex.exec(part)) !== null) {
        const start = Math.max(0, match.index - 30);
        const end = Math.min(part.length, match.index + 50);
        const context = part.substring(start, end).replace(/\n/g, ' ');

        errors.push({
          file: path.relative(process.cwd(), file),
          context: context.trim(),
        });
      }
    });
  }

  if (errors.length > 0) {
    console.error('Found insecure HTTP links:', errors);
  }

  expect(errors).toEqual([]);
});
