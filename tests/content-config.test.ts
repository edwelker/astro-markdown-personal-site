import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';

// Mock astro:content
vi.mock('astro:content', () => ({
  defineCollection: (config: any) => ({ ...config, _mocked: true }),
  z: z,
}));

vi.mock('astro/loaders', () => ({
  glob: (opts: any) => ({ name: 'glob-loader', ...opts }),
}));

import { collections } from '../src/content.config';

describe('Content Configuration', () => {
  it('exports collections object', () => {
    expect(collections).toBeDefined();
    expect(typeof collections).toBe('object');
  });

  it('defines blog collection', () => {
    expect(collections.blog).toBeDefined();
    expect(collections.blog.loader).toBeDefined();
    expect(collections.blog.schema).toBeDefined();
  });

  it('defines recipes collection', () => {
    expect(collections.recipes).toBeDefined();
    expect(collections.recipes.loader).toBeDefined();
    expect(collections.recipes.schema).toBeDefined();
  });
});
