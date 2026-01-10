import { describe, it, expect } from 'vitest';
import { filterGasData } from '../src/lib/gas-filter';

const testData = [
  { Station: 'Alpha Gas', Address: '1 Main St', City: 'Springfield', Zip: '12345' },
  { Station: 'Beta Fuel', Address: '2 Broad St', City: 'Shelbyville', Zip: '54321' },
  { Station: 'Gamma Oil', Address: '3 High Way', City: 'SPRINGFIELD', Zip: '11111' },
  { Station: 'Delta Pump', Address: '4 Low Rd', City: 'Capital City', Zip: 12345 },
  { Station: 'Epsilon', City: null, Zip: '99999' },
  { Station: 'Zeta', City: 'NoZipCity', Zip: null },
  { Station: 'Eta' } // Empty object mostly
];

describe('Gas Filter - filterGasData', () => {
  it('should filter by city, case-insensitively', () => {
    const result = filterGasData(testData, 'spring');
    expect(result.map(r => r.Station)).toEqual(['Alpha Gas', 'Gamma Oil']);
  });

  it('should filter by zip code string', () => {
    const result = filterGasData(testData, '12345');
    expect(result.map(r => r.Station)).toEqual(['Alpha Gas', 'Delta Pump']);
  });

  it('should filter by station name', () => {
    const result = filterGasData(testData, 'beta');
    expect(result.map(r => r.Station)).toEqual(['Beta Fuel']);
  });

  it('should filter by address', () => {
    const result = filterGasData(testData, 'High Way');
    expect(result.map(r => r.Station)).toEqual(['Gamma Oil']);
  });

  it('should return all items if query is empty', () => {
    const result = filterGasData(testData, '');
    expect(result).toHaveLength(7);
  });

  it('should return an empty array if no matches are found', () => {
    const result = filterGasData(testData, 'nonexistent');
    expect(result).toHaveLength(0);
  });

  it('should handle null or undefined values gracefully', () => {
    const resultByZip = filterGasData(testData, '99999');
    expect(resultByZip.map(r => r.Station)).toEqual(['Epsilon']);
    
    const resultByCity = filterGasData(testData, 'NoZip');
    expect(resultByCity.map(r => r.Station)).toEqual(['Zeta']);
  });

  it('should handle an empty data array', () => {
    const result = filterGasData([], 'test');
    expect(result).toEqual([]);
  });
});
