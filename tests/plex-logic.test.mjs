import { describe, it, expect } from 'vitest';
import {
  extractGuids,
  normalizeTitle,
  findMatchingItem,
  getItemTimestamp,
  mergeAppendOnly,
  transformPlexData,
  transformAndAggregatePlexData,
} from '../scripts/plex-logic.mjs';

describe('Plex Logic: extractGuids', () => {
  it('extracts imdbId and tmdbId from standard Guid array', () => {
    const item = {
      Guid: [{ id: 'imdb://tt0087003' }, { id: 'tmdb://7484' }, { id: 'tvdb://1234' }],
    };
    const { imdbId, tmdbId } = extractGuids(item);
    expect(imdbId).toBe('tt0087003');
    expect(tmdbId).toBe('7484');
  });

  it('handles null, undefined, and non-array Guid objects', () => {
    expect(extractGuids(null)).toEqual({ imdbId: null, tmdbId: null });
    expect(extractGuids({})).toEqual({ imdbId: null, tmdbId: null });
    expect(extractGuids({ Guid: 'not-an-array' })).toEqual({ imdbId: null, tmdbId: null });
    expect(extractGuids({ Guid: [null, {}, { id: 'other://123' }] })).toEqual({
      imdbId: null,
      tmdbId: null,
    });
  });
});

describe('Plex Logic: normalizeTitle', () => {
  it('strips punctuation, whitespace, and lowercases titles', () => {
    expect(normalizeTitle('Se7en')).toBe('se7en');
    expect(normalizeTitle("Schitt's Creek")).toBe('schittscreek');
    expect(normalizeTitle('Star Wars: Episode VII - The Force Awakens')).toBe(
      'starwarsepisodeviitheforceawakens'
    );
    expect(normalizeTitle(null)).toBe('');
  });
});

describe('Plex Logic: findMatchingItem', () => {
  const catalog = [
    { imdbId: 'tt0114369', tmdbId: 807, title: 'Se7en', year: 1995, type: 'movie' },
    { imdbId: 'tt1833537', tmdbId: 376736, title: 'The Nutcracker', year: 2010, type: 'movie' },
    { imdbId: 'tt0903747', tmdbId: 1396, title: 'Breaking Bad', year: 2008, type: 'show' },
    { title: 'Indie Film', year: 2020, type: 'movie' },
  ];

  it('matches by imdbId even if title differs', () => {
    const match = findMatchingItem({ imdbId: 'tt0114369', title: 'Seven' }, catalog);
    expect(match?.title).toBe('Se7en');
  });

  it('matches by tmdbId', () => {
    const match = findMatchingItem({ tmdbId: 1396, title: 'Unknown' }, catalog);
    expect(match?.title).toBe('Breaking Bad');
  });

  it('matches by normalized title and year', () => {
    const match = findMatchingItem({ title: 'Indie Film', year: 2020, type: 'movie' }, catalog);
    expect(match?.title).toBe('Indie Film');
  });

  it('matches with +/- 1 year tolerance for exact titles', () => {
    const match = findMatchingItem({ title: 'Indie Film', year: 2021, type: 'movie' }, catalog);
    expect(match?.title).toBe('Indie Film');
  });

  it('returns null for unmatched items or invalid input', () => {
    expect(findMatchingItem({ title: 'Nonexistent', year: 1999 }, catalog)).toBeNull();
    expect(findMatchingItem(null, catalog)).toBeNull();
    expect(findMatchingItem({ title: 'A' }, null)).toBeNull();
  });
});

describe('Plex Logic: getItemTimestamp', () => {
  it('parses date string', () => {
    const t = getItemTimestamp({ date: '2026-10-13T00:30:00.000Z' });
    expect(t).toBe(new Date('2026-10-13T00:30:00.000Z').getTime());
  });

  it('parses unix timestamp in seconds for lastRatedAt', () => {
    const sec = 1766369509;
    const t = getItemTimestamp({ lastRatedAt: sec });
    expect(t).toBe(sec * 1000);
  });

  it('falls back to 0 for missing or invalid dates', () => {
    expect(getItemTimestamp({})).toBe(0);
    expect(getItemTimestamp({ date: 'invalid-date' })).toBe(0);
  });
});

describe('Plex Logic: mergeAppendOnly (Sovereign Invariant)', () => {
  it('appends new items and NEVER deletes existing archive items', () => {
    const archive = [
      { id: 1, title: 'Preserved Historical Film', year: 1950, rating: 10, type: 'movie' },
    ];
    const incoming = [
      { id: 2, title: 'Brand New Watch', year: 2026, rating: 8, type: 'movie', date: '2026-10-13T00:00:00.000Z' },
    ];

    const result = mergeAppendOnly(archive, incoming);
    expect(result).toHaveLength(2);
    // Preserved item remains intact
    expect(result.find((r) => r.title === 'Preserved Historical Film')).toBeDefined();
    // New item added
    expect(result.find((r) => r.title === 'Brand New Watch')).toBeDefined();
  });

  it('updates rating and fills metadata when item matches', () => {
    const archive = [
      {
        id: 1,
        imdbId: 'tt12345',
        title: 'Original Title',
        year: 2020,
        rating: 6,
        type: 'movie',
        poster: '',
        director: 'Unknown',
      },
    ];
    const incoming = [
      {
        imdbId: 'tt12345',
        title: 'Original Title',
        year: 2020,
        rating: 9,
        type: 'movie',
        poster: 'https://example.com/poster.jpg',
        director: 'Famous Director',
        genres: ['Horror'],
        date: '2026-10-13T00:00:00.000Z',
      },
    ];

    const result = mergeAppendOnly(archive, incoming);
    expect(result).toHaveLength(1);
    expect(result[0].rating).toBe(9);
    expect(result[0].poster).toBe('https://example.com/poster.jpg');
    expect(result[0].director).toBe('Famous Director');
    expect(result[0].genres).toEqual(['Horror']);
    expect(result[0].date).toBe('2026-10-13T00:00:00.000Z');
  });

  it('correctly updates rating and date when an undated historical title (e.g. Wild Strawberries) is re-rated in Plex', () => {
    const archive = [
      {
        id: 490,
        imdbId: 'tt0050986',
        title: 'Wild Strawberries',
        year: 1957,
        rating: 10,
        type: 'movie',
        poster: 'https://image.tmdb.org/t/p/w500/iyTD2QnySNMPUPE3IedZQipSWfz.jpg',
        director: 'Ingmar Bergman',
      },
    ];
    const reRatedInPlex = [
      {
        id: 'plex-discover-uuid-999',
        imdbId: 'tt0050986',
        title: 'Wild Strawberries',
        year: 1957,
        rating: 9,
        type: 'movie',
        date: '2026-10-13T12:00:00.000Z',
      },
    ];

    const result = mergeAppendOnly(archive, reRatedInPlex);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('plex-discover-uuid-999');
    expect(result[0].rating).toBe(9);
    expect(result[0].date).toBe('2026-10-13T12:00:00.000Z');
    expect(result[0].director).toBe('Ingmar Bergman');
    expect(result[0].poster).toBe('https://image.tmdb.org/t/p/w500/iyTD2QnySNMPUPE3IedZQipSWfz.jpg');
  });

  it('sorts newest items first and stably preserves historical items without dates', () => {
    const archive = [
      { id: 'old1', title: 'Old 1', year: 1980, rating: 8, type: 'movie' },
      { id: 'old2', title: 'Old 2', year: 1985, rating: 7, type: 'movie' },
    ];
    const incoming = [
      { id: 'new1', title: 'New 1', year: 2026, rating: 9, type: 'movie', date: '2026-10-13T00:00:00.000Z' },
    ];

    const result = mergeAppendOnly(archive, incoming);
    expect(result[0].id).toBe('new1');
    expect(result[1].id).toBe('old1');
    expect(result[2].id).toBe('old2');
  });
});

describe('Plex Logic: transformPlexData', () => {
  it('returns empty array for empty or invalid input', () => {
    expect(transformPlexData([])).toEqual([]);
    expect(transformPlexData(null)).toEqual([]);
    expect(transformPlexData(undefined)).toEqual([]);
    expect(transformPlexData('invalid')).toEqual([]);
  });

  it('correctly maps movie with tmdbId', () => {
    const mock = [
      {
        ratingKey: '1001',
        title: 'Inception',
        year: 2010,
        userRating: 9.0,
        type: 'movie',
        Guid: [{ id: 'tmdb://27205' }, { id: 'imdb://tt1375666' }],
        poster: 'https://image.tmdb.org/t/p/w500/inception.jpg',
        director: 'Christopher Nolan',
      },
    ];

    const res = transformPlexData(mock);
    expect(res).toHaveLength(1);
    expect(res[0]).toEqual({
      id: '1001',
      imdbId: 'tt1375666',
      tmdbId: '27205',
      title: 'Inception',
      year: 2010,
      rating: 9,
      type: 'movie',
      href: 'https://www.themoviedb.org/movie/27205',
      poster: 'https://image.tmdb.org/t/p/w500/inception.jpg',
      director: 'Christopher Nolan',
      genres: [],
      date: undefined,
    });
  });

  it('correctly maps show with imdbId only and parses originallyAvailableAt', () => {
    const mock = [
      {
        id: '2002',
        title: 'Breaking Bad',
        originallyAvailableAt: '2008-01-20',
        rating: 10,
        type: 'show',
        Guid: [{ id: 'imdb://tt0903747' }],
      },
    ];

    const res = transformPlexData(mock);
    expect(res).toHaveLength(1);
    expect(res[0]).toEqual({
      id: '2002',
      imdbId: 'tt0903747',
      tmdbId: null,
      title: 'Breaking Bad',
      year: 2008,
      rating: 10,
      type: 'show',
      href: 'https://www.imdb.com/title/tt0903747/',
      poster: '',
      director: 'Unknown',
      genres: [],
      date: undefined,
    });
  });

  it('handles item with pre-existing href and no external ids', () => {
    const mock = [
      {
        id: '3003',
        title: 'Local Indie',
        year: 2022,
        href: 'https://custom-link.com/movie',
      },
      {
        id: '3004',
        title: 'No Link Indie',
        year: 2023,
      },
    ];

    const res = transformPlexData(mock);
    expect(res[0].href).toBe('https://custom-link.com/movie');
    expect(res[1].href).toBe('');
    expect(res[1].rating).toBe(0);
  });
});

describe('Plex Logic: transformAndAggregatePlexData', () => {
  it('handles empty or missing input', () => {
    const result = transformAndAggregatePlexData([], { username: 'testuser' });
    expect(result.username).toBe('testuser');
    expect(result.allRatings).toEqual([]);
    expect(result.genres).toEqual([]);
    expect(result.directors).toEqual([]);
    expect(result.sparkline).toEqual([]);
    expect(result.lastUpdated).toBeDefined();

    const defResult = transformAndAggregatePlexData(null);
    expect(defResult.username).toBe('ewelker');
    expect(defResult.allRatings).toEqual([]);
  });

  it('aggregates decades, genres, and directors correctly', () => {
    const mock = [
      {
        ratingKey: '1',
        title: 'Movie 80s',
        year: 1984,
        userRating: 8,
        type: 'movie',
        director: 'Director A',
        Genre: [{ tag: 'Comedy' }, { tag: 'Drama' }],
      },
      {
        ratingKey: '2',
        title: 'Movie 80s Two',
        year: 1989,
        rating: 10,
        type: 'movie',
        director: 'Director A',
        genres: ['comedy', 'action'],
      },
      {
        ratingKey: '3',
        title: 'Movie 90s',
        originallyAvailableAt: '1995-05-10',
        userRating: 6,
        type: 'movie',
        director: 'Unknown',
        Genre: ['Horror'],
      },
      {
        ratingKey: '4',
        title: 'Movie Director B',
        year: 2005,
        rating: 8,
        type: 'movie',
        director: 'Director B',
      },
    ];

    const result = transformAndAggregatePlexData(mock, { username: 'eddie' });
    expect(result.username).toBe('eddie');
    expect(result.allRatings).toHaveLength(4);

    expect(result.directors).toEqual([
      ['Director A', 2],
      ['Director B', 1],
    ]);

    expect(result.genres).toEqual(
      expect.arrayContaining([
        ['comedy', 2],
        ['drama', 1],
        ['action', 1],
        ['horror', 1],
      ])
    );

    expect(result.sparkline).toEqual([
      { decade: 1980, score: '9.00', volume: 2 },
      { decade: 1990, score: '6.00', volume: 1 },
      { decade: 2000, score: '8.00', volume: 1 },
    ]);
  });
});
