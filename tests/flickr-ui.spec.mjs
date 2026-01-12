import { test, expect } from '@playwright/test';

test.describe('Homepage Integrity', () => {
  test('verify flickr presence', async ({ page }) => {
    await page.goto('/');
    const flickr = page.locator(
      '[data-testid="flickr-section"], [data-testid="flickr-empty-marker"], section:has-text("Flickr")'
    );
    await expect(flickr.first()).toBeAttached();
  });
});
