import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getStravaAccessToken, fetchCyclingData } from '../scripts/cycling-fetch.mjs';
import { fetchMusicData } from '../scripts/music-fetch.mjs';
import { fetchFlickrData } from '../scripts/flickr-fetch.mjs';

// Mock the global fetch function
global.fetch = vi.fn();

// Mock credentials validation to avoid needing actual env vars during tests
vi.mock('../scripts/lib-credentials.mjs', () => ({
  validateEnv: vi.fn(() => ({
    clientId: 'mock-client-id',
    clientSecret: 'mock-secret',
    refreshToken: 'mock-refresh',
    username: 'mock-user',
    apiKey: 'mock-api-key'
  }))
}));

describe('Cycling Fetch Logic', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getStravaAccessToken', () => {
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
      global.fetch.mockResolvedValueOnce({ ok: false, status: 401, statusText: 'Unauthorized' });

      await expect(
        getStravaAccessToken({ clientId: 'id', clientSecret: 'secret', refreshToken: 'refresh' })
      ).rejects.toThrow('Request failed: 401 Unauthorized');
    });
  });

  describe('fetchCyclingData', () => {
    it('should fetch and paginate through activities (15 months window)', async () => {
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
            { id: 4, start_date: `${currentYear - 1}-06-01T00:00:00Z` }, 
          ],
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [
             // Older than 15 months (approx 2 years ago)
            { id: 5, start_date: `${currentYear - 2}-06-01T00:00:00Z` },
          ],
        });
        
      const activities = await fetchCyclingData({ token: 'test_token' });
      
      expect(global.fetch).toHaveBeenCalledTimes(3);
      // It should include id 1, 2, 3, 4. id 5 is excluded by date check.
      expect(activities).toHaveLength(4);
      expect(activities.map(a => a.id)).toEqual([1, 2, 3, 4]);
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
      global.fetch.mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Server Error' });
      await expect(fetchCyclingData({ token: 'test_token' })).rejects.toThrow('Request failed: 500 Server Error');
    });
  });
});

describe('Music Fetch Logic', () => {
  beforeEach(() => {
    vi.resetAllMocks();
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
    global.fetch.mockResolvedValueOnce({ ok: false, status: 503, statusText: 'Service Unavailable' });
    await expect(fetchMusicData({ username: 'testuser', apiKey: 'testkey' })).rejects.toThrow('Request failed: 503 Service Unavailable');
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

    const data = await fetchFlickrData('mock-api-key');

    expect(global.fetch).toHaveBeenCalledTimes(1);
    // fetchOrThrow adds a second argument (options object), so we need to account for that
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('flickr.com'), expect.anything());
    expect(data).toEqual(mockFlickrResponse);
  });

  it('should throw an error on a failed fetch', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Server Error' });
    await expect(fetchFlickrData('mock-api-key')).rejects.toThrow('Request failed: 500 Server Error');
  });
});
