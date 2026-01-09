import { describe, it, expect, vi } from 'vitest';

// Mock astro:content
vi.mock('astro:content', () => ({
  defineCollection: (config: any) => ({ ...config, _mocked: true }),
  z: {
    object: vi.fn(() => ({})),
    string: vi.fn(() => ({})),
    date: vi.fn(() => ({})),
    array: vi.fn(() => ({})),
    boolean: vi.fn(() => ({})),
    number: vi.fn(() => ({})),
    enum: vi.fn(() => ({})),
    infer: vi.fn(),
  }
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
