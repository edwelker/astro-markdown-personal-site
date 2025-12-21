import { describe, it, expect } from 'vitest';
import { transformFlickrData } from '../scripts/flickr-logic.mjs';

describe('Flickr Logic', () => {
  it('should transform raw flickr data into clean objects', () => {
    // Arrange
    const mockApi = {
      photos: {
        photo: [{
          id: '123',
          title: 'Test Photo',
          url_m: 'image.jpg',
          datetaken: '2025-12-20',
          tags: 'one two'
        }]
      }
    };

    // Act
    const result = transformFlickrData(mockApi);

    // Assert
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('123');
    expect(result[0].tags).toEqual(['one', 'two']);
  });

  it('should return empty array on null input', () => {
    // Arrange & Act
    const result = transformFlickrData(null);

    // Assert
    expect(result).toEqual([]);
  });
});
