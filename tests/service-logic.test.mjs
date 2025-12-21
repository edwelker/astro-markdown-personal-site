import { describe, it, expect } from 'vitest';
import { transformTraktData } from '../scripts/trakt-logic.mjs';
import { transformMusicData } from '../scripts/music-logic.mjs';
import { transformStravaData } from '../scripts/cycling-logic.mjs';

describe('ETL Logic Manifest', () => {

  describe('Trakt Integrity', () => {
    it('1. Schema Enforcement: correctly maps complex nested Trakt IDs', () => {
      const mock = [{ movie: { title: 'Test', ids: { trakt: 123 } }, rating: 10 }];
      const res = transformTraktData(mock);
      // Signature is now a flat array
      expect(res[0].id).toBe(123);
    });

    it('2. Boundary Integrity: handles 1/10 and 10/10 ratings', () => {
      const mock = [{ rating: 1 }, { rating: 10 }];
      const res = transformTraktData(mock);
      expect(res[0].rating).toBe(1);
      expect(res[1].rating).toBe(10);
    });

    it('3. Hydration: ensures poster and director are never null (fallback to string)', () => {
      const mock = [{ movie: { title: 'No Data' } }];
      const res = transformTraktData(mock);
      expect(typeof res[0].poster).toBe('string');
      expect(typeof res[0].director).toBe('string');
    });
  });

  describe('Music & Strava Resiliency', () => {
    it('4. Empty State: Music returns initialized arrays on null input', () => {
      const res = transformMusicData(null);
      expect(res.week.artists).toEqual([]);
    });

    it('5. Structure Validation: Strava returns formatted strings for Year distances', () => {
      const res = transformStravaData([]);
      expect(typeof res.year.distance).toBe('string');
    });
  });

  describe('Global Safety', () => {
    it('6. Date Recency: Strava transform filters for current year', () => {
      // Note: This ride is 2020, but Strava transform is hardcoded to 2025 comparison
      const oldRide = [{ start_date: '2020-01-01T00:00:00Z', distance: 1000 }];
      const res = transformStravaData(oldRide);
      expect(res.year.distance).toBe("0");
    });
  });
});
