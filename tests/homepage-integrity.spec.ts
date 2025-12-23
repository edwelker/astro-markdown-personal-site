import { test, expect } from "@playwright/test";

test.describe("Homepage Component & Data Integrity", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("visual and count integrity check", async ({ page }) => {
    try {
      // 1. Highlights
      const highlights = page.locator('[data-testid="highlights-section"] li');
      await expect(highlights).toHaveCount(4);

      // 2. Flickr Photos
      const photos = page.locator('[data-testid="flickr-section"] img');
      await expect(photos).toHaveCount(14);

      // 3. Music (6 albums, 10 artists total)
      const musicSection = page.locator('[data-testid="music-section"]');
      const albums = musicSection.locator('h5:has-text("Top Albums") + ul li');
      const artists = musicSection.locator('h5:has-text("Top Artists") + ul li');
      await expect(albums).toHaveCount(6);
      await expect(artists).toHaveCount(10);

      // 4. Cycling
      const cyclingSection = page.locator('[data-testid="cycling-section"]');
      await expect(cyclingSection.getByText(/Year to Date/i)).toBeVisible();
      const rides = cyclingSection.locator('ul li.group\\/ride');
      await expect(rides).toHaveCount(5);

      // 5. Media (Trakt)
      const mediaItems = page.locator('[data-testid="media-section"] img');
      await expect(mediaItems).toHaveCount(8);

      // 6. Blog Posts
      const posts = page.locator('[data-testid="posts-section"] li');
      await expect(posts).toHaveCount(4);

      // 7. Visual Screenshot Comparison
      await expect(page).toHaveScreenshot({ 
        fullPage: true, 
        maxDiffPixelRatio: 0.1 
      });

    } catch (error) {
      console.error("\n\x1b[31m%s\x1b[0m", "--------------------------------------------------");
      console.error("\x1b[33m%s\x1b[0m", "🚨 HOMEPAGE INTEGRITY FAILURE");
      console.error("\x1b[37m%s\x1b[0m", "Did you intentionally change the homepage layout or counts?");
      console.error("\x1b[32m%s\x1b[0m", "If YES, update the baseline with:");
      console.error("\x1b[1m%s\x1b[0m", "npx playwright test --update-snapshots");
      console.error("\x1b[31m%s\x1b[0m", "--------------------------------------------------\n");
      throw error;
    }
  });
});
