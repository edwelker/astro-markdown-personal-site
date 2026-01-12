import { describe, it, expect, vi } from 'vitest';
import { GET } from '../src/pages/rss.xml';

// Mock @astrojs/rss
vi.mock('@astrojs/rss', () => ({
  default: vi.fn().mockImplementation((args) => args),
}));

// Mock getAllActivity
vi.mock('../src/lib/activity', () => ({
  getAllActivity: vi.fn().mockResolvedValue([
    {
      type: 'blog',
      slug: 'post-1',
      data: { title: 'Post 1', date: new Date('2023-01-01'), description: 'Desc 1' },
    },
    {
      type: 'recipes',
      slug: 'recipe-1',
      data: { title: 'Recipe 1', date: new Date('2023-01-02'), description: 'Desc 2' },
    },
  ]),
}));

describe('Main RSS Feed', () => {
  it('generates RSS feed with activity items', async () => {
    const context = { site: 'https://test.com' };
    const response = await GET(context);

    expect(response.title).toBeDefined();
    expect(response.items).toHaveLength(2);

    // Check link generation logic
    const blogItem = response.items.find((i: any) => i.title === 'Post 1');
    expect(blogItem.link).toBe('/blog/post-1/');

    const recipeItem = response.items.find((i: any) => i.title === 'Recipe 1');
    expect(recipeItem.link).toBe('/recipes/recipe-1/');
  });
});
