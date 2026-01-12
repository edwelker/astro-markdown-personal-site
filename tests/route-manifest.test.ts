import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { getPostHref } from '../src/lib/blog';

const BLOG_PATH = path.resolve(process.cwd(), 'src/content/blog');
const PUBLIC_PATH = path.resolve(process.cwd(), 'public');

function getFilesRecursively(dir: string, baseDir: string = dir): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dir)) return [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFilesRecursively(fullPath, baseDir));
    } else {
      if (file.endsWith('.md') || file.endsWith('.mdx')) {
        results.push(path.relative(baseDir, fullPath));
      }
    }
  }
  return results;
}

const files = getFilesRecursively(BLOG_PATH);

describe('Astro Master Route Manifest', () => {
  it('verifies the integrity of the entire generated routing table', () => {
    const manifest = files
      .map((file) => {
        const { data } = matter(fs.readFileSync(path.join(BLOG_PATH, file), 'utf-8'));
        if (data.draft) return null;

        const fullPath = getPostHref({ data });
        const routeParam = fullPath.replace(/^\/blog\//, '').replace(/\/$/, '');

        return {
          id: file,
          routeParam,
          fullPath,
        };
      })
      .filter(Boolean);

    const seenRoutes = new Set();

    manifest.forEach((item) => {
      // 1. Check for Duplicate Routes
      expect(
        seenRoutes.has(item.fullPath),
        `Duplicate Route: ${item.fullPath} (from ${item.id})`
      ).toBe(false);
      seenRoutes.add(item.fullPath);

      // 2. Check for Illegal Characters
      expect(item.routeParam).not.toMatch(/\s/);
      expect(item.routeParam).not.toMatch(/[A-Z]/);

      // 3. Check for Public Folder Collisions
      // If fullPath is /blog/post/, check if public/blog/post or public/blog/post.html exists
      const publicConflictPath = path.join(PUBLIC_PATH, item.fullPath);
      expect(
        fs.existsSync(publicConflictPath),
        `Route Collision: Route ${item.fullPath} shadows a physical folder in public/`
      ).toBe(false);
    });

    console.log(`✅ Route Manifest verified: ${manifest.length} unique routes with 0 collisions.`);
  });
});
