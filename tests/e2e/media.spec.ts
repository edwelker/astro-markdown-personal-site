import { test, expect } from '@playwright/test';

test.describe('Media Section & Plex Integration', () => {
  test.describe('Homepage Media Teaser', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
    });

    test('should render 8 recent watch posters with valid public image URLs', async ({ page }) => {
      const mediaSection = page.getByTestId('media-section');
      await expect(mediaSection).toBeVisible();

      const posterCards = mediaSection.locator('a[target="_blank"]');
      await expect(posterCards).toHaveCount(8);

      // Verify each card links to TMDb/IMDb and image src is a public CDN URL (no relative paths)
      const count = await posterCards.count();
      for (let i = 0; i < count; i++) {
        const card = posterCards.nth(i);
        const href = await card.getAttribute('href');
        expect(href).toMatch(/^https:\/\/(www\.)?(themoviedb\.org|imdb\.com)\//);

        const img = card.locator('img');
        await expect(img).toBeVisible();
        const src = await img.getAttribute('src');
        expect(src).toBeTruthy();
        expect(src).toMatch(/^https:\/\//);
        expect(src).not.toContain('/library/metadata/');
      }
    });

    test('should navigate to /media/ from teaser header link', async ({ page }) => {
      const fullStatsLink = page.getByTestId('media-section').locator('a[href="/media/"]');
      await expect(fullStatsLink).toBeVisible();
      await fullStatsLink.click();

      await expect(page).toHaveURL(/\/media\/?$/);
      await expect(page.getByRole('heading', { level: 1, name: 'Movies & TV' })).toBeVisible();
    });
  });

  test.describe('Full Media Page (/media/)', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/media/');
    });

    test('should display the history map with clickable decade links', async ({ page }) => {
      const historySection = page.locator('section:has-text("The History Map")');
      await expect(historySection).toBeVisible();

      // Check decade links (1930s to 2020s)
      const decadeLinks = historySection.locator('a[href^="/media/"]');
      const count = await decadeLinks.count();
      expect(count).toBeGreaterThanOrEqual(8);

      const firstDecadeHref = await decadeLinks.first().getAttribute('href');
      expect(firstDecadeHref).toMatch(/^\/media\/\d{4}\/$/);
    });

    test('should render top lists with functional TMDb search links', async ({ page }) => {
      const topGenresSection = page.locator('section:has-text("Top Genres")');
      await expect(topGenresSection).toBeVisible();

      const genreLinks = topGenresSection.locator('a[href*="themoviedb.org/search"]');
      const genreCount = await genreLinks.count();
      expect(genreCount).toBeGreaterThan(0);

      const topDirectorsSection = page.locator('section:has-text("Top Directors")');
      await expect(topDirectorsSection).toBeVisible();
    });

    test('should display Recent Watches with star ratings and valid posters', async ({ page }) => {
      const recentSection = page.locator('section:has-text("Recent Watches")');
      await expect(recentSection).toBeVisible();

      const cards = recentSection.locator('.group:has(img)');
      const count = await cards.count();
      expect(count).toBeGreaterThanOrEqual(5);

      // Verify top recent watch is one of the latest remote watches
      const firstTitle = await cards.first().locator('p.font-bold').innerText();
      expect(firstTitle).toBeTruthy();

      // Check image src on recent watches
      const firstImg = cards.first().locator('img');
      const src = await firstImg.getAttribute('src');
      expect(src).toMatch(/^https:\/\//);
      expect(src).not.toContain('/library/metadata/');
    });

    test('should navigate to a decade archive and render era movies', async ({ page }) => {
      // Click the 1980s decade link in the history graph
      const decade1980Link = page.locator('a[href="/media/1980/"]');
      await expect(decade1980Link).toBeVisible();
      await decade1980Link.click();

      await expect(page).toHaveURL(/\/media\/1980\/?$/);
      await expect(page.getByRole('heading', { level: 1, name: 'The 1980s' })).toBeVisible();

      // Check that movies from the 1980s are listed
      const movieItems = page.locator('a[target="_blank"]:has(img)');
      const movieCount = await movieItems.count();
      expect(movieCount).toBeGreaterThan(0);

      // Verify back button navigates back to /media/
      const backLink = page.getByRole('link', { name: 'Back to media' });
      await backLink.click();
      await expect(page).toHaveURL(/\/media\/?$/);
    });
  });

  test.describe('Plex Data API Endpoint', () => {
    test('should serve valid sovereign ratings JSON from /data/plex.json', async ({ request }) => {
      const response = await request.get('/data/plex.json');
      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('allRatings');
      expect(Array.isArray(data.allRatings)).toBe(true);
      expect(data.allRatings.length).toBeGreaterThanOrEqual(490);

      expect(data).toHaveProperty('sparkline');
      expect(Array.isArray(data.sparkline)).toBe(true);
      expect(data.sparkline.length).toBeGreaterThanOrEqual(8);

      expect(data).toHaveProperty('genres');
      expect(data).toHaveProperty('directors');

      // Invariant: no relative poster paths exist in the data
      const relativePosters = data.allRatings.filter(
        (r: any) => r.poster && r.poster.startsWith('/')
      );
      expect(relativePosters).toHaveLength(0);
    });
  });
});
