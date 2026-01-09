import { describe, it, expect } from 'vitest';
import { transformMusicData } from '../scripts/music-logic.mjs';

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
