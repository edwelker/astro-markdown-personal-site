import { describe, it, expect } from 'vitest';
import { sortByNetPrice } from '../src/lib/gas-sort.ts';

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
});
