import { describe, it, expect } from 'vitest';
import { normalizeGasData } from '../src/lib/gas-data-normalization';

describe('Gas Data Normalization - normalizeGasData', () => {
  it('should handle case-insensitive keys', () => {
    const rawData = [{ station: 'My Station', address: '123 Fake St' }];
    const result = normalizeGasData(rawData, 'any');
    expect(result[0].Station).toBe('My Station');
    expect(result[0].Address).toBe('123 Fake St');
  });

  it('should coalesce different coordinate keys', () => {
    const rawData = [
      { lat: 1, lng: 2 },
      { latitude: 3, long: 4 },
      { lat: 5, longitude: 6 }
    ];
    const result = normalizeGasData(rawData, 'any');
    expect(result[0]).toMatchObject({ lat: 1, lng: 2 });
    expect(result[1]).toMatchObject({ lat: 3, lng: 4 });
    expect(result[2]).toMatchObject({ lat: 5, lng: 6 });
  });

  it('should calculate Net price if missing', () => {
    const rawData = [{ Base: '3.50', Discount: '0.10' }];
    const result = normalizeGasData(rawData, 'any');
    expect(result[0].Net).toBe('3.40');
  });

  it('should use existing Net price if present', () => {
    const rawData = [{ Net: '3.33', Base: '3.50', Discount: '0.10' }];
    const result = normalizeGasData(rawData, 'any');
    expect(result[0].Net).toBe('3.33');
  });
  
  it('should handle invalid discount by defaulting to 0', () => {
    const rawData = [{ Base: '3.50', Discount: 'N/A' }];
    const result = normalizeGasData(rawData, 'any');
    expect(result[0].Net).toBe('3.50');
  });

  it('should handle invalid base price by returning the raw base as Net', () => {
    const rawData = [{ Base: 'Unknown' }];
    const result = normalizeGasData(rawData, 'any');
    expect(result[0].Net).toBe('Unknown');
  });

  it('should clean up Maryland city names', () => {
    const rawData = [{ City: 'Baltimore (Inner Harbor)' }];
    const result = normalizeGasData(rawData, 'md');
    expect(result[0].City).toBe('Baltimore');
  });

  it('should not clean up city names for other regions', () => {
    const rawData = [{ City: 'New York (Manhattan)' }];
    const result = normalizeGasData(rawData, 'ny');
    expect(result[0].City).toBe('New York (Manhattan)');
  });

  it('should handle empty input array', () => {
    const result = normalizeGasData([], 'any');
    expect(result).toEqual([]);
  });
});
