import { describe, it, expect } from 'vitest';
import fs from 'fs/promises';
import path from 'path';

describe('Sports Page Link Integrity', () => {
  it('should not use decodeHtmlEntities on link href attributes in the news lists', async () => {
    const filePath = path.resolve(process.cwd(), 'src/pages/sports.astro');
    const content = await fs.readFile(filePath, 'utf-8');

    // This test is a safeguard against re-introducing a bug where URLs in the news feeds
    // were being incorrectly processed, breaking the links.
    // It checks that `item.link` is used directly in the `href`.
    const badUsageRegex = /<a href=\{decodeHtmlEntities\(item\.link\)\}/g;
    const occurrences = content.match(badUsageRegex);

    expect(
      occurrences,
      'Found `decodeHtmlEntities(item.link)` in an `href` attribute in sports.astro. ' +
        'This can break URLs. Please use `item.link` directly.'
    ).toBeNull();
  });
});
