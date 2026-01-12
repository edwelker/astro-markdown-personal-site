import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

describe('Recipe Routing', () => {
  const recipesDir = path.join(process.cwd(), 'src/content/recipes');

  it('should load recipes from the collection', () => {
    const files = fs.readdirSync(recipesDir).filter((f) => f.endsWith('.md'));
    const validRecipes = files
      .map((filename) => {
        const content = fs.readFileSync(path.join(recipesDir, filename), 'utf-8');
        const { data } = matter(content);
        return {
          slug: filename.replace(/\.md$/, ''),
          data,
        };
      })
      .filter((r) => !r.data.draft);

    expect(validRecipes.length).toBeGreaterThan(0);

    const slugs = validRecipes.map((r) => r.slug);
    expect(slugs).toContain('szechuan-noodles');
    expect(slugs).toContain('onion-dill-rice');

    // Verify URL construction logic matches what we expect in components
    validRecipes.forEach((r) => {
      const url = `/recipes/${r.slug}/`;
      expect(url).not.toContain('undefined');
    });
  });

  it('should have valid dates for sorting', () => {
    const filename = 'szechuan-noodles.md';
    const content = fs.readFileSync(path.join(recipesDir, filename), 'utf-8');
    const { data } = matter(content);

    const date = new Date(data.date);

    expect(date).toBeInstanceOf(Date);
    expect(Number.isNaN(date.valueOf())).toBe(false);
  });
});
