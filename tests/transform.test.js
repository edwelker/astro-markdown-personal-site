import { describe, it, expect, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { transformMusicData } from '../scripts/music-logic.mjs';
import { transformStravaData } from '../scripts/cycling-logic.mjs';
import { transformFlickrData } from '../scripts/flickr-logic.mjs';
import { transformPlexData } from '../scripts/plex-logic.mjs';

const getData = (filename) => {
  const fullPath = path.resolve(`./src/data/${filename}`);
  if (!fs.existsSync(fullPath)) return null;
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
};

describe('Data Transformation Logic', () => {
  describe('Transformation Unit Tests', () => {
    it('Cycling: converts metric to imperial correctly', () => {
      vi.useFakeTimers().setSystemTime(new Date('2025-12-23'));
      const mock = [
        {
          sport_type: 'Ride',
          start_date: '2025-12-01',
          distance: 16093.4,
          total_elevation_gain: 304.8,
          visibility: 'public',
        },
      ];
      const res = transformStravaData(mock);
      expect(res.year.distance).toBe('10.0');
      expect(res.year.elevation).toBe('1,000');
      vi.useRealTimers();
    });

    it('Cycling: falls back to previous month if current month has 0 distance', () => {
      // Set date to Jan 1st, 2026
      vi.useFakeTimers().setSystemTime(new Date('2026-01-01T12:00:00Z'));

      const mock = [
        // Ride in Dec 2025
        {
          sport_type: 'Ride',
          start_date: '2025-12-15T12:00:00Z',
          distance: 16093.4,
          total_elevation_gain: 100,
          visibility: 'public',
        },
      ];

      const res = transformStravaData(mock);

      // Year stats (2026) should be 0
      expect(res.year.distance).toBe('0.0');

      // Month stats should show December (fallback)
      expect(res.month.name).toBe('December');
      expect(res.month.distance).toBe('10.0'); // 10 miles from Dec ride

      vi.useRealTimers();
    });

    it('Flickr: validates aspect ratio calculation', () => {
      const mock = { photos: { photo: [{ width_m: '1000', height_m: '500', id: '1' }] } };
      const res = transformFlickrData(mock);
      expect(res[0].aspect).toBe(2);
      expect(res[0].isLandscape).toBe(true);
    });

    it('Music: parses playcounts from strings', () => {
      const res = transformMusicData({ user: { playcount: '500' } });
      expect(res.user.scrobbles).toBe(500);
    });

    it('Plex: unifies schema for movies and shows', () => {
      const mock = [{ ratingKey: '1', title: 'A', Guid: [{ id: 'tmdb://123' }], userRating: 10 }];
      const res = transformPlexData(mock);
      expect(res[0].type).toBe('movie');
      expect(res[0].href).toContain('themoviedb.org/movie/123');
    });
  });

  describe('Fetched Data Schema Validation', () => {
    const cycling = getData('cycling.json');
    const flickr = getData('flickr-photos.json');
    const music = getData('music.json');
    const plex = getData('plex.json');

    it('validates cycling data if present', () => {
      if (!cycling) return console.warn('Skipping: cycling.json not found');
      expect(cycling).toHaveProperty('year');
      expect(Array.isArray(cycling.chart)).toBe(true);
    });

    it('validates flickr data if present', () => {
      if (!flickr) return console.warn('Skipping: flickr-photos.json not found');
      expect(Array.isArray(flickr)).toBe(true);
      if (flickr.length > 0) {
        expect(flickr[0]).toHaveProperty('isPortrait');
      }
    });

    it('validates music data if present', () => {
      if (!music) return console.warn('Skipping: music.json not found');
      expect(music.user.scrobbles).toBeGreaterThan(0);
    });

    it('validates plex data if present', () => {
      if (!plex) return console.warn('Skipping: plex.json not found');
      expect(Array.isArray(plex.allRatings)).toBe(true);
      if (plex.allRatings.length > 0) {
        expect(plex.allRatings[0]).toHaveProperty('imdbId');
      }
    });
  });
});
