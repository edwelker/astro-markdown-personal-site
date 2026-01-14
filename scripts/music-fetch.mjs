import { runETL } from './lib-etl.mjs';
import { transformMusicData } from './music-logic.mjs';
import { validateEnv } from './lib-credentials.mjs';
import { fetchOrThrow, runIfMain } from './lib-utils.mjs';

const periods = ['7day', '3month', '12month', 'overall'];
const types = ['gettopartists', 'gettopalbums', 'gettoptracks'];
const limit = 40;
const recentLimit = 1000; 

// Local helper to fetch URLs with concurrency while strictly preserving order
async function fetchInOrder(urls, concurrency) {
  const results = new Array(urls.length);
  let nextIndex = 0;

  const worker = async () => {
    while (nextIndex < urls.length) {
      const index = nextIndex++;
      // Capture index in closure to ensure result goes to correct slot
      results[index] = await fetchOrThrow(urls[index]);
    }
  };

  const workers = Array.from(
    { length: Math.min(concurrency, urls.length) }, 
    () => worker()
  );
  
  await Promise.all(workers);
  return results;
}

export async function fetchMusicData({ username, apiKey }) {
  const params = `user=${username}&api_key=${apiKey}&format=json&_=${Date.now()}`;
  const base = 'https://ws.audioscrobbler.com/2.0/';

  // Calculate timestamp for 15 days ago
  const from = Math.floor(Date.now() / 1000) - 15 * 24 * 60 * 60;

  const urls = [
    `${base}?method=user.getinfo&${params}`,
    // Fetch recent tracks for detailed history
    `${base}?method=user.getrecenttracks&limit=${recentLimit}&from=${from}&${params}`,
    ...periods.flatMap((period) =>
      types.map((type) => `${base}?method=user.${type}&period=${period}&limit=${limit}&${params}`)
    ),
  ];

  // Use local helper instead of mapConcurrent to ensure order
  const responses = await fetchInOrder(urls, 2);
  return Promise.all(responses.map((r) => r.json()));
}

// Wrapper to match the signature expected by runETL and transformMusicData
function transform(rawData) {
  return transformMusicData(...rawData);
}

export async function run() {
  const creds = validateEnv(
    {
      username: 'LASTFM_USERNAME',
      apiKey: 'LASTFM_API_KEY',
    },
    'Last.fm'
  );

  await runETL({
    name: 'Music',
    fetcher: () => fetchMusicData(creds),
    transform,
    outFile: 'src/data/music.json',
  });
}

runIfMain(import.meta.url, run);
