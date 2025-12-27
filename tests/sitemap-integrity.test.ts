import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const distDir = path.join(process.cwd(), 'dist');
const distExists = fs.existsSync(distDir);

describe.skipIf(!distExists)('Sitemap Integrity', () => {
  it('should verify all sitemap URLs exist as files', () => {
    // Find sitemap files
    let sitemapFiles: string[] = [];
    
    if (fs.existsSync(distDir)) {
      sitemapFiles = fs.readdirSync(distDir)
        .filter(f => f.startsWith('sitemap-') && f.endsWith('.xml') && f !== 'sitemap-index.xml')
        .map(f => path.join(distDir, f));
    }

    // Fallback for simple sitemap
    if (sitemapFiles.length === 0 && fs.existsSync(path.join(distDir, 'sitemap.xml'))) {
      sitemapFiles.push(path.join(distDir, 'sitemap.xml'));
    }

    expect(sitemapFiles.length, 'No sitemap files found in dist').toBeGreaterThan(0);

    const urls: string[] = [];
    for (const file of sitemapFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const matches = content.match(/<loc>(.*?)<\/loc>/g);
      if (matches) {
        urls.push(...matches.map(m => m.replace(/<\/?loc>/g, '')));
      }
    }

    expect(urls.length, 'Sitemap should contain URLs').toBeGreaterThan(0);

    urls.forEach(url => {
      const urlObj = new URL(url);
      const pathname = decodeURIComponent(urlObj.pathname);
      
      // Construct expected file path
      // Astro default: /foo/ -> dist/foo/index.html
      // File output: /foo.html -> dist/foo.html
      
      let possiblePaths: string[] = [];
      
      if (pathname === '/' || pathname === '') {
        possiblePaths.push(path.join(distDir, 'index.html'));
      } else if (pathname.endsWith('/')) {
        possiblePaths.push(path.join(distDir, pathname, 'index.html'));
      } else if (path.extname(pathname)) {
        // Has extension (e.g. .png, .xml), direct map
        possiblePaths.push(path.join(distDir, pathname));
      } else {
        // No extension, no trailing slash. Could be /foo -> /foo/index.html or /foo.html
        possiblePaths.push(path.join(distDir, pathname, 'index.html'));
        possiblePaths.push(path.join(distDir, `${pathname}.html`));
      }

      const exists = possiblePaths.some(p => fs.existsSync(p));
      
      expect(exists, `Route ${pathname} (from ${url}) should exist on disk. Checked: ${possiblePaths.join(', ')}`).toBe(true);
    });
  });
});
