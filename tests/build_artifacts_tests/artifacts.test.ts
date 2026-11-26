import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const distPath = path.join(process.cwd(), 'dist');
const distExists = fs.existsSync(distPath);

// Only run these tests if the build output exists
describe.skipIf(!distExists)('Build Artifact Integrity', () => {
  describe('Core SEO Artifacts', () => {
    it('should have generated a valid RSS feed', () => {
      const rssPath = path.join(distPath, 'rss.xml');
      expect(fs.existsSync(rssPath)).toBe(true);

      const content = fs.readFileSync(rssPath, 'utf-8');
      expect(content.trim().startsWith('<?xml')).toBe(true);
      expect(content).toContain('<rss');
      expect(content).toContain('<channel>');
    });

    it('should have generated the Sitemap index', () => {
      expect(fs.existsSync(path.join(distPath, 'sitemap-index.xml'))).toBe(true);
    });

    it('should have generated robots.txt with expected rules', () => {
      const robotsPath = path.join(distPath, 'robots.txt');
      expect(fs.existsSync(robotsPath)).toBe(true);
      const content = fs.readFileSync(robotsPath, 'utf-8');
      expect(content).toContain('Sitemap: https://eddiewelker.com/sitemap-index.xml');
      expect(content).toContain('Disallow: /drafts/');
      expect(content).toContain('Disallow: /dash/');
    });

    it('should not emit global X-Robots-Tag index header in _headers', () => {
      const headersPath = path.join(distPath, '_headers');
      expect(fs.existsSync(headersPath)).toBe(true);
      const content = fs.readFileSync(headersPath, 'utf-8');
      expect(content).not.toMatch(/X-Robots-Tag:\s*index/i);
    });

    it('should have valid web manifest without placeholder names', () => {
      const manifestPath = path.join(distPath, 'site.webmanifest');
      expect(fs.existsSync(manifestPath)).toBe(true);
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      expect(manifest.name).toBe('Eddie Welker');
      expect(manifest.short_name).not.toBe('MySite');
    });

    it('should have valid JSON-LD and discovery links on homepage', () => {
      const html = fs.readFileSync(path.join(distPath, 'index.html'), 'utf-8');
      expect(html).toContain('rel="manifest" href="/site.webmanifest"');
      expect(html).toContain('type="application/rss+xml"');
      expect(html).toContain('href="/rss.xml"');

      const ldBlocks = [
        ...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi),
      ];
      expect(ldBlocks.length).toBeGreaterThanOrEqual(2);
      for (const match of ldBlocks) {
        expect(() => JSON.parse(match[1])).not.toThrow();
        expect(match[1]).not.toContain('&apos;');
        expect(match[1]).not.toContain('&quot;');
      }
    });
  });

  describe('Data Routes & API Artifacts', () => {
    it('should have generated highlights.json', () => {
      const filePath = path.join(distPath, 'data', 'highlights.json');
      expect(fs.existsSync(filePath)).toBe(true);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      expect(Array.isArray(data)).toBe(true);
    });

    it('should have generated highlights.xml', () => {
      const filePath = path.join(distPath, 'highlights.xml');
      expect(fs.existsSync(filePath)).toBe(true);
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).toContain('<item'); // RSS items
    });

    it('should have generated the API documentation page', () => {
      const filePath = path.join(distPath, 'api', 'index.html');
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });

  describe('JSON Data Integrity', () => {
    it('should have valid music.json', () => {
      const filePath = path.join(distPath, 'data', 'music.json');
      expect(fs.existsSync(filePath)).toBe(true);

      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      expect(data).toHaveProperty('user');
      expect(data).toHaveProperty('week');
      expect(Object.keys(data).length).toBeGreaterThan(0);
    });


    it('should have valid plex.json', () => {
      const filePath = path.join(distPath, 'data', 'plex.json');
      expect(fs.existsSync(filePath)).toBe(true);

      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      expect(data).toHaveProperty('username');
      expect(data).toHaveProperty('allRatings');
      expect(Array.isArray(data.allRatings)).toBe(true);
      expect(data.allRatings.length).toBeGreaterThan(0);
    });

    it('should have valid cycling.json', () => {
      const filePath = path.join(distPath, 'data', 'cycling.json');
      expect(fs.existsSync(filePath)).toBe(true);

      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      expect(data).toHaveProperty('year');
      expect(data).toHaveProperty('recent');
      expect(Array.isArray(data.recent)).toBe(true);
    });

    it('should have valid flickr-photos.json', () => {
      const filePath = path.join(distPath, 'data', 'flickr-photos.json');
      expect(fs.existsSync(filePath)).toBe(true);

      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      expect(Array.isArray(data)).toBe(true);
    });

    it('should have valid gas.json', () => {
      const filePath = path.join(distPath, 'data', 'gas.json');
      expect(fs.existsSync(filePath)).toBe(true);

      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      expect(data).toHaveProperty('md');
      expect(data).toHaveProperty('ny');
      expect(data).toHaveProperty('ma');
      expect(Array.isArray(data.md)).toBe(true);
      expect(Array.isArray(data.ny)).toBe(true);
      expect(Array.isArray(data.ma)).toBe(true);
    });
  });
});
