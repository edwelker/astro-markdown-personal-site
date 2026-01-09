import { describe, it, expect, vi } from 'vitest';
import { GET } from '../src/pages/highlights.xml';
import { highlights } from '../src/data/highlights';

// Mock @astrojs/rss to return the config object instead of a Response
vi.mock('@astrojs/rss', () => ({
    default: vi.fn().mockImplementation((args) => args),
}));

describe('Highlights RSS Feed', () => {
    it('generates RSS feed with sorted highlights', async () => {
        const context = { site: 'https://test.com' };
        const response = await GET(context);

        expect(response.title).toContain('Highlights');
        expect(response.site).toBe('https://test.com');
        expect(response.items).toHaveLength(highlights.length);

        // Check sorting (descending date)
        const dates = response.items.map((i: any) => i.pubDate.valueOf());
        const sortedDates = [...dates].sort((a, b) => b - a);
        expect(dates).toEqual(sortedDates);
    });

    it('uses default site if context.site is missing', async () => {
        const context = {};
        const response = await GET(context);
        expect(response.site).toBe('https://eddiewelker.com');
    });
});
