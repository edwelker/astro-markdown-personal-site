import { describe, it, expect } from 'vitest';
import { filterGasData } from '../src/lib/gas-filter';

const testData = [
  { Station: 'A', City: 'Springfield', Zip: '12345' },
  { Station: 'B', City: 'Shelbyville', Zip: '54321' },
  { Station: 'C', City: 'SPRINGFIELD', Zip: '11111' }, // Test case-insensitivity
  { Station: 'D', City: 'Capital City', Zip: 12345 }, // Test numeric zip
  { Station: 'E', City: null, Zip: '99999' },
  { Station: 'F', City: 'NoZipCity', Zip: null },
  { Station: 'G' } // Empty object, should be filtered out
];

describe('Gas Filter - filterGasData', () => {
  it('should filter by city, case-insensitively', () => {
    const result = filterGasData(testData, 'spring');
    expect(result.map(r => r.Station)).toEqual(['A', 'C']);
  });

  it('should filter by zip code string', () => {
    const result = filterGasData(testData, '12345');
    expect(result.map(r => r.Station)).toEqual(['A', 'D']);
  });

  it('should filter by partial zip code', () => {
    const result = filterGasData(testData, '123');
    expect(result.map(r => r.Station)).toEqual(['A', 'D']);
  });

  it('should return all items with a city or zip if query is empty', () => {
    const result = filterGasData(testData, '');
    // The empty object 'G' will be filtered out as it has no City or Zip.
    expect(result).toHaveLength(6);
  });

  it('should return an empty array if no matches are found', () => {
    const result = filterGasData(testData, 'nonexistent');
    expect(result).toHaveLength(0);
  });

  it('should handle null or undefined city/zip values gracefully', () => {
    const resultByZip = filterGasData(testData, '99999');
    expect(resultByZip.map(r => r.Station)).toEqual(['E']);
    
    const resultByCity = filterGasData(testData, 'NoZip');
    expect(resultByCity.map(r => r.Station)).toEqual(['F']);
  });

  it('should handle an empty data array', () => {
    const result = filterGasData([], 'test');
    expect(result).toEqual([]);
  });
});
