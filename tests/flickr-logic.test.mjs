import apiFixture from './fixtures/flickr-api-sample.json';
import { transformFlickrData } from '../scripts/flickr-logic.mjs';

describe('Flickr Data Transformation', () => {
  it('should correctly map real-world API snapshots', () => {
    // Arrange: Use the imported fixture as input.
    const input = apiFixture;

    // Act: Process the data through our pure function.
    const result = transformFlickrData(input);

    // Assert: Check the first transformed object for accuracy.
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: "534123456",
      title: "Golden Gate Bridge",
      src: "https://live.staticflickr.com/test_m.jpg",
      date: "2025-12-21 10:00:00",
      tags: ["sf", "bridge", "fog"]
    });
  });

  it('should return an empty array for null/undefined input', () => {
    // Act & Assert: Verify the fallback logic.
    expect(transformFlickrData(null)).toEqual([]);
    expect(transformFlickrData(undefined)).toEqual([]);
  });
});
