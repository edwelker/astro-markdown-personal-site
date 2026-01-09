import { describe, it, expect } from 'vitest';
import data from '../src/data/cache/trakt.json';

describe('Trakt Final Output Validation', () => {
  it('checks that allRatings is a flat Array (Fixes UI Bigness)', () => {
    // If this fails, your fetcher is nesting { allRatings: { allRatings: [] } }
    expect(Array.isArray(data.allRatings)).toBe(true);
    if (data.allRatings.length > 0) {
      expect(data.allRatings[0]).toHaveProperty('title');
    }
  });
});
