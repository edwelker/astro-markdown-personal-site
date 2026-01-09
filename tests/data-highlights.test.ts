import { describe, it, expect } from 'vitest';
import { highlights } from '../src/data/highlights';

describe('Highlights Data', () => {
  it('should export an array of highlights', () => {
    expect(Array.isArray(highlights)).toBe(true);
    expect(highlights.length).toBeGreaterThan(0);
  });

  it('should have valid highlight structure', () => {
    highlights.forEach((highlight) => {
      expect(highlight.title).toBeTypeOf('string');
      expect(highlight.description).toBeTypeOf('string');
      expect(highlight.url).toBeTypeOf('string');
      expect(highlight.date).toBeTypeOf('string');
      // thought is optional
      if (highlight.thought) {
        expect(highlight.thought).toBeTypeOf('string');
      }
    });
  });
});
