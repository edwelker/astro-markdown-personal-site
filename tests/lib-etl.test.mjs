import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mapConcurrent, writeFile, hasDataChanged, runETL } from '../scripts/lib-etl.mjs';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';

vi.mock('node:fs/promises');
vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
}));

describe('lib-etl', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('mapConcurrent', () => {
    it('should process items concurrently', async () => {
      const items = [1, 2, 3, 4, 5];
      const fn = vi.fn(async (x) => x * 2);
      const results = await mapConcurrent(items, 2, fn);
      expect(results).toEqual([2, 4, 6, 8, 10]);
      expect(fn).toHaveBeenCalledTimes(5);
    });
  });

  describe('writeFile', () => {
    it('should create directory and write file', async () => {
      await writeFile('path/to/file.json', { foo: 'bar' });
      expect(fs.mkdir).toHaveBeenCalledWith(expect.stringContaining('path/to'), {
        recursive: true,
      });
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('file.json'),
        JSON.stringify({ foo: 'bar' }, null, 2)
      );
    });
  });

  describe('runETL', () => {
    it('should run successfully', async () => {
      const fetcher = vi.fn().mockResolvedValue({ raw: 'data' });
      const transform = vi.fn().mockReturnValue({ clean: 'data' });
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await runETL({
        name: 'Test',
        fetcher,
        transform,
        outFile: 'out.json',
      });

      expect(fetcher).toHaveBeenCalled();
      expect(transform).toHaveBeenCalledWith({ raw: 'data' });
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('out.json'),
        JSON.stringify({ clean: 'data' }, null, 2)
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('✅ Test: Wrote data to out.json')
      );
    });

    it('should handle errors and write default data', async () => {
      const fetcher = vi.fn().mockRejectedValue(new Error('Fetch failed'));
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // Mock existsSync to return false so it falls back to default data
      vi.mocked(existsSync).mockReturnValue(false);

      await runETL({
        name: 'Test',
        fetcher,
        transform: vi.fn(),
        outFile: 'out.json',
        defaultData: { default: 'data' },
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('❌ Test: Fetch failed')
      );
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('out.json'),
        JSON.stringify({ default: 'data' }, null, 2)
      );
    });

    it('should skip updating cache when only lastUpdated changed', async () => {
      const cached = { items: [1, 2], lastUpdated: '2026-11-21T00:00:00.000Z' };
      const fresh = { items: [1, 2], lastUpdated: '2026-11-22T00:00:00.000Z' };
      const fetcher = vi.fn().mockResolvedValue(fresh);
      const transform = vi.fn().mockReturnValue(fresh);
      vi.spyOn(console, 'log').mockImplementation(() => {});

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(cached));

      await runETL({
        name: 'Plex',
        fetcher,
        transform,
        outFile: 'src/data/plex.json',
      });

      // Only outFile should be written, NOT cacheFile
      expect(fs.writeFile).toHaveBeenCalledTimes(1);
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('src/data/plex.json'),
        JSON.stringify(cached, null, 2)
      );
    });

    it('should update cache when meaningful data changed', async () => {
      const cached = { items: [1, 2], lastUpdated: '2026-11-21T00:00:00.000Z' };
      const fresh = { items: [1, 2, 3], lastUpdated: '2026-11-22T00:00:00.000Z' };
      const fetcher = vi.fn().mockResolvedValue(fresh);
      const transform = vi.fn().mockReturnValue(fresh);
      vi.spyOn(console, 'log').mockImplementation(() => {});

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(cached));

      await runETL({
        name: 'Plex',
        fetcher,
        transform,
        outFile: 'src/data/plex.json',
      });

      expect(fs.writeFile).toHaveBeenCalledTimes(2);
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('src/data/cache/plex.json'),
        JSON.stringify(fresh, null, 2)
      );
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('src/data/plex.json'),
        JSON.stringify(fresh, null, 2)
      );
    });

    it('should overwrite cache when existing cache is corrupt JSON', async () => {
      const fresh = { items: [1] };
      const fetcher = vi.fn().mockResolvedValue(fresh);
      const transform = vi.fn().mockReturnValue(fresh);
      vi.spyOn(console, 'log').mockImplementation(() => {});

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(fs.readFile).mockResolvedValue('{invalid json');

      await runETL({
        name: 'Plex',
        fetcher,
        transform,
        outFile: 'src/data/plex.json',
      });

      expect(fs.writeFile).toHaveBeenCalledTimes(2);
    });
  });

  describe('hasDataChanged', () => {
    it('ignores top-level lastUpdated differences by default', () => {
      expect(
        hasDataChanged({ a: 1, lastUpdated: '2026-01-01' }, { a: 1, lastUpdated: '2026-01-02' })
      ).toBe(false);
    });

    it('detects meaningful changes in objects and arrays', () => {
      expect(hasDataChanged({ a: 1 }, { a: 2 })).toBe(true);
      expect(hasDataChanged([1, 2], [1, 2])).toBe(false);
      expect(hasDataChanged([1, 2], [2, 1])).toBe(true);
    });
  });
});
