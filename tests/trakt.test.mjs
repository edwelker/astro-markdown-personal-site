import { describe, it, expect } from 'vitest';
import { deduplicate, calculateDecade } from '../scripts/trakt-logic.mjs';

describe('Trakt Logic', () => {
  it('calculates decades correctly', () => {
    expect(calculateDecade(1994)).toBe(1990);
    expect(calculateDecade(2025)).toBe(2020);
  });

  it('deduplicates correctly', () => {
    const input = [
      { movie: { ids: { imdb: '1' } } },
      { movie: { ids: { imdb: '1' } } }
    ];
    expect(deduplicate(input).length).toBe(1);
  });
});
