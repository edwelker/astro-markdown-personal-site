import { describe, it, expect, vi, beforeEach } from 'vitest';
import { run as runCycling } from '../scripts/cycling-fetch.mjs';
import { run as runMusic } from '../scripts/music-fetch.mjs';
import { run as runFlickr } from '../scripts/flickr-fetch.mjs';
import { runETL } from '../scripts/lib-etl.mjs';

vi.mock('../scripts/lib-etl.mjs', () => ({
  runETL: vi.fn(),
  mapConcurrent: vi.fn(),
  writeFile: vi.fn()
}));

describe('ETL Runners', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.STRAVA_CLIENT_ID = 'id';
    process.env.STRAVA_CLIENT_SECRET = 'secret';
    process.env.STRAVA_REFRESH_TOKEN = 'token';
    process.env.LASTFM_USERNAME = 'user';
    process.env.LASTFM_API_KEY = 'key';
    process.env.FLICKR_API_KEY = 'key';
    process.env.FLICKR_USER_ID = 'id';
  });

  it('should run cycling ETL', async () => {
    await runCycling();
    expect(runETL).toHaveBeenCalledWith(expect.objectContaining({ name: 'Strava' }));
  });

  it('should run music ETL', async () => {
    await runMusic();
    expect(runETL).toHaveBeenCalledWith(expect.objectContaining({ name: 'Music' }));
  });

  it('should run flickr ETL', async () => {
    await runFlickr();
    expect(runETL).toHaveBeenCalledWith(expect.objectContaining({ name: 'Flickr' }));
  });
});
