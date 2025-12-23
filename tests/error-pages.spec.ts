import { test, expect } from "@playwright/test";

test.describe("404 Page Integrity", () => {
  test("should show custom 404 page for non-existent routes", async ({ page }) => {
    await page.goto("/this-page-does-not-exist-at-all");
    
    // Check heading
    const heading = page.locator('h4').filter({ hasText: /404/ });
    await expect(heading).toBeVisible();
    
    // Select only the "Go to home page" link to avoid header link conflict
    const homeButton = page.getByRole('link', { name: 'Go to home page' });
    await expect(homeButton).toBeVisible();
    await expect(homeButton).toHaveAttribute('href', '/');
  });
});
