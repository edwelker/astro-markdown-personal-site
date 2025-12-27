import { test, expect } from '@playwright/test';

test('blog post with remote featured image renders correctly', async ({ page }) => {
  // Navigate to the specific blog post known to have a remote image
  // Based on the slug in src/content/blog/wing-contest-at-quarry-house.md
  await page.goto('/blog/2013/05/15/wing-contest-at-quarry-house');

  // Locate the featured image inside the figure
  const image = page.locator('figure.my-6 img');

  // Assert it is visible
  await expect(image).toBeVisible();

  // Assert it has the correct alt text
  await expect(image).toHaveAttribute('alt', /Cover image for Wing contest/);
});
