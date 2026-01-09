import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';

// Mock astro:content
vi.mock('astro:content', () => ({
  defineCollection: (config: any) => ({ ...config, _mocked: true }),
  z: z
}));

import { collections } from '../src/content.config';

describe('Content Configuration', () => {
  it('exports collections object', () => {
    expect(collections).toBeDefined();
    expect(typeof collections).toBe('object');
  });

  it('defines blog collection', () => {
    expect(collections.blog).toBeDefined();
    expect(collections.blog.type).toBe('content');
    expect(collections.blog.schema).toBeDefined();
  });

  it('defines recipes collection', () => {
    expect(collections.recipes).toBeDefined();
    expect(collections.recipes.type).toBe('content');
    expect(collections.recipes.schema).toBeDefined();
  });
});
