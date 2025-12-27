import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mapConcurrent, writeFile, runETL } from '../scripts/lib-etl.mjs';
import fs from 'node:fs/promises';

vi.mock('node:fs/promises');

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
      expect(fs.mkdir).toHaveBeenCalledWith(expect.stringContaining('path/to'), { recursive: true });
      expect(fs.writeFile).toHaveBeenCalledWith(expect.stringContaining('file.json'), JSON.stringify({ foo: 'bar' }, null, 2));
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
        outFile: 'out.json'
      });

      expect(fetcher).toHaveBeenCalled();
      expect(transform).toHaveBeenCalledWith({ raw: 'data' });
      expect(fs.writeFile).toHaveBeenCalledWith(expect.stringContaining('out.json'), JSON.stringify({ clean: 'data' }, null, 2));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Success'));
    });

    it('should handle errors and write default data', async () => {
      const fetcher = vi.fn().mockRejectedValue(new Error('Fetch failed'));
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await runETL({
        name: 'Test',
        fetcher,
        transform: vi.fn(),
        outFile: 'out.json',
        defaultData: { default: 'data' }
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Failed'));
      expect(fs.writeFile).toHaveBeenCalledWith(expect.stringContaining('out.json'), JSON.stringify({ default: 'data' }, null, 2));
    });
  });
});
