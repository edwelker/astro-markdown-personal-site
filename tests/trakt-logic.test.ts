import { describe, it, expect } from 'vitest';
import { filterRatings, getDirectorSpotlight, mapTopLists } from '../src/lib/trakt-logic';
import type { RatingItem, DirectorInfo } from '../src/components/trakt/types';

// Helper to create a mock rating item
const mockItem = (id: string, rating: number, director: string = 'Unknown'): RatingItem => ({
  id,
  title: `Movie ${id}`,
  year: 2020,
  rating,
  director,
  directorId: 123,
  href: `http://example.com/${id}`,
  poster: `img-${id}.jpg`,
});

describe('Trakt Logic', () => {
  describe('filterRatings', () => {
    const ratings = [
      mockItem('1', 10),
      mockItem('2', 9),
      mockItem('3', 8),
      mockItem('4', 7), // Mid
      mockItem('5', 6), // Mid
      mockItem('6', 5), // Low
      mockItem('7', 1), // Low
    ];

    it('segregates ratings by score', () => {
      const result = filterRatings(ratings);
      expect(result.tens).toHaveLength(1);
      expect(result.tens[0].id).toBe('1');

      expect(result.nines).toHaveLength(1);
      expect(result.nines[0].id).toBe('2');

      expect(result.eights).toHaveLength(1);
      expect(result.eights[0].id).toBe('3');
    });

    it('reverses mid and low quality lists', () => {
      const result = filterRatings(ratings);

      // Mid: 7, 6. Reversed: 6, 7 (IDs 5, 4)
      expect(result.midQuality).toHaveLength(2);
      expect(result.midQuality[0].id).toBe('5');
      expect(result.midQuality[1].id).toBe('4');

      // Low: 5, 1. Reversed: 1, 5 (IDs 7, 6)
      expect(result.lowQuality).toHaveLength(2);
      expect(result.lowQuality[0].id).toBe('7');
      expect(result.lowQuality[1].id).toBe('6');
    });

    it('slices recently rated to 10 items', () => {
      const manyRatings = Array.from({ length: 15 }, (_, i) => mockItem(String(i), 8));
      const result = filterRatings(manyRatings);
      expect(result.recentlyRated).toHaveLength(10);
      expect(result.recentlyRated[0].id).toBe('0'); // Should be original order
    });
  });

  describe('getDirectorSpotlight', () => {
    const directors: [string, DirectorInfo][] = [
      ['Nolan', { count: 5, id: 101 }],
      ['Spielberg', { count: 3, id: 102 }],
    ];

    it('selects the top director', () => {
      const ratings = [
        mockItem('1', 10, 'Nolan'),
        mockItem('2', 8, 'Nolan'),
        mockItem('3', 10, 'Spielberg'),
      ];

      const result = getDirectorSpotlight(ratings, directors);
      expect(result.topDirectorName).toBe('Nolan');
      expect(result.topDirectorId).toBe(101);
    });

    it('filters spotlight items to only include ratings >= 9', () => {
      const ratings = [
        mockItem('1', 10, 'Nolan'), // Include
        mockItem('2', 9, 'Nolan'), // Include
        mockItem('3', 8, 'Nolan'), // Exclude (< 9)
      ];

      const result = getDirectorSpotlight(ratings, directors);
      expect(result.directorSpotlight).toHaveLength(2);
      expect(result.directorSpotlight.map((r) => r.rating)).toEqual([10, 9]);
    });

    it('handles empty director lists gracefully', () => {
      const result = getDirectorSpotlight([], []);
      expect(result.topDirectorName).toBe('');
      expect(result.directorSpotlight).toHaveLength(0);
    });
  });

  describe('mapTopLists', () => {
    it('formats genres and directors correctly', () => {
      const genres: [string, number][] = [
        ['Action', 10],
        ['Drama', 5],
      ];
      const directors: [string, DirectorInfo][] = [['Nolan', { count: 5, id: 1 }]];

      const result = mapTopLists(genres, directors, 'testuser');

      expect(result.topGenres[0]).toEqual({
        label: 'Action',
        count: 10,
        href: 'https://trakt.tv/users/testuser/history/movies/added?genres=action',
      });

      expect(result.topDirectors[0]).toEqual({
        label: 'Nolan',
        count: 5,
        href: 'https://www.google.com/search?q=Nolan+director',
      });
    });
  });
});
