import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchIntervalsData } from '../scripts/cycling-fetch.mjs';
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
    apiKey: 'mock-api-key',
  })),
}));

describe('Cycling Fetch Logic (Intervals.icu)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('fetchIntervalsData', () => {
    it('should fetch activities from Intervals.icu successfully and map them', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            id: 'i12345',
            name: 'Test Activity',
            type: 'Ride',
            distance: 10000,
            total_elevation_gain: 100,
            start_date: '2026-06-01T12:00:00Z',
            trainer: true,
            strava_id: '987654321',
          },
        ],
      });

      const activities = await fetchIntervalsData({ apiKey: 'key', athleteId: 'athlete' });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://intervals.icu/api/v1/athlete/athlete/activities?oldest='),
        expect.objectContaining({
          headers: {
            Authorization: 'Basic QVBJX0tFWTprZXk=', // API_KEY:key in base64
          },
        })
      );

      expect(activities).toHaveLength(1);
      expect(activities[0]).toEqual({
        id: 987654321,
        url: 'https://www.strava.com/activities/987654321',
        name: 'Test Activity',
        type: 'Ride',
        sport_type: 'Ride',
        distance: 10000,
        total_elevation_gain: 100,
        start_date: '2026-06-01T12:00:00Z',
        trainer: true,
        visibility: 'everyone',
      });
    });

    it('should handle activities without strava_id by falling back to intervals link', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            id: 'i12345',
            name: 'Garmin Activity',
            type: 'Ride',
            distance: 10000,
            total_elevation_gain: 100,
            start_date: '2026-06-01T12:00:00Z',
            trainer: false,
          },
        ],
      });

      const activities = await fetchIntervalsData({ apiKey: 'key', athleteId: 'athlete' });

      expect(activities).toHaveLength(1);
      expect(activities[0]).toEqual({
        id: 'i12345',
        url: 'https://intervals.icu/activities/12345',
        name: 'Garmin Activity',
        type: 'Ride',
        sport_type: 'Ride',
        distance: 10000,
        total_elevation_gain: 100,
        start_date: '2026-06-01T12:00:00Z',
        trainer: false,
        visibility: 'everyone',
      });
    });

    it('should throw an error on failed request', async () => {
      global.fetch.mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Internal Error' });
      await expect(
        fetchIntervalsData({ apiKey: 'key', athleteId: 'athlete' })
      ).rejects.toThrow('Request failed: 500 Internal Error');
    });
  });
});

describe('Music Fetch Logic', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should construct correct URLs and fetch data', async () => {
    // There are 14 API calls in total for music (1 info + 1 recent + 12 top lists)
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    await fetchMusicData({ username: 'testuser', apiKey: 'testkey' });

    expect(global.fetch).toHaveBeenCalledTimes(14);
    const firstUrl = global.fetch.mock.calls[0][0];
    const lastUrl = global.fetch.mock.calls[13][0];

    expect(firstUrl).toContain('method=user.getinfo&user=testuser&api_key=testkey');
    expect(lastUrl).toContain('method=user.gettoptracks&period=overall&limit=40');
  });

  it('should throw an error on a failed fetch', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
    });
    await expect(fetchMusicData({ username: 'testuser', apiKey: 'testkey' })).rejects.toThrow(
      'Request failed: 503 Service Unavailable'
    );
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
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('flickr.com'),
      expect.anything()
    );
    expect(data).toEqual(mockFlickrResponse);
  });

  it('should throw an error on a failed fetch', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Server Error' });
    await expect(fetchFlickrData('mock-api-key')).rejects.toThrow(
      'Request failed: 500 Server Error'
    );
  });
});
