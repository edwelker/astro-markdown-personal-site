import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { transformMusicData } from '../scripts/music-logic.mjs';

describe('Music Logic: transformMusicData', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should correctly transform Last.fm API data', () => {
    const mockInfo = { user: { playcount: '12345' } };
    const mockRecent = { recenttracks: { track: [] } };
    const mockTopArtists = {
      topartists: {
        artist: [
          {
            name: 'Artist1',
            url: 'url1',
            playcount: '100',
            image: [{ '#text': 'img1.jpg', size: 'extralarge' }],
          },
        ],
      },
    };
    const mockTopAlbums = {
      topalbums: {
        album: [
          {
            name: 'Album1',
            url: 'url2',
            artist: { name: 'Artist2' },
            playcount: '50',
            image: [{ '#text': 'img2.jpg', size: 'extralarge' }],
          },
        ],
      },
    };
    const mockTopTracks = {
      toptracks: {
        track: [
          {
            name: 'Track1',
            url: 'url3',
            artist: { name: 'Artist3' },
            playcount: '25',
            image: [{ '#text': 'img3.jpg', size: 'extralarge' }],
          },
        ],
      },
    };

    const result = transformMusicData(
      mockInfo,
      mockRecent,
      mockTopArtists,
      mockTopAlbums,
      mockTopTracks, // Week
      mockTopArtists,
      mockTopAlbums,
      mockTopTracks, // Month
      mockTopArtists,
      mockTopAlbums,
      mockTopTracks, // Year
      mockTopArtists,
      mockTopAlbums,
      mockTopTracks // All-time
    );

    expect(result.user.scrobbles).toBe(12345);
    expect(result.week.artists[0]).toEqual({
      name: 'Artist1',
      url: 'url1',
      plays: '100',
      image: 'img1.jpg',
      artist: undefined,
    });
    expect(result.week.albums[0]).toEqual({
      name: 'Album1',
      url: 'url2',
      plays: '50',
      image: 'img2.jpg',
      artist: 'Artist2',
    });
    expect(result.week.tracks[0]).toEqual({
      name: 'Track1',
      url: 'url3',
      plays: '25',
      image: 'img3.jpg',
      artist: 'Artist3',
    });
    expect(result.month.artists.length).toBe(1);
    expect(result.year.albums.length).toBe(1);
    expect(result.allTime.tracks.length).toBe(1);
  });

  it('should handle empty/missing data gracefully', () => {
    const result = transformMusicData({}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {});
    expect(result.user.scrobbles).toBe(0);
    expect(result.week.artists).toEqual([]);
  });

  it('should process recent tracks history correctly', () => {
    // Set a fixed date: 2023-10-27 (Friday)
    const mockDate = new Date('2023-10-27T12:00:00Z');
    vi.setSystemTime(mockDate);

    const mockInfo = { user: { playcount: '1000' } };
    
    // Helper to get timestamp for X days ago
    const getTs = (daysAgo) => {
      const d = new Date(mockDate);
      d.setDate(d.getDate() - daysAgo);
      return Math.floor(d.getTime() / 1000).toString();
    };

    const mockRecent = {
      recenttracks: {
        track: [
          // Currently playing (should be ignored)
          { '@attr': { nowplaying: 'true' }, artist: { '#text': 'Now Artist' } },
          // Today (0 days ago) - 2 tracks for Artist A
          { date: { uts: getTs(0) }, artist: { '#text': 'Artist A' } },
          { date: { uts: getTs(0) }, artist: { '#text': 'Artist A' } },
          // Yesterday (1 day ago) - 1 track for Artist B
          { date: { uts: getTs(1) }, artist: { '#text': 'Artist B' } },
          // Last week comparison (7 days ago) - 1 track for Artist C
          { date: { uts: getTs(7) }, artist: { '#text': 'Artist C' } },
          // Comparison for yesterday (8 days ago) - 1 track for Artist D
          { date: { uts: getTs(8) }, artist: { '#text': 'Artist D' } },
        ]
      }
    };

    const emptyList = {}; 

    const result = transformMusicData(
      mockInfo,
      mockRecent,
      emptyList, emptyList, emptyList,
      emptyList, emptyList, emptyList,
      emptyList, emptyList, emptyList,
      emptyList, emptyList, emptyList
    );

    const history = result.history;
    
    // Check length (should be 7 days)
    expect(history).toHaveLength(7);

    // Check Today (last element)
    const todayStat = history[6];
    // 2 tracks * 3.5 mins / 60 = 0.1166... -> 0.1
    expect(todayStat.hours).toBe('0.1'); 
    expect(todayStat.topArtist).toBe('Artist A');
    // Last week for today (7 days ago) had 1 track -> 0.1
    expect(todayStat.lastHours).toBe('0.1');

    // Check Yesterday (second to last)
    const yesterdayStat = history[5];
    // 1 track -> 0.1
    expect(yesterdayStat.hours).toBe('0.1');
    expect(yesterdayStat.topArtist).toBe('Artist B');
    // 8 days ago had 1 track -> 0.1
    expect(yesterdayStat.lastHours).toBe('0.1');
  });

  it('should shift history window back if today has no data', () => {
    // Set a fixed date: 2023-10-27 (Friday)
    const mockDate = new Date('2023-10-27T12:00:00Z');
    vi.setSystemTime(mockDate);

    const mockInfo = { user: { playcount: '1000' } };
    
    // Helper to get timestamp for X days ago
    const getTs = (daysAgo) => {
      const d = new Date(mockDate);
      d.setDate(d.getDate() - daysAgo);
      return Math.floor(d.getTime() / 1000).toString();
    };

    const mockRecent = {
      recenttracks: {
        track: [
          // Yesterday (1 day ago) - 1 track for Artist B
          { date: { uts: getTs(1) }, artist: { '#text': 'Artist B' } },
          // NO DATA FOR TODAY (0 days ago)
        ]
      }
    };

    const emptyList = {}; 

    const result = transformMusicData(
      mockInfo,
      mockRecent,
      emptyList, emptyList, emptyList,
      emptyList, emptyList, emptyList,
      emptyList, emptyList, emptyList,
      emptyList, emptyList, emptyList
    );

    const history = result.history;
    
    // Check length (should be 7 days)
    expect(history).toHaveLength(7);

    // The last element should be YESTERDAY (Thu), not Today (Fri), because Today was empty
    const lastStat = history[6];
    expect(lastStat.dayName).toBe('Thu'); // 2023-10-26
    expect(lastStat.hours).toBe('0.1'); // 1 track
    expect(lastStat.topArtist).toBe('Artist B');
  });

  it('should handle single item response from API (Last.fm quirk)', () => {
    const mockInfo = { user: { playcount: '100' } };
    // Single object instead of array
    const mockTopArtists = {
      topartists: {
        artist: {
          name: 'Single Artist',
          url: 'url1',
          playcount: '10',
          image: [{ '#text': 'img.jpg', size: 'extralarge' }],
        },
      },
    };
    const mockRecent = {
      recenttracks: {
        track: { date: { uts: '1234567890' }, artist: { '#text': 'Single Track Artist' } }
      }
    };

    const emptyList = {};

    const result = transformMusicData(
      mockInfo,
      mockRecent,
      mockTopArtists, emptyList, emptyList,
      emptyList, emptyList, emptyList,
      emptyList, emptyList, emptyList,
      emptyList, emptyList, emptyList
    );

    expect(result.week.artists).toHaveLength(1);
    expect(result.week.artists[0].name).toBe('Single Artist');
    
    // Check that history processed the single track
    expect(result.history).toBeDefined();
  });
});
