import { describe, it, expect } from 'vitest';
import { transformFlickrData } from '../scripts/flickr-logic.mjs';

describe('Flickr Logic: transformFlickrData', () => {
  it('should return an empty array for empty or invalid input', () => {
    expect(transformFlickrData(null)).toEqual([]);
    expect(transformFlickrData({})).toEqual([]);
    expect(transformFlickrData({ photos: {} })).toEqual([]);
    expect(transformFlickrData({ photos: { photo: [] } })).toEqual([]);
  });

  it('should correctly transform a list of Flickr photos', () => {
    const mockData = {
      photos: {
        photo: [
          {
            id: '1',
            title: 'A Good Photo',
            url_m: 'url1.jpg',
            width_m: '800',
            height_m: '600',
            datetaken: '2023-01-01 12:00:00',
            tags: 'tag1 tag2'
          },
          {
            id: '2',
            title: 'Untitled',
            url_m: 'url2.jpg',
            width_m: '600',
            height_m: '800',
            datetaken: '2023-01-02 12:00:00',
            tags: ''
          },
          {
            id: '3',
            title: 'Multi-space tags',
            url_m: 'url3.jpg',
            width_m: '800',
            height_m: '600',
            datetaken: '2023-01-03 12:00:00',
            tags: 'tagA  tagB'
          }
        ]
      }
    };
    const result = transformFlickrData(mockData);
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({
      id: '1',
      title: 'A Good Photo',
      src: 'url1.jpg',
      date: '2023-01-01 12:00:00',
      tags: ['tag1', 'tag2'],
      aspect: 800 / 600,
      isLandscape: true,
      isPortrait: false
    });
    expect(result[1]).toEqual({
      id: '2',
      title: 'Untitled',
      src: 'url2.jpg',
      date: '2023-01-02 12:00:00',
      tags: [],
      aspect: 600 / 800,
      isLandscape: false,
      isPortrait: true
    });
    expect(result[2]).toEqual({
      id: '3',
      title: 'Multi-space tags',
      src: 'url3.jpg',
      date: '2023-01-03 12:00:00',
      tags: ['tagA', 'tagB'],
      aspect: 800 / 600,
      isLandscape: true,
      isPortrait: false
    });
  });

  it('should handle missing or unexpected data gracefully', () => {
    const mockData = {
      photos: {
        photo: [
          { id: '3', title: 'Minimal Photo' },
          {
            id: '4',
            title: 'Another Photo',
            url_m: 'url4.jpg',
            datetaken: '2023-01-04 12:00:00',
            tags: 'tag4'
          }
        ]
      }
    };
    const result = transformFlickrData(mockData);
    expect(result[0]).toEqual({
      id: '3',
      title: 'Minimal Photo',
      src: '',
      date: '',
      tags: [],
      aspect: 1,
      isLandscape: false,
      isPortrait: false
    });
    expect(result[1]).toEqual({
      id: '4',
      title: 'Another Photo',
      src: 'url4.jpg',
      date: '2023-01-04 12:00:00',
      tags: ['tag4'],
      aspect: 1,
      isLandscape: false,
      isPortrait: false
    });
  });
});
