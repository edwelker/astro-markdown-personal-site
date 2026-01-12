import { test, expect } from '@playwright/test';

test.describe('Homepage Component & Data Integrity', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.afterEach(async ({}, testInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
      console.error('\n\x1b[31m%s\x1b[0m', '--------------------------------------------------');
      console.error('\x1b[33m%s\x1b[0m', '🚨 HOMEPAGE INTEGRITY FAILURE');
      console.error('\x1b[32m%s\x1b[0m', 'If YES, update baseline: npm run test:update');
      console.error('\x1b[31m%s\x1b[0m', '--------------------------------------------------\n');
    }
  });

  test('visual and count integrity check', async ({ page }) => {
    // 1. Blog Posts (4)
    await expect(page.locator('[data-testid="posts-section"] li')).toHaveCount(4);

    // 2. Flickr Photos (14)
    await expect(page.locator('[data-testid="flickr-section"] img')).toHaveCount(14);

    // 3. Media Teaser (Specifically target items inside the grid div)
    // This avoids picking up the "See All" link if it has a .group class
    const mediaItems = page.locator('[data-testid="media-section"] .grid a');
    await expect(mediaItems).toHaveCount(8);

    // 4. Visual Screenshot
    await expect(page).toHaveScreenshot({
      fullPage: true,
      maxDiffPixelRatio: 0.1,
    });
  });
});
