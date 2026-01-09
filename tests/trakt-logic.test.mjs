import { describe, it, expect } from 'vitest';
import { transformTraktData } from '../scripts/trakt-logic.mjs';

describe('Trakt Logic: transformTraktData', () => {
  it('should return an empty array for empty or invalid input', () => {
    expect(transformTraktData([])).toEqual([]);
    expect(transformTraktData(null)).toEqual([]);
    expect(transformTraktData(undefined)).toEqual([]);
  });

  it('should correctly transform a list of Trakt ratings', () => {
    const mockRatings = [
      {
        rating: 9,
        movie: {
          title: 'The Matrix',
          year: 1999,
          ids: { trakt: 1, imdb: 'tt0133093', slug: 'the-matrix-1999' },
        },
        poster: 'poster1.jpg',
        director: 'Wachowskis'
      },
      {
        rating: 10,
        show: {
          title: 'Breaking Bad',
          year: 2008,
          ids: { trakt: 2, imdb: 'tt0903747', slug: 'breaking-bad-2008' },
        },
        poster: 'poster2.jpg',
        director: 'Vince Gilligan'
      },
      // Item with missing optional data
      {
        rating: 8,
        movie: {
          title: 'Indie Film',
          year: 2021,
          ids: { trakt: 3, imdb: 'tt1234567' },
        }
      }
    ];

    const result = transformTraktData(mockRatings);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({
      id: 1,
      imdbId: 'tt0133093',
      title: 'The Matrix',
      year: 1999,
      rating: 9,
      type: 'movie',
      href: 'https://trakt.tv/movies/the-matrix-1999',
      poster: 'poster1.jpg',
      director: 'Wachowskis'
    });
    expect(result[1]).toEqual({
      id: 2,
      imdbId: 'tt0903747',
      title: 'Breaking Bad',
      year: 2008,
      rating: 10,
      type: 'show',
      href: 'https://trakt.tv/shows/breaking-bad-2008',
      poster: 'poster2.jpg',
      director: 'Vince Gilligan'
    });
    expect(result[2]).toEqual({
      id: 3,
      imdbId: 'tt1234567',
      title: 'Indie Film',
      year: 2021,
      rating: 8,
      type: 'movie',
      href: 'https://trakt.tv/movies/',
      poster: '',
      director: 'Unknown'
    });
  });
});
