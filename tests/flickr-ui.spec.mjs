import { test, expect } from '@playwright/test';

test.describe('Homepage Integrity', () => {
  test('verify movies and tv link', async ({ page }) => {
    await page.goto('/');
    const link = page.getByRole('link', { name: /movies and tv/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', '/media');
  });

  test('verify flickr presence', async ({ page }) => {
    await page.goto('/');
    const flickr = page.locator('[data-testid="flickr-section"], [data-testid="flickr-empty-marker"]');
    await expect(flickr.first()).toBeAttached();
  });
});
