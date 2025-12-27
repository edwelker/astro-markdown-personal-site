import { describe, it, expect, vi } from 'vitest';
import { transformStravaData } from '../scripts/cycling-logic.mjs';
import { transformMusicData } from '../scripts/music-logic.mjs';
import { transformTraktData } from '../scripts/trakt-logic.mjs';
import { transformFlickrData } from '../scripts/flickr-logic.mjs';

// Mock Date for consistent test results
const MOCK_DATE = new Date('2023-08-15T12:00:00Z');
vi.setSystemTime(MOCK_DATE);

describe('Cycling Logic: transformStravaData', () => {
  it('should return default structure for empty or invalid input', () => {
    expect(transformStravaData([])).toEqual({
      year: { distance: '0', elevation: '0', count: 0 },
      month: { name: 'August', distance: 0 },
      recent: [],
      chart: Array(52).fill(0)
    });
    expect(transformStravaData(null)).toEqual({
      year: { distance: '0', elevation: '0', count: 0 },
      month: { name: 'August', distance: 0 },
      recent: [],
      chart: Array(52).fill(0)
    });
  });

  it('should correctly transform a list of Strava activities', () => {
    const mockActivities = [
      // YTD Ride (in August) - Public, Outdoor
      {
        id: 1,
        name: 'Morning Ride',
        start_date: '2023-08-10T10:00:00Z',
        distance: 16093.4, // 10 miles
        total_elevation_gain: 304.8, // 1000 feet
        sport_type: 'Ride',
        visibility: 'everyone',
        trainer: false,
      },
      // YTD Ride (in January) - Public, Outdoor
      {
        id: 2,
        name: 'Winter Miles',
        start_date: '2023-01-15T10:00:00Z',
        distance: 32186.9, // 20 miles
        total_elevation_gain: 152.4, // 500 feet
        sport_type: 'Ride',
        visibility: 'everyone',
        trainer: false,
      },
      // Virtual Ride (should be counted for totals, but not in recent)
      {
        id: 3,
        name: 'Zwift Race',
        start_date: '2023-08-01T18:00:00Z',
        distance: 40233.6, // 25 miles
        total_elevation_gain: 0, // 0 feet
        sport_type: 'VirtualRide',
        trainer: true,
      },
      // Private ride (should not appear in recent)
      {
        id: 4,
        name: 'Secret Loop',
        start_date: '2023-08-05T09:00:00Z',
        distance: 8046.72, // 5 miles
        total_elevation_gain: 60.96, // 200 feet
        sport_type: 'Ride',
        visibility: 'only_me',
      },
      // Last year's ride (should be ignored)
      {
        id: 5,
        name: 'Old Ride',
        start_date: '2022-12-25T10:00:00Z',
        distance: 16093.4, // 10 miles
        total_elevation_gain: 100,
        sport_type: 'Ride',
      }
    ];

    const result = transformStravaData(mockActivities);

    expect(result.year.distance).toBe('60');
    expect(result.year.elevation).toBe('1,700');
    expect(result.year.count).toBe(4);
    
    expect(result.month.name).toBe('August');
    expect(result.month.distance).toBe(40);
    
    expect(result.recent).toHaveLength(2);
    expect(result.recent[0]).toEqual({
      id: 1,
      name: 'Morning Ride',
      date: 'Aug 10',
      distance: '10.0',
      elevation: '1,000',
    });
    expect(result.recent[1]).toEqual({
      id: 2,
      name: 'Winter Miles',
      date: 'Jan 15',
      distance: '20.0',
      elevation: '500',
    });

    expect(result.chart[2]).toBe(20); 
    expect(result.chart[31]).toBe(10); 
    expect(result.chart[30]).toBe(30);
  });
});

describe('Music Logic: transformMusicData', () => {
  it('should correctly transform Last.fm API data', () => {
    const mockInfo = { user: { playcount: '12345' } };
    const mockTopArtists = { topartists: { artist: [{ name: 'Artist1', url: 'url1', playcount: '100', image: [{ '#text': 'img1.jpg', size: 'extralarge' }] }] } };
    const mockTopAlbums = { topalbums: { album: [{ name: 'Album1', url: 'url2', artist: { name: 'Artist2' }, playcount: '50', image: [{ '#text': 'img2.jpg', size: 'extralarge' }] }] } };
    const mockTopTracks = { toptracks: { track: [{ name: 'Track1', url: 'url3', artist: { name: 'Artist3' }, playcount: '25', image: [{ '#text': 'img3.jpg', size: 'extralarge' }] }] } };

    const result = transformMusicData(
      mockInfo,
      mockTopArtists, mockTopAlbums, mockTopTracks, // Week
      mockTopArtists, mockTopAlbums, mockTopTracks, // Month
      mockTopArtists, mockTopAlbums, mockTopTracks, // Year
      mockTopArtists, mockTopAlbums, mockTopTracks  // All-time
    );

    expect(result.user.scrobbles).toBe(12345);
    expect(result.week.artists[0]).toEqual({ name: 'Artist1', url: 'url1', plays: '100', image: 'img1.jpg', artist: undefined });
    expect(result.week.albums[0]).toEqual({ name: 'Album1', url: 'url2', plays: '50', image: 'img2.jpg', artist: 'Artist2' });
    expect(result.week.tracks[0]).toEqual({ name: 'Track1', url: 'url3', plays: '25', image: 'img3.jpg', artist: 'Artist3' });
    expect(result.month.artists.length).toBe(1);
    expect(result.year.albums.length).toBe(1);
    expect(result.allTime.tracks.length).toBe(1);
  });
  
  it('should handle empty/missing data gracefully', () => {
    const result = transformMusicData({}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {});
    expect(result.user.scrobbles).toBe(0);
    expect(result.week.artists).toEqual([]);
  });
});

describe('Trakt Logic: transformTraktData', () => {
  it('should return an empty array for empty or invalid input', () => {
    expect(transformTraktData([])).toEqual([]);
    expect(transformTraktData(null)).toEqual([]);
    expect(transformTraktData(undefined)).toEqual([]);
  });

  it('should correctly transform a list of Trakt ratings', () => {
    const mockRatings = [
      {
        rating: 9,
        movie: {
          title: 'The Matrix',
          year: 1999,
          ids: { trakt: 1, imdb: 'tt0133093', slug: 'the-matrix-1999' },
        },
        poster: 'poster1.jpg',
        director: 'Wachowskis'
      },
      {
        rating: 10,
        show: {
          title: 'Breaking Bad',
          year: 2008,
          ids: { trakt: 2, imdb: 'tt0903747', slug: 'breaking-bad-2008' },
        },
        poster: 'poster2.jpg',
        director: 'Vince Gilligan'
      },
      // Item with missing optional data
      {
        rating: 8,
        movie: {
          title: 'Indie Film',
          year: 2021,
          ids: { trakt: 3, imdb: 'tt1234567' },
        }
      }
    ];

    const result = transformTraktData(mockRatings);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({
      id: 1,
      imdbId: 'tt0133093',
      title: 'The Matrix',
      year: 1999,
      rating: 9,
      type: 'movie',
      href: 'https://trakt.tv/movies/the-matrix-1999',
      poster: 'poster1.jpg',
      director: 'Wachowskis'
    });
    expect(result[1]).toEqual({
      id: 2,
      imdbId: 'tt0903747',
      title: 'Breaking Bad',
      year: 2008,
      rating: 10,
      type: 'show',
      href: 'https://trakt.tv/shows/breaking-bad-2008',
      poster: 'poster2.jpg',
      director: 'Vince Gilligan'
    });
    expect(result[2]).toEqual({
      id: 3,
      imdbId: 'tt1234567',
      title: 'Indie Film',
      year: 2021,
      rating: 8,
      type: 'movie',
      href: 'https://trakt.tv/movies/',
      poster: '',
      director: 'Unknown'
    });
  });
});

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
