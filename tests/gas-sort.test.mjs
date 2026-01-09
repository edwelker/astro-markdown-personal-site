import { describe, it, expect } from 'vitest';
import { sortByNetPrice, sortGasData } from '../src/lib/gas-sort.ts';

describe('Gas Sort - sortByNetPrice', () => {
  it('should sort by Net price ascending', () => {
    const items = [{ Net: '3.50' }, { Net: '3.40' }, { Net: '3.60' }];
    items.sort(sortByNetPrice);
    expect(items.map(i => i.Net)).toEqual(['3.40', '3.50', '3.60']);
  });

  it('should handle different price formats', () => {
    const items = [{ Net: '$3.50' }, { Net: 3.40 }, { Net: '3.60 USD' }];
    items.sort(sortByNetPrice);
    expect(items).toEqual([{ Net: 3.40 }, { Net: '$3.50' }, { Net: '3.60 USD' }]);
  });

  it('should push items with invalid or missing Net price to the end, preserving their relative order', () => {
    const items = [{ Net: '3.50' }, { Net: null }, { Net: 'invalid' }, { Net: '3.40' }, {}];
    items.sort(sortByNetPrice);
    expect(items.map(i => i.Net)).toEqual(['3.40', '3.50', null, 'invalid', undefined]);
  });

  it('should handle all items being invalid, preserving their relative order', () => {
      const items = [{ Net: 'invalid-a' }, { Net: null }, { Net: 'invalid-b' }];
      items.sort(sortByNetPrice);
      expect(items.map(i => i.Net)).toEqual(['invalid-a', null, 'invalid-b']);
  });

  it('should handle an empty array', () => {
    const items = [];
    items.sort(sortByNetPrice);
    expect(items).toEqual([]);
  });

  // Explicit branch testing for coverage
  it('should return 0 when both are invalid', () => {
    expect(sortByNetPrice({ Net: null }, { Net: 'invalid' })).toBe(0);
  });

  it('should return 1 when A is invalid and B is valid', () => {
    expect(sortByNetPrice({ Net: null }, { Net: '3.50' })).toBe(1);
  });

  it('should return -1 when A is valid and B is invalid', () => {
    expect(sortByNetPrice({ Net: '3.50' }, { Net: null })).toBe(-1);
  });
});

describe('Gas Sort - sortGasData', () => {
  const testData = () => [ // Use a function to get fresh data for each test
    { Station: 'C Gas', Address: '3 Main St', Net: '3.60', Base: '3.70' },
    { Station: 'A Gas', Address: '1 Main St', Net: '3.40', Base: '3.50' },
    { Station: 'B Gas', Address: '2 Main St', Net: '3.50', Base: '3.60' },
    { Station: 'D Gas', Address: '4 Main St', Net: null, Base: '3.80' },
  ];

  const distances = {
    '1 Main St': { duration: 200 },
    '2 Main St': { duration: 100 },
    '3 Main St': { duration: 300 },
    // 4 Main St has no distance
  };

  it('should sort by a text column (Station) ascending', () => {
    const data = testData();
    sortGasData(data, { sortCol: 'Station', sortAsc: true, distances: {} });
    expect(data.map(i => i.Station)).toEqual(['A Gas', 'B Gas', 'C Gas', 'D Gas']);
  });

  it('should sort by a text column (Station) descending', () => {
    const data = testData();
    sortGasData(data, { sortCol: 'Station', sortAsc: false, distances: {} });
    expect(data.map(i => i.Station)).toEqual(['D Gas', 'C Gas', 'B Gas', 'A Gas']);
  });

  it('should sort by a numeric column (Net) ascending, pushing invalid to the end', () => {
    const data = testData();
    sortGasData(data, { sortCol: 'Net', sortAsc: true, distances: {} });
    expect(data.map(i => i.Station)).toEqual(['A Gas', 'B Gas', 'C Gas', 'D Gas']);
  });

  it('should use tie-breaker (Net price) when primary sort values are equal', () => {
    const data = [
      { Station: 'Z Gas', Address: '1', Net: '3.50', Base: '3.60' },
      { Station: 'Y Gas', Address: '2', Net: '3.40', Base: '3.60' },
    ];
    sortGasData(data, { sortCol: 'Base', sortAsc: true, distances: {} });
    expect(data.map(i => i.Station)).toEqual(['Y Gas', 'Z Gas']);
  });
  
  it('should sort by time ascending, pushing stations without time to the end', () => {
    const data = testData();
    sortGasData(data, { sortCol: 'Time', sortAsc: true, distances });
    expect(data.map(i => i.Address)).toEqual(['2 Main St', '1 Main St', '3 Main St', '4 Main St']);
  });

  it('should sort by time descending, pushing stations without time to the end', () => {
    const data = testData();
    sortGasData(data, { sortCol: 'Time', sortAsc: false, distances });
    expect(data.map(i => i.Address)).toEqual(['3 Main St', '1 Main St', '2 Main St', '4 Main St']);
  });

  // Explicit branch testing for sortGasData numeric columns
  it('should handle invalid values in numeric sort columns (Base)', () => {
    const data = [
      { Base: 'invalid', Net: '3.00' },
      { Base: null, Net: '3.00' },
      { Base: '3.50', Net: '3.00' }
    ];
    sortGasData(data, { sortCol: 'Base', sortAsc: true, distances: {} });
    // Expect valid first, then invalids (order between invalids is stable/0)
    expect(data[0].Base).toBe('3.50');
    expect(data[1].Base).toBe('invalid');
    expect(data[2].Base).toBe(null);
  });

  it('should handle valid vs invalid in numeric sort', () => {
    const data = [
      { Base: 'invalid', Net: '3.00' },
      { Base: '3.50', Net: '3.00' }
    ];
    sortGasData(data, { sortCol: 'Base', sortAsc: true, distances: {} });
    expect(data[0].Base).toBe('3.50');
    expect(data[1].Base).toBe('invalid');
  });
});
