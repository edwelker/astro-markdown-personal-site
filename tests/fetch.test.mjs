import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getStravaAccessToken, fetchCyclingData } from '../scripts/cycling-fetch.mjs';
import { fetchMusicData } from '../scripts/music-fetch.mjs';
import { fetchFlickrData } from '../scripts/flickr-fetch.mjs';

// Mock the global fetch function
global.fetch = vi.fn();

describe('Cycling Fetch Logic', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getStravaAccessToken', () => {
    it('should throw an error if required credentials are not provided', async () => {
      await expect(getStravaAccessToken({})).rejects.toThrow(
        'STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, and STRAVA_REFRESH_TOKEN must be set'
      );
    });

    it('should return an access token on successful authentication', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'test_token' }),
      });

      const token = await getStravaAccessToken({
        clientId: 'id',
        clientSecret: 'secret',
        refreshToken: 'refresh',
      });

      expect(global.fetch).toHaveBeenCalledWith('https://www.strava.com/oauth/token', expect.any(Object));
      expect(token).toBe('test_token');
    });

    it('should throw an error on failed authentication', async () => {
      global.fetch.mockResolvedValueOnce({ ok: false, status: 401 });

      await expect(
        getStravaAccessToken({ clientId: 'id', clientSecret: 'secret', refreshToken: 'refresh' })
      ).rejects.toThrow('Strava auth failed: HTTP 401');
    });
  });

  describe('fetchCyclingData', () => {
    it('should fetch and paginate through all activities for the current year', async () => {
      const currentYear = new Date().getFullYear();
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [
            { id: 1, start_date: `${currentYear}-06-01T00:00:00Z` },
            { id: 2, start_date: `${currentYear}-07-01T00:00:00Z` },
          ],
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [
            { id: 3, start_date: `${currentYear}-08-01T00:00:00Z` },
            { id: 4, start_date: `${currentYear - 1}-06-01T00:00:00Z` }, // Should stop pagination here
          ],
        });
        
      const activities = await fetchCyclingData({ token: 'test_token' });
      
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(activities).toHaveLength(3);
      expect(activities.map(a => a.id)).toEqual([1, 2, 3]);
    });

    it('should stop fetching if an empty list is returned', async () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [{ id: 1, start_date: `${new Date().getFullYear()}-06-01T00:00:00Z` }],
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [], // Empty response
        });
        
      await fetchCyclingData({ token: 'test_token' });
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should throw an error if the fetch fails', async () => {
      global.fetch.mockResolvedValueOnce({ ok: false, status: 500 });
      await expect(fetchCyclingData({ token: 'test_token' })).rejects.toThrow('Strava activities fetch failed: HTTP 500');
    });
  });
});

describe('Music Fetch Logic', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should throw an error if required credentials are not provided', async () => {
    await expect(fetchMusicData({})).rejects.toThrow('LASTFM_USERNAME and LASTFM_API_KEY must be set');
  });

  it('should construct correct URLs and fetch data', async () => {
    // There are 13 API calls in total for music
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({})
    });

    await fetchMusicData({ username: 'testuser', apiKey: 'testkey' });

    expect(global.fetch).toHaveBeenCalledTimes(13);
    const firstUrl = global.fetch.mock.calls[0][0];
    const lastUrl = global.fetch.mock.calls[12][0];

    expect(firstUrl).toContain('method=user.getinfo&user=testuser&api_key=testkey');
    expect(lastUrl).toContain('method=user.gettoptracks&period=overall&limit=40');
  });

  it('should throw an error on a failed fetch', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, status: 503 });
    await expect(fetchMusicData({ username: 'testuser', apiKey: 'testkey' })).rejects.toThrow('HTTP 503');
  });
});

describe('Flickr Fetch Logic', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should fetch flickr data successfully', async () => {
    const mockFlickrResponse = { photos: { photo: [{ id: '1' }] } };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockFlickrResponse,
    });

    const data = await fetchFlickrData();

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('flickr.com'));
    expect(data).toEqual(mockFlickrResponse);
  });

  it('should throw an error on a failed fetch', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, status: 500 });
    await expect(fetchFlickrData()).rejects.toThrow('HTTP 500');
  });
});
