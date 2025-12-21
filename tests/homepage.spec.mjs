import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('Content Integrity', () => {
  test('req 1 & 2: Blog count matches filesystem', async ({ page }) => {
    // Count actual markdown/mdx files in the blog directory
    const blogDir = path.resolve('src/content/blog');
    const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));
    
    await page.goto('/blog');
    const renderedPosts = page.locator('ul li a');
    // Ensure every file on disk has a corresponding link on the /blog page
    await expect(renderedPosts).toHaveCount(files.length);
  });

  test('req 4: Highlights full count verification', async ({ page }) => {
    await page.goto('/highlights');
    const highlights = page.locator('ul li');
    // Verifying exactly 6 entries as per your request
    await expect(highlights).toHaveCount(6);
  });

  test('req 8: Media teaser count on home', async ({ page }) => {
    await page.goto('/');
    const mediaItems = page.locator('section:has-text("Recent Movies & TV") a[target="_blank"]');
    await expect(mediaItems).toHaveCount(8);
  });
});
