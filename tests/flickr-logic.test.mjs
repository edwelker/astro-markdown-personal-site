import { describe, it, expect } from 'vitest';
import { transformFlickrData } from '../scripts/flickr-logic.mjs';

describe('Flickr Data Logic', () => {
  it('should transform data accurately', () => {
    const mock = { photos: { photo: [{ id: '1', title: 'Test', url_m: 'img.jpg' }] } };
    const result = transformFlickrData(mock);
    expect(result[0].id).toBe('1');
    expect(result[0].src).toBe('img.jpg');
  });

  it('should handle empty input', () => {
    expect(transformFlickrData(null)).toEqual([]);
  });
});
