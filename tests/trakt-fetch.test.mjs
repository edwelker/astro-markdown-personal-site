import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { enrichItem, fetchAndEnrichTraktData, transformAndAggregateTraktData, run } from '../scripts/trakt-fetch.mjs';
import fs from 'node:fs/promises';
import { runETL } from '../scripts/lib-etl.mjs';

vi.mock('node:fs/promises');
vi.mock('../scripts/lib-etl.mjs', () => ({
  runETL: vi.fn(),
  mapConcurrent: vi.fn(async (items, limit, fn) => Promise.all(items.map(fn))),
  writeFile: vi.fn()
}));

describe('Trakt Fetch Logic', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('enrichItem', () => {
    it('should return cached item if available', async () => {
      const item = { movie: { ids: { imdb: 'tt123' } } };
      const cache = new Map([['tt123', { poster: 'cached.jpg' }]]);
      
      const result = await enrichItem(item, { cache, apiKey: 'key' });
      expect(result).toEqual({ ...item, poster: 'cached.jpg' });
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should fetch from TMDB if not in cache', async () => {
      const item = { movie: { ids: { tmdb: '456' } } };
      const cache = new Map();
      
      global.fetch
        .mockResolvedValueOnce({ json: async () => ({ poster_path: '/poster.jpg' }) }) // TMDB details
        .mockResolvedValueOnce({ json: async () => ({ crew: [{ job: 'Director', name: 'Nolan' }] }) }); // Credits

      const result = await enrichItem(item, { cache, apiKey: 'key' });
      
      expect(result.poster).toBe('https://image.tmdb.org/t/p/w500/poster.jpg');
      expect(result.director).toBe('Nolan');
    });

    it('should handle TMDB errors gracefully', async () => {
      const item = { movie: { ids: { tmdb: '456' } } };
      const cache = new Map();
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      global.fetch.mockRejectedValue(new Error('API Error'));

      const result = await enrichItem(item, { cache, apiKey: 'key' });
      
      expect(result.poster).toBeNull();
      expect(result.director).toBe('Unknown');
      expect(consoleWarnSpy).toHaveBeenCalled();
    });
  });

  describe('fetchAndEnrichTraktData', () => {
    it('should fetch and enrich data', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify({ allRatings: [] }));
      
      const mockTraktResponse = [{ movie: { ids: { tmdb: 1 } } }];
      global.fetch
        .mockResolvedValueOnce({ ok: true, json: async () => mockTraktResponse }) // Movies
        .mockResolvedValueOnce({ ok: true, json: async () => [] }) // Shows
        // TMDB calls inside enrichItem
        .mockResolvedValueOnce({ json: async () => ({}) })
        .mockResolvedValueOnce({ json: async () => ({}) });

      const result = await fetchAndEnrichTraktData({
        clientId: 'id',
        username: 'user',
        tmdbApiKey: 'key',
        dataPath: 'path.json'
      });

      expect(result).toHaveLength(1);
      expect(global.fetch).toHaveBeenCalledTimes(4);
    });

    it('should throw if Trakt fetch fails', async () => {
      fs.readFile.mockResolvedValue('{}');
      global.fetch.mockResolvedValue({ ok: false });

      await expect(fetchAndEnrichTraktData({
        clientId: 'id',
        username: 'user',
        tmdbApiKey: 'key',
        dataPath: 'path.json'
      })).rejects.toThrow('Failed to fetch from Trakt');
    });
  });

  describe('transformAndAggregateTraktData', () => {
    it('should aggregate data correctly', () => {
      const enriched = [
        { 
          rating: 10, 
          year: 2020, 
          director: 'Director A', 
          movie: { title: 'M1', genres: ['Action'] } 
        },
        { 
          rating: 8, 
          year: 2021, 
          director: 'Director A', 
          movie: { title: 'M2', genres: ['Drama'] } 
        }
      ];

      const result = transformAndAggregateTraktData(enriched, { username: 'test' });

      expect(result.username).toBe('test');
      expect(result.allRatings).toHaveLength(2);
      
      // Check directors
      expect(result.directors).toEqual([['Director A', 2]]);
      
      // Check genres (Action: 1, Drama: 1) - order depends on sort, likely stable or equal
      expect(result.genres).toHaveLength(2);
      
      // Check sparkline (Decade 2020)
      expect(result.sparkline).toEqual([
        { decade: 2020, score: "9.00", volume: 2 }
      ]);
    });
  });

  describe('run', () => {
    it('should execute the ETL process', async () => {
      await run();
      expect(runETL).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Trakt',
        outFile: 'src/data/trakt.json'
      }));
    });
  });
});
