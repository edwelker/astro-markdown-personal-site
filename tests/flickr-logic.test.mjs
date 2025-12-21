import { describe, it, expect } from 'vitest';
import { transformFlickrData } from '../scripts/flickr-logic.mjs';

describe('Flickr Logic: transformFlickrData', () => {
  it('should return empty array when input is null or empty', () => {
    // Arrange & Act
    const result = transformFlickrData(null);
    // Assert
    expect(result).toEqual([]);
  });

  it('should transform data when input is valid', () => {
    // Arrange
    const mock = { photos: { photo: [{ id: '1', url_m: 'test.jpg' }] } };
    // Act
    const result = transformFlickrData(mock);
    // Assert
    expect(result[0].id).toBe('1');
  });
});
