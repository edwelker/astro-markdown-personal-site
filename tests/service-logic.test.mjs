import { describe, it, expect } from 'vitest';
import { transformFlickrData } from '../scripts/flickr-logic.mjs';
import { transformTraktData, calculateDecade, deduplicate } from '../scripts/trakt-logic.mjs';
import { transformStravaData } from '../scripts/strava-logic.mjs';
import { transformMusicData } from '../scripts/music-logic.mjs';

describe('ETL Logic Unit Tests', () => {
  it('flickr: maps data and handles empty input', () => {
    expect(transformFlickrData(null)).toEqual([]);
    const mock = { photos: { photo: [{ id: '1', url_m: 'test.jpg' }] } };
    expect(transformFlickrData(mock)[0].id).toBe('1');
  });

  it('trakt: maps data and calculates decades/deduplication', () => {
    expect(calculateDecade(1994)).toBe(1990);
    const mock = [{ movie: { ids: { imdb: '1' } } }, { movie: { ids: { imdb: '1' } } }];
    expect(deduplicate(mock)).toHaveLength(1);
    expect(transformTraktData(null)).toEqual([]);
  });

  it('strava: handles zero-state and calculates schema correctly', () => {
    // Providing empty array to satisfy the .filter() and .reduce() logic.
    const out = transformStravaData([]);
    expect(out.year.distance).toBe("0");
    expect(out.chart).toHaveLength(52);
  });

  it('music: handles multi-endpoint data mapping', () => {
    // Music logic now expects 5 arguments: user, weekArt, weekAlb, monthArt, monthAlb.
    const out = transformMusicData(null, null, null, null, null);
    expect(out.user.scrobbles).toBe(0);
    expect(out.week.artists).toEqual([]);
    expect(out.month.albums).toEqual([]);
  });
});
