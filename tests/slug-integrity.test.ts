import { describe, it, expect } from 'vitest';
import { getPostHref } from '../src/lib/blog';

describe('Slug Integrity', () => {
  it('should generate a URL from the post slug', () => {
    const post = {
      slug: '2023/01/01/test-post',
      data: { title: 'Test Post' },
    };
    // @ts-ignore
    expect(getPostHref(post)).toBe('/blog/2023/01/01/test-post/');
  });

  it('should fallback to data.slug if slug is missing (for legacy/test support)', () => {
    const post = {
      data: { title: 'Test Post', slug: '2023/01/01/test-post' },
    };
    // @ts-ignore
    expect(getPostHref(post)).toBe('/blog/2023/01/01/test-post/');
  });

  it('should handle string inputs (e.g. IDs passed by RSS generator)', () => {
    expect(getPostHref('some-post-id')).toBe('/blog/some-post-id/');
  });

  it('should throw if slug is completely missing in object', () => {
    const post = {
      data: { title: 'Test Post' },
    };
    // @ts-ignore
    expect(() => getPostHref(post)).toThrow('Post has no slug');
  });
});
