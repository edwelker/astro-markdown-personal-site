import { describe, it, expect } from 'vitest';
import data from '../src/data/trakt.json';

describe('Trakt Final Output Validation', () => {
  it('checks that allRatings is a flat Array (Fixes UI Bigness)', () => {
    // If this fails, your fetcher is nesting { allRatings: { allRatings: [] } }
    expect(Array.isArray(data.allRatings)).toBe(true);
    expect(data.allRatings[0]).toHaveProperty('title');
  });
});
