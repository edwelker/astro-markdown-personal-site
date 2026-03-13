import { describe, it, expect } from 'vitest';
import { collections } from '../src/content.config';

describe('Content Configuration', () => {
  it('exports collections object', () => {
    expect(collections).toBeDefined();
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

  it('defines photos collection', () => {
    expect(collections.photos).toBeDefined();
    expect(collections.photos.loader).toBeDefined();
  });
});
