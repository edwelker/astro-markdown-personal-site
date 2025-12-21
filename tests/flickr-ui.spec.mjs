import { test, expect } from '@playwright/test';

test.describe('Flickr Gallery Resilience', () => {
  test('should handle data-state or empty-state', async ({ page }) => {
    // Arrange
    await page.goto('/media');

    // Act
    const section = page.getByTestId('flickr-section');
    const marker = page.getByTestId('flickr-empty-marker');

    const sectionCount = await section.count();
    const markerCount = await marker.count();

    // Assert
    if (sectionCount > 0) {
      await expect(section).toBeVisible();
    } else if (markerCount > 0) {
      await expect(marker).toBeAttached();
    } else {
      // Debugging: Get a list of all test-ids on the page
      const ids = await page.evaluate(() => 
        Array.from(document.querySelectorAll('[data-testid]')).map(el => el.getAttribute('data-testid'))
      );
      console.log('Available test-ids on page:', ids);
      throw new Error('Component missing from DOM. Is FlickrGallery.astro imported in src/pages/media.astro?');
    }
  });
});
