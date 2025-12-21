import { describe, it, expect } from 'vitest';
import { transformFlickrData } from '../scripts/flickr-logic.mjs';

describe('Flickr Data Transformation', () => {
  it('should correctly map raw API data to our internal format', () => {
    const mockInput = {
      photos: {
        photo: [{
          id: "123",
          title: "Test Photo",
          url_m: "https://example.com/m.jpg",
          datetaken: "2025-12-21",
          tags: "sf bridge"
        }]
      }
    };

    const result = transformFlickrData(mockInput);

    expect(result[0]).toEqual({
      id: "123",
      title: "Test Photo",
      src: "https://example.com/m.jpg",
      date: "2025-12-21",
      tags: ["sf", "bridge"]
    });
  });

  it('should handle missing data gracefully', () => {
    expect(transformFlickrData(null)).toEqual([]);
    expect(transformFlickrData({})).toEqual([]);
  });
});
