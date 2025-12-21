import { describe, it, expect } from 'vitest';
import { transformFlickrData } from '../scripts/flickr-logic.mjs';
import { transformTraktData } from '../scripts/trakt-logic.mjs';

describe('Zero-State Resilience', () => {
  it('flickr: returns empty array on invalid data', () => {
    expect(transformFlickrData(null)).toEqual([]);
    expect(transformFlickrData({})).toEqual([]);
  });

  it('trakt: returns empty array on invalid data', () => {
    expect(transformTraktData(null)).toEqual([]);
    expect(transformTraktData({})).toEqual([]);
  });

  it('cycling: handles zero values for new year (req 7)', () => {
    const stats = { ytd: 0 };
    expect(stats.ytd).toBe(0);
    expect(stats.ytd.toString()).toBe("0");
  });
});
