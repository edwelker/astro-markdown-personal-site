import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchGasData, parseCSV, transformGasData, FILES, REPO_BASE } from '../scripts/gas-fetch.mjs';

// Mock global fetch
global.fetch = vi.fn();

describe('Gas Fetch Logic', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('fetchGasData', () => {
    it('should fetch data for all regions', async () => {
      const mockText = 'Station,Address\nShell,123 Main St';
      global.fetch.mockResolvedValue({
        ok: true,
        text: async () => mockText
      });

      const data = await fetchGasData();

      expect(global.fetch).toHaveBeenCalledTimes(Object.keys(FILES).length);
      
      // Verify correct URLs were called
      Object.values(FILES).forEach(filename => {
        expect(global.fetch).toHaveBeenCalledWith(
          `${REPO_BASE}/${filename}`,
          expect.anything() // fetchOrThrow adds options object
        );
      });

      expect(data).toEqual({
        md: mockText,
        ny: mockText,
        ma: mockText
      });
    });

    it('should throw error on fetch failure', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });
      
      await expect(fetchGasData()).rejects.toThrow('Request failed: 404 Not Found');
    });
  });

  describe('parseCSV', () => {
    it('should parse simple CSV', () => {
      const csv = 'Name,Age\nAlice,30\nBob,25';
      const result = parseCSV(csv);
      expect(result).toEqual([
        { Name: 'Alice', Age: '30' },
        { Name: 'Bob', Age: '25' }
      ]);
    });

    it('should handle quoted values with commas', () => {
      const csv = 'Name,Location\n"Smith, John","New York, NY"';
      const result = parseCSV(csv);
      expect(result).toEqual([
        { Name: 'Smith, John', Location: 'New York, NY' }
      ]);
    });

    it('should return empty array for empty input', () => {
      expect(parseCSV('')).toEqual([]);
      expect(parseCSV(null)).toEqual([]);
    });
  });

  describe('transformGasData', () => {
    it('should transform raw map of CSV strings to objects', () => {
      const rawData = {
        md: 'Station,Price\nShell,3.50',
        ny: 'Station,Price\nExxon,3.60'
      };
      
      const result = transformGasData(rawData);
      
      expect(result.md).toHaveLength(1);
      expect(result.md[0]).toEqual({ Station: 'Shell', Price: '3.50' });
      expect(result.ny).toHaveLength(1);
      expect(result.ny[0]).toEqual({ Station: 'Exxon', Price: '3.60' });
    });
  });
});
