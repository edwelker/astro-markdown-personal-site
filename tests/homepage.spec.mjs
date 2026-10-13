import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

test.describe('Content Integrity', () => {
  test('Blog count matches non-draft files', async ({ page }) => {
    const blogDir = path.resolve('src/content/blog');
    function getFiles(dir) {
      let res = [];
      for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, f.name);
        if (f.isDirectory()) res.push(...getFiles(p));
        else if (f.name.endsWith('.md') || f.name.endsWith('.mdx')) res.push(p);
      }
      return res;
    }
    const files = getFiles(blogDir);

    const nonDrafts = files.filter((file) => {
      const { data } = matter(fs.readFileSync(file, 'utf-8'));
      return !data.draft;
    });

    await page.goto('/blog');
    const renderedPosts = page.locator('main ul li a, aside ul li a');
    await expect(renderedPosts).toHaveCount(nonDrafts.length);
  });

  test('Highlights full count verification', async ({ page }) => {
    await page.goto('/highlights');
    const highlights = page.locator('[data-testid="highlights-section"] .grid > div');
    await expect(highlights).toHaveCount(6);
  });

  test('Media teaser count on home', async ({ page }) => {
    await page.goto('/');
    const mediaSection = page.locator('[data-testid="media-section"]');
    const mediaItems = mediaSection.locator('a[target="_blank"]');
    await expect(mediaItems).toHaveCount(8);
  });
});
