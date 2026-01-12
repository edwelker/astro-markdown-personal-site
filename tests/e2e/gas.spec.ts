import { test, expect } from '@playwright/test';

test.describe('Gas Page Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a known gas page (Maryland)
    await page.goto('/gas/md/');
  });

  test('should filter the gas table', async ({ page }) => {
    const filterInput = page.locator('#gas-filter');
    const tableRows = page.locator('#gas-table-body tr');

    // Wait for data to load
    await expect(tableRows.first()).toBeVisible();
    const initialCount = await tableRows.count();
    expect(initialCount).toBeGreaterThan(0);

    // Type a filter term. We'll grab the text of the first station to ensure a match.
    const firstStationText = await tableRows.first().locator('td').first().innerText();
    // The text format is "Station: Address", so we grab the station name.
    const searchTerm = firstStationText.split(':')[0].trim();

    await filterInput.fill(searchTerm);

    // Verify rows are filtered
    // We expect at least 1 row (the one we grabbed)
    await expect(tableRows).not.toHaveCount(0);

    // Verify the visible rows match the search
    const firstRowText = await tableRows.first().innerText();
    expect(firstRowText).toContain(searchTerm);
  });

  test('should sort the gas table', async ({ page }) => {
    const stationHeader = page.locator('th[data-sort="Station"]');

    // Initial state: check for sort arrow.
    // The page defaults to Net price sort, so Station should be neutral (↕)
    await expect(stationHeader).toContainText('↕');

    // Click to sort Ascending
    await stationHeader.click();
    await expect(stationHeader).toContainText('↑');

    // Click to sort Descending
    await stationHeader.click();
    await expect(stationHeader).toContainText('↓');
  });

  test('should calculate and display driving times', async ({ page }) => {
    // Mock Geolocation
    await page.context().grantPermissions(['geolocation']);
    await page.context().setGeolocation({ latitude: 39.0458, longitude: -76.6413 });

    // Mock the Matrix API response so we don't hit the real endpoint
    await page.route('**/api/matrix', async (route) => {
      const json = {
        durations: [[600]], // 600 seconds = 10 minutes
        distances: [[5.2]], // 5.2 miles
      };
      await route.fulfill({ json });
    });

    const calcBtn = page.locator('#sort-distance');
    await expect(calcBtn).toBeVisible();

    // Click the button
    await calcBtn.click();

    // Verify status message appears
    await expect(page.locator('#distance-status')).toBeVisible();

    // Verify the table updates with the mocked time/distance
    // The last column is the Time column
    const timeCell = page.locator('#gas-table-body tr').first().locator('td').last();

    // Expect "10m" and "(5.2mi)" based on our mock and formatting logic
    await expect(timeCell).toContainText('10m');
    await expect(timeCell).toContainText('5.2mi');
  });
});
