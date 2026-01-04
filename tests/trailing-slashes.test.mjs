import { test, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(__dirname, '../src');
const SITE_URL = 'https://eddiewelker.com';

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
      if (/\.(astro|tsx|jsx|js|ts)$/.test(file)) {
        results.push(filePath);
      }
    }
  }
  return results;
}

test('Internal links in source code should have trailing slashes', () => {
  const files = getFiles(srcDir);
  const errors = [];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    
    // Regex to capture href values in quotes
    const hrefRegex = /href\s*=\s*(["'])(.*?)\1/g;
    let match;
    
    while ((match = hrefRegex.exec(content)) !== null) {
      const url = match[2];
      
      // 1. Filter for internal links or absolute links to our site
      const isInternal = url.startsWith('/');
      const isAbsoluteSite = url.startsWith(SITE_URL);
      
      if (!isInternal && !isAbsoluteSite) continue;
      
      // 2. Ignore root, empty, or just the domain
      if (url === '/' || url === SITE_URL || url === `${SITE_URL}/`) continue;
      
      // 3. Ignore anchors (e.g. #top or /page#section)
      if (url.startsWith('#')) continue;
      
      // 4. Ignore protocol relative //
      if (url.startsWith('//')) continue;

      // Strip query params and anchors to check the path
      const urlPath = url.split(/[?#]/)[0];

      // 5. Ignore if it already ends with /
      if (urlPath.endsWith('/')) continue;
      
      // 6. Ignore files (heuristic: last segment contains a dot, e.g. style.css, image.jpg)
      const lastSegment = urlPath.split('/').pop();
      if (lastSegment && lastSegment.includes('.')) continue;

      errors.push({
        file: path.relative(process.cwd(), file),
        link: url
      });
    }
  }

  if (errors.length > 0) {
    console.error('Found links missing trailing slashes:', errors);
  }

  expect(errors).toEqual([]);
});
