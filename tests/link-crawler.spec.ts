import { test, expect } from "@playwright/test";

test.describe("Site Link Integrity", () => {
  test("should have no broken internal links", async ({ page }) => {
    const seen = new Set();
    const queue = ["/"];
    const brokenLinks = [];

    while (queue.length > 0) {
      const url = queue.shift();
      if (!url || seen.has(url)) continue;
      seen.add(url);

      const response = await page.goto(url);
      if (response?.status() !== 200) {
        brokenLinks.push(`${url} (${response?.status()})`);
        continue;
      }

      const links = await page.locator('a[href^="/"]:not([href*="."])').all();
      for (const link of links) {
        const href = await link.getAttribute("href");
        const cleanHref = href?.split("#")[0].replace(/\/$/, "") || "/";
        if (cleanHref && !seen.has(cleanHref) && !queue.includes(cleanHref)) {
          queue.push(cleanHref);
        }
      }
    }

    expect(brokenLinks, `Broken links found: ${brokenLinks.join(", ")}`).toHaveLength(0);
  });
});
