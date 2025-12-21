import { test, expect } from '@playwright/test';

test.describe('Homepage Layout Integrity', () => {
  test('should find the flickr gallery or empty marker', async ({ page }) => {
    await page.goto('/');
    // Check for either the gallery container or the data-marker we use for empty states
    const flickr = page.locator('[data-testid="flickr-section"], [data-testid="flickr-empty-marker"]');
    await expect(flickr.first()).toBeAttached();
  });

  test('should verify the "movies and tv" link exists and points to /media', async ({ page }) => {
    await page.goto('/');
    // We use a regex /i for case-insensitive matching (handles 'movies and tv' or 'MOVIES AND TV')
    const link = page.getByRole('link', { name: /movies and tv/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', '/media');
  });
});
