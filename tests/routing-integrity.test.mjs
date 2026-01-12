import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

function getFiles(dir, extensions) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(filePath, extensions));
    } else {
      if (extensions.some((ext) => file.endsWith(ext))) {
        results.push(filePath);
      }
    }
  });
  return results;
}

describe('Astro Routing & API Discovery', () => {
  const pagesDir = path.resolve(process.cwd(), 'src/pages');
  const apiPagePath = path.resolve(process.cwd(), 'src/pages/api.astro');

  it('identifies data routes and verifies documentation in api.astro', () => {
    const dataRoutes = getFiles(pagesDir, [
      '.json.ts',
      '.xml.ts',
      '.rss.js',
      '.rss.ts',
      '.json.js',
      '.xml.js',
    ]);

    const normalizedUrls = dataRoutes.map((route) => {
      return route
        .replace(pagesDir, '')
        .replace(/\.(ts|js)$/, '')
        .replace(/\\/g, '/');
    });

    // Logging the discovery results
    console.log('\n--- Data Routes Discovered ---');
    normalizedUrls.forEach((url) => console.log(`🔗 Found: ${url}`));
    console.log('------------------------------\n');

    expect(fs.existsSync(apiPagePath), 'api.astro page is missing').toBe(true);
    const apiPageSource = fs.readFileSync(apiPagePath, 'utf-8');

    normalizedUrls.forEach((url) => {
      const existsInDocs = apiPageSource.includes(url);
      expect(
        existsInDocs,
        `Route ${url} discovered in src/pages but missing from api.astro docs`
      ).toBe(true);
    });
  });
});
