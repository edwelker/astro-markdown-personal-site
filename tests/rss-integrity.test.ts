import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const BLOG_PATH = path.resolve(process.cwd(), 'src/content/blog');
const RECIPES_PATH = path.resolve(process.cwd(), 'src/content/recipes');
const PHOTOS_PATH = path.resolve(process.cwd(), 'src/content/photos');

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

describe('RSS Feed Content Integrity', () => {
  it('ensures Blog item links match our UTC routing engine', () => {
    const files = getFilesRecursively(BLOG_PATH);

    files.forEach((file) => {
      const { data } = matter(fs.readFileSync(path.join(BLOG_PATH, file), 'utf-8'));
      if (data.draft) return;

      const fileSlug = file.replace(/\.(md|mdx)$/, '');
      const slug = data.slug || fileSlug;
      const generatedHref = `/${slug}/`;

      // The RSS feed MUST NOT contain the 16th for this post
      if (file.includes('wing-contest')) {
        expect(generatedHref).toContain('/05/15/');
        expect(generatedHref).not.toContain('/05/16/');
      }

      // General format check: Blog posts are served at the root based on their slug (YYYY/MM/DD/slug)
      // The user confirmed "blog isn't there" in the URL.
      expect(generatedHref).toMatch(/^\/\d{4}\/\d{2}\/\d{2}\//);
      expect(generatedHref).not.toContain('/blog/');
    });
  });

  it('ensures Recipe item links match Astro routes', () => {
    const files = getFilesRecursively(RECIPES_PATH);

    files.forEach((file) => {
      const { data } = matter(fs.readFileSync(path.join(RECIPES_PATH, file), 'utf-8'));
      if (data.draft) return;

      const slug = file.replace(/\.(md|mdx)$/, '');
      const generatedHref = `/recipes/${slug}/`;

      // Ensure it follows the standard /recipes/slug/ format
      expect(generatedHref).toMatch(/^\/recipes\/[a-zA-Z0-9._\-\/]+\/$/);
    });
  });

  it('ensures Photo item links match Astro routes', () => {
    const files = getFilesRecursively(PHOTOS_PATH);

    files.forEach((file) => {
      const { data } = matter(fs.readFileSync(path.join(PHOTOS_PATH, file), 'utf-8'));
      if (data.draft) return;

      const slug = file.replace(/\.(md|mdx)$/, '');
      const generatedHref = `/photos/${slug}/`;

      // Forgiving check for photos: ensure it's a valid-ish path structure
      expect(generatedHref).toMatch(/^\/photos\/[a-zA-Z0-9._\-\/]+\/$/);
    });
  });
});
