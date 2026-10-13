import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchPlexUserUuid,
  fetchPlexCloudRatings,
  fetchCloudItemMetadata,
  discoverPlexServerUri,
  fetchPlexLibrarySections,
  fetchPlexRatedItems,
  fetchPlexServerRatings,
  enrichItem,
  fetchAndEnrichPlexData,
  run,
} from '../scripts/plex-fetch.mjs';
import fs from 'node:fs/promises';
import { runETL } from '../scripts/lib-etl.mjs';

vi.mock('node:fs/promises');
vi.mock('../scripts/lib-etl.mjs', () => ({
  runETL: vi.fn(),
  mapConcurrent: vi.fn(async (items, limit, fn) => Promise.all(items.map(fn))),
  writeFile: vi.fn(),
}));

vi.mock('../scripts/lib-credentials.mjs', () => ({
  validateEnv: vi.fn(() => ({
    plexToken: 'mock-plex-token',
  })),
}));

describe('Plex Fetch Logic', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchPlexUserUuid', () => {
    it('fetches user uuid and username from plex.tv', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ uuid: 'user-uuid-123', username: 'testuser' }),
      });

      const res = await fetchPlexUserUuid({ plexToken: 'tok123' });
      expect(res).toEqual({ uuid: 'user-uuid-123', username: 'testuser' });
      expect(global.fetch).toHaveBeenCalledWith(
        'https://plex.tv/api/v2/user',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Plex-Token': 'tok123',
            'X-Plex-Client-Identifier': 'edwelker-site-fetcher',
          }),
        })
      );
    });
  });

  describe('fetchPlexCloudRatings', () => {
    it('fetches and paginates through cloud ratings', async () => {
      // Page 1
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            user: {
              ratingsV2: {
                pageInfo: { hasNextPage: true, endCursor: 'cursor1' },
                nodes: [{ rating: 8, metadataItem: { id: 'm1', title: 'Movie 1', year: 2020 } }],
              },
            },
          },
        }),
      });
      // Page 2
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            user: {
              ratingsV2: {
                pageInfo: { hasNextPage: false, endCursor: null },
                nodes: [{ rating: 9, metadataItem: { id: 'm2', title: 'Movie 2', year: 2021 } }],
              },
            },
          },
        }),
      });

      const nodes = await fetchPlexCloudRatings({ plexToken: 'tok', userUuid: 'uuid1' });
      expect(nodes).toHaveLength(2);
      expect(nodes[0].metadataItem.title).toBe('Movie 1');
      expect(nodes[1].metadataItem.title).toBe('Movie 2');
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('returns empty array if user or ratingsV2 is missing', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { user: null } }),
      });

      const nodes = await fetchPlexCloudRatings({ plexToken: 'tok', userUuid: 'uuid1' });
      expect(nodes).toEqual([]);
    });
  });

  describe('fetchCloudItemMetadata', () => {
    it('fetches item metadata from metadata.provider.plex.tv', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          MediaContainer: {
            Metadata: [{ title: 'Fetched Movie', year: 2026, thumb: 'https://thumb.jpg' }],
          },
        }),
      });

      const meta = await fetchCloudItemMetadata({ id: 'meta1', plexToken: 'tok' });
      expect(meta?.title).toBe('Fetched Movie');
      expect(meta?.thumb).toBe('https://thumb.jpg');
    });

    it('returns null on network error', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network failure'));
      const meta = await fetchCloudItemMetadata({ id: 'meta-fail', plexToken: 'tok' });
      expect(meta).toBeNull();
    });
  });

  describe('discoverPlexServerUri', () => {
    it('discovers server with https connection', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            name: 'HomeServer',
            provides: 'server',
            accessToken: 'custom-token',
            connections: [
              { protocol: 'http', uri: 'http://192.168.1.10:32400' },
              { protocol: 'https', uri: 'https://192-168-1-10.plex.direct:32400' },
            ],
          },
        ],
      });

      const result = await discoverPlexServerUri({ plexToken: 'token123' });
      expect(result.uri).toBe('https://192-168-1-10.plex.direct:32400');
      expect(result.token).toBe('custom-token');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://plex.tv/api/v2/resources?includeHttps=1&includeRelay=1',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Plex-Token': 'token123',
          }),
        })
      );
    });

    it('falls back to non-https uri and original token when accessToken is not set', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            name: 'LocalOnlyServer',
            provides: 'server',
            connections: [{ protocol: 'http', uri: 'http://localhost:32400' }],
          },
        ],
      });

      const result = await discoverPlexServerUri({ plexToken: 'original-token' });
      expect(result.uri).toBe('http://localhost:32400');
      expect(result.token).toBe('original-token');
    });

    it('throws error when no server is returned', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [{ provides: 'player' }],
      });

      await expect(discoverPlexServerUri({ plexToken: 't' })).rejects.toThrow(
        'No Plex Media Server found'
      );
    });

    it('throws error when server has no valid connections', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [{ name: 'DeadServer', provides: 'server', connections: [] }],
      });

      await expect(discoverPlexServerUri({ plexToken: 't' })).rejects.toThrow(
        'No valid connection URI found'
      );
    });
  });

  describe('fetchPlexLibrarySections', () => {
    it('fetches and filters movie and show sections', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          MediaContainer: {
            Directory: [
              { key: '1', title: 'Movies', type: 'movie' },
              { key: '2', title: 'TV Shows', type: 'show' },
              { key: '3', title: 'Music', type: 'artist' },
            ],
          },
        }),
      });

      const sections = await fetchPlexLibrarySections({
        plexUrl: 'http://localhost:32400',
        plexToken: 'tok',
      });

      expect(sections).toHaveLength(2);
      expect(sections[0].key).toBe('1');
      expect(sections[1].key).toBe('2');
    });

    it('handles single object Directory instead of array', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          MediaContainer: {
            Directory: { key: '1', title: 'Movies', type: 'movie' },
          },
        }),
      });

      const sections = await fetchPlexLibrarySections({
        plexUrl: 'http://localhost:32400',
        plexToken: 'tok',
      });

      expect(sections).toHaveLength(1);
      expect(sections[0].type).toBe('movie');
    });
  });

  describe('fetchPlexRatedItems', () => {
    it('fetches and filters rated items in section', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          MediaContainer: {
            Metadata: [
              { ratingKey: '10', title: 'Rated Movie', userRating: 8 },
              { ratingKey: '11', title: 'Unrated Movie', userRating: 0 },
              { ratingKey: '12', title: 'Missing Rating Movie' },
            ],
          },
        }),
      });

      const items = await fetchPlexRatedItems({
        plexUrl: 'http://localhost:32400',
        plexToken: 'tok',
        sectionKey: '1',
      });

      expect(items).toHaveLength(1);
      expect(items[0].ratingKey).toBe('10');
    });

    it('handles single Metadata object', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          MediaContainer: {
            Metadata: { ratingKey: '20', title: 'Single Show', userRating: 10 },
          },
        }),
      });

      const items = await fetchPlexRatedItems({
        plexUrl: 'http://localhost:32400',
        plexToken: 'tok',
        sectionKey: '2',
      });

      expect(items).toHaveLength(1);
      expect(items[0].ratingKey).toBe('20');
    });
  });

  describe('fetchPlexServerRatings', () => {
    it('fetches rated items across sections', async () => {
      // Sections call
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            MediaContainer: { Directory: [{ key: '1', type: 'movie' }] },
          }),
        })
        // Rated items call
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            MediaContainer: { Metadata: [{ title: 'PMS Movie', userRating: 8 }] },
          }),
        });

      const items = await fetchPlexServerRatings({
        plexUrl: 'http://localhost:32400',
        plexToken: 'tok',
      });
      expect(items).toHaveLength(1);
      expect(items[0].title).toBe('PMS Movie');
    });

    it('returns empty array and logs warning if server is unreachable', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      global.fetch.mockRejectedValueOnce(new Error('Connection refused'));

      const items = await fetchPlexServerRatings({
        plexUrl: 'http://localhost:32400',
        plexToken: 'tok',
      });
      expect(items).toEqual([]);
      expect(warnSpy).toHaveBeenCalled();
    });
  });

  describe('enrichItem', () => {
    it('uses cached item if available in cache Map', async () => {
      const item = {
        Guid: [{ id: 'imdb://tt12345' }],
      };
      const cache = new Map([['tt12345', { poster: 'cached-poster.jpg', director: 'Cached' }]]);

      const result = await enrichItem(item, { cache, apiKey: 'apikey' });
      expect(result.poster).toBe('cached-poster.jpg');
      expect(result.director).toBe('Cached');
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('fetches from TMDB when item is not in cache', async () => {
      const item = {
        type: 'movie',
        Guid: [{ id: 'tmdb://550' }],
        Director: [{ tag: 'Plex Director' }],
        Genre: [{ tag: 'Drama' }],
      };
      const cache = new Map();

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            poster_path: '/fight_club.jpg',
            genres: [{ name: 'Drama' }, { name: 'Thriller' }],
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            crew: [{ job: 'Director', name: 'David Fincher' }],
          }),
        });

      const result = await enrichItem(item, { cache, apiKey: 'test-key' });
      expect(result.poster).toBe('https://image.tmdb.org/t/p/w500/fight_club.jpg');
      expect(result.director).toBe('David Fincher');
      expect(result.genres).toEqual(['drama', 'thriller']);
    });

    it('gracefully falls back to Plex director/genres if TMDB fails', async () => {
      const item = {
        type: 'movie',
        Guid: [{ id: 'tmdb://99999' }],
        Director: [{ tag: 'Fallback Director' }],
        Genre: ['Horror'],
      };
      const cache = new Map();
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      global.fetch.mockRejectedValue(new Error('TMDB Network Error'));

      const result = await enrichItem(item, { cache, apiKey: 'test-key' });
      expect(result.poster).toBeNull();
      expect(result.director).toBe('Fallback Director');
      expect(result.genres).toEqual(['Horror']);
      expect(consoleWarnSpy).toHaveBeenCalled();
    });
  });

  describe('fetchAndEnrichPlexData', () => {
    it('loads archive, fetches user & cloud & pms ratings, merges append-only, and saves archive', async () => {
      // 1. Existing historical archive with 1 item
      fs.readFile.mockResolvedValueOnce(
        JSON.stringify([
          {
            id: 'legacy-1',
            title: 'Preserved Historical Film',
            year: 1960,
            rating: 10,
            type: 'movie',
            poster: 'legacy.jpg',
            director: 'Legacy Director',
          },
        ])
      );

      // 2. User info call
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ uuid: 'uuid-10', username: 'edwelker' }),
        })
        // 3. Cloud ratings GraphQL call
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: {
              user: {
                ratingsV2: {
                  pageInfo: { hasNextPage: false },
                  nodes: [
                    {
                      rating: 9,
                      date: '2026-10-13T00:00:00.000Z',
                      metadataItem: { id: 'cloud-1', title: 'Cloud New Movie', year: 2026, type: 'MOVIE' },
                    },
                  ],
                },
              },
            },
          }),
        })
        // 4. Cloud item metadata call
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            MediaContainer: {
              Metadata: [
                {
                  title: 'Cloud New Movie',
                  year: 2026,
                  thumb: 'https://cloud-poster.jpg',
                  Director: [{ tag: 'Cloud Director' }],
                  Genre: [{ tag: 'Sci-Fi' }],
                },
              ],
            },
          }),
        })
        // 5. PMS Sections call
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            MediaContainer: { Directory: [] },
          }),
        });

      fs.writeFile.mockResolvedValueOnce(undefined);

      const result = await fetchAndEnrichPlexData({
        plexServerUrl: 'http://localhost:32400',
        plexToken: 'tok',
        archivePath: 'archive.json',
      });

      // Both legacy and new cloud item must be preserved
      expect(result).toHaveLength(2);
      expect(result.find((r) => r.title === 'Preserved Historical Film')).toBeDefined();
      expect(result.find((r) => r.title === 'Cloud New Movie')).toBeDefined();
      expect(fs.writeFile).toHaveBeenCalledWith(
        'archive.json',
        expect.stringContaining('Preserved Historical Film'),
        'utf-8'
      );
    });
  });

  describe('run', () => {
    it('calls runETL with appropriate options', async () => {
      process.env.PLEX_USERNAME = 'myuser';
      process.env.PLEX_SERVER_URL = 'http://127.0.0.1:32400';

      await run();

      expect(runETL).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Plex',
          outFile: 'src/data/plex.json',
          defaultData: expect.objectContaining({
            username: 'ewelker',
          }),
        })
      );

      delete process.env.PLEX_USERNAME;
      delete process.env.PLEX_SERVER_URL;
    });

    it('executes fetcher and transform callbacks passed to runETL', async () => {
      let capturedOptions;
      runETL.mockImplementationOnce(async (options) => {
        capturedOptions = options;
      });

      fs.readFile.mockResolvedValueOnce(JSON.stringify([]));
      fs.writeFile.mockResolvedValueOnce(undefined);

      // User info call
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ uuid: 'uuid-1', username: 'edwelker' }),
        })
        // Cloud ratings call
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: { user: { ratingsV2: { pageInfo: { hasNextPage: false }, nodes: [] } } },
          }),
        })
        // PMS sections call
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ MediaContainer: { Directory: [] } }),
        });

      process.env.PLEX_SERVER_URL = 'http://127.0.0.1:32400';
      await run();

      expect(capturedOptions).toBeDefined();
      const rawData = await capturedOptions.fetcher();
      expect(rawData).toEqual([]);
      const transformed = capturedOptions.transform([]);
      expect(transformed.allRatings).toEqual([]);
      delete process.env.PLEX_SERVER_URL;
    });
  });
});
