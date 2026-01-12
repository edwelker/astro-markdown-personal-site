import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const DIST_DIR = path.join(process.cwd(), 'dist');

function getHtmlFiles(dir: string): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getHtmlFiles(filePath));
    } else if (file.endsWith('.html')) {
      results.push(filePath);
    }
  });
  return results;
}

describe('Build Assets Integrity', () => {
  // Only run this if dist exists (i.e. after build)
  if (!fs.existsSync(DIST_DIR)) {
    it.skip('dist directory not found, skipping asset checks', () => {});
    return;
  }

  const htmlFiles = getHtmlFiles(DIST_DIR);

  it('should have generated HTML files', () => {
    expect(htmlFiles.length).toBeGreaterThan(0);
  });

  htmlFiles.forEach((file) => {
    const relativePath = path.relative(DIST_DIR, file);

    it(`should reference valid assets in ${relativePath}`, () => {
      const content = fs.readFileSync(file, 'utf-8');

      // Check stylesheets
      // Matches <link ... href="..." ...>
      const linkRegex = /<link[^>]+href="([^"]+)"[^>]*>/g;
      let match;
      while ((match = linkRegex.exec(content)) !== null) {
        const tag = match[0];
        const href = match[1];

        // Only care about stylesheets
        if (!tag.includes('rel="stylesheet"')) continue;
        if (href.startsWith('http') || href.startsWith('//')) continue;

        const cleanPath = href.split('?')[0].split('#')[0];
        // Handle absolute paths (starting with /) relative to dist
        const assetPath = path.join(
          DIST_DIR,
          cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath
        );

        expect(
          fs.existsSync(assetPath),
          `Missing CSS asset: ${cleanPath} referenced in ${relativePath}`
        ).toBe(true);
      }

      // Check scripts
      // Matches <script ... src="..." ...>
      const scriptRegex = /<script[^>]+src="([^"]+)"[^>]*>/g;
      while ((match = scriptRegex.exec(content)) !== null) {
        const src = match[1];
        if (src.startsWith('http') || src.startsWith('//')) continue;

        const cleanPath = src.split('?')[0].split('#')[0];
        const assetPath = path.join(
          DIST_DIR,
          cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath
        );

        expect(
          fs.existsSync(assetPath),
          `Missing JS asset: ${cleanPath} referenced in ${relativePath}`
        ).toBe(true);
      }
    });
  });
});
