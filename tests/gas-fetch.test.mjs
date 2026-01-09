import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchGasData, transformGasData, parseCSV, FILES } from '../scripts/gas-fetch.mjs';

describe('Gas Fetch Logic', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.stubGlobal('console', { warn: vi.fn(), log: vi.fn(), error: vi.fn() });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('fetchGasData', () => {
    it('should fetch data for all regions', async () => {
      fetch.mockResolvedValue({
        ok: true,
        text: async () => 'header\nvalue',
      });

      const data = await fetchGasData();

      expect(fetch).toHaveBeenCalledTimes(Object.keys(FILES).length);
      Object.keys(FILES).forEach(region => {
        expect(data[region]).toBe('header\nvalue');
      });
    });

    it('should handle fetch failures gracefully', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      });
      // Mock subsequent calls to succeed to isolate the failure test
      fetch.mockResolvedValue({
        ok: true,
        text: async () => 'csv',
      });

      const data = await fetchGasData();
      
      // The first region (md) failed
      expect(data.md).toBe('');
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('parseCSV', () => {
    it('should parse simple CSV', () => {
      const csv = 'Col1,Col2\nVal1,Val2';
      const result = parseCSV(csv);
      expect(result).toEqual([{ Col1: 'Val1', Col2: 'Val2' }]);
    });

    it('should handle quoted values with commas', () => {
      const csv = 'Name,Desc\n"Doe, John",Person';
      const result = parseCSV(csv);
      expect(result).toEqual([{ Name: 'Doe, John', Desc: 'Person' }]);
    });

    it('should return empty array for empty input', () => {
      expect(parseCSV('')).toEqual([]);
      expect(parseCSV(null)).toEqual([]);
    });
  });

  describe('transformGasData', () => {
    it('should transform raw map of CSV strings to objects', () => {
      const raw = {
        md: 'A,B\n1,2',
        ny: 'C,D\n3,4'
      };
      const result = transformGasData(raw);
      expect(result.md).toEqual([{ A: '1', B: '2' }]);
      expect(result.ny).toEqual([{ C: '3', D: '4' }]);
    });
  });
});
