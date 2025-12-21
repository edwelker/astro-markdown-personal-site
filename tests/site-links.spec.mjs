import { test, expect } from '@playwright/test';

test.describe('Global Site Integrity', () => {
  const pages = ['/', '/media', '/blog', '/about'];

  for (const path of pages) {
    test(`check page: ${path}`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response.status()).toBe(200);

      // Check for broken images
      const images = await page.locator('img').all();
      for (const img of images) {
        const src = await img.getAttribute('src');
        if (src && !src.startsWith('http')) {
          const imgRes = await page.request.get(src);
          expect(imgRes.status(), `Broken image: ${src}`).toBe(200);
        }
      }
    });
  }
});
