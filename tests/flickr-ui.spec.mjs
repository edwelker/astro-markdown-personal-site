import { test, expect } from '@playwright/test';

test.describe('Flickr Gallery Placement', () => {
  test('should find the flickr gallery on the homepage', async ({ page }) => {
    // Arrange: Flickr is now back on index
    await page.goto('/');

    // Act
    const section = page.getByTestId('flickr-section');
    const marker = page.getByTestId('flickr-empty-marker');

    // Assert
    const sectionCount = await section.count();
    const markerCount = await marker.count();

    if (sectionCount > 0) {
      await expect(section).toBeVisible();
    } else if (markerCount > 0) {
      await expect(marker).toBeAttached();
    } else {
      throw new Error('Flickr component not found on homepage.');
    }
  });

  test('should find the renamed movies and tv link', async ({ page }) => {
    // Arrange
    await page.goto('/');

    // Act
    const link = page.getByRole('link', { name: 'movies and tv' });

    // Assert
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', '/media');
  });
});
