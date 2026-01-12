import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAllActivity } from '../src/lib/activity';
import { getCollection } from 'astro:content';

// Mock the virtual module astro:content
vi.mock('astro:content', () => ({
  getCollection: vi.fn(),
}));

describe('getAllActivity', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('aggregates, sorts, and filters content from collections', async () => {
    // Setup mock data
    const blogData = [
      { data: { date: new Date('2023-01-01'), draft: false }, slug: 'post-1' },
      { data: { date: new Date('2023-01-02'), draft: true }, slug: 'draft-post' }, // Should be filtered out
    ];
    const recipeData = [{ data: { date: new Date('2023-02-01'), draft: false }, slug: 'recipe-1' }];
    const photoData = [{ data: { date: new Date('2023-03-01'), draft: false }, slug: 'photo-1' }];

    // Mock implementation that respects the filter callback passed by the implementation
    (getCollection as any).mockImplementation(
      async (name: string, filter: (item: any) => boolean) => {
        let items: any[] = [];
        if (name === 'blog') items = blogData;
        if (name === 'recipes') items = recipeData;
        if (name === 'photos') items = photoData;

        if (filter) {
          return items.filter(filter);
        }
        return items;
      }
    );

    const result = await getAllActivity();

    // Expect 3 items (draft filtered out)
    expect(result).toHaveLength(3);

    // Verify sorting (descending by date) and type assignment
    // 1. Photo (March)
    expect(result[0]).toMatchObject({ type: 'photos', slug: 'photo-1' });
    // 2. Recipe (Feb)
    expect(result[1]).toMatchObject({ type: 'recipes', slug: 'recipe-1' });
    // 3. Blog (Jan)
    expect(result[2]).toMatchObject({ type: 'blog', slug: 'post-1' });
  });

  it('handles missing photos collection gracefully', async () => {
    (getCollection as any).mockImplementation(async (name: string) => {
      if (name === 'photos') throw new Error('Collection does not exist');
      return [];
    });

    const result = await getAllActivity();

    // Should return empty array (assuming other collections return empty in this mock setup)
    expect(result).toEqual([]);
  });
});
