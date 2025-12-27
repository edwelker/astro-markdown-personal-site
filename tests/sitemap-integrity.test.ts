import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const distDir = path.join(process.cwd(), 'dist');
const distExists = fs.existsSync(distDir);

describe.skipIf(!distExists)('Sitemap & Page Integrity', () => {
  it('should verify all sitemap URLs exist as valid HTML files', () => {
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
      
      let possiblePaths: string[] = [];
      
      if (pathname === '/' || pathname === '') {
        possiblePaths.push(path.join(distDir, 'index.html'));
      } else if (pathname.endsWith('/')) {
        possiblePaths.push(path.join(distDir, pathname, 'index.html'));
      } else if (path.extname(pathname)) {
        possiblePaths.push(path.join(distDir, pathname));
      } else {
        possiblePaths.push(path.join(distDir, pathname, 'index.html'));
        possiblePaths.push(path.join(distDir, `${pathname}.html`));
      }

      const actualPath = possiblePaths.find(p => fs.existsSync(p));
      
      // 1. Existence Check
      expect(actualPath, `Route ${pathname} (from ${url}) should exist on disk.`).toBeDefined();

      if (actualPath && actualPath.endsWith('.html')) {
        const stats = fs.statSync(actualPath);
        const content = fs.readFileSync(actualPath, 'utf-8');

        // 2. Size Check (Ensure pages aren't empty/truncated)
        expect(stats.size, `Page ${pathname} is suspiciously small (${stats.size} bytes)`).toBeGreaterThan(500);

        // 3. Content Smoke Test (Ensure basic HTML structure is present)
        // We check for doctype as a reliable indicator of an HTML build artifact.
        // We avoid checking for <title> or </html> here as some pages (like redirects 
        // or minimal archives) might have unusual head/body structures that 
        // cause false positives in simple string matching.
        expect(content, `Page ${pathname} is missing doctype`).toContain('<!DOCTYPE html>');
      }
    });
  });
});
