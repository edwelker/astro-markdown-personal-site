import { runETL, mapConcurrent } from './lib-etl.mjs';
import { transformMusicData } from './music-logic.mjs';
import { validateEnv } from './lib-credentials.mjs';
import { fetchOrThrow, runIfMain } from './lib-utils.mjs';

const periods = ['7day', '3month', '12month', 'overall'];
const types = ['gettopartists', 'gettopalbums', 'gettoptracks'];
const limit = 40;

export async function fetchMusicData({ username, apiKey }) {
  const params = `user=${username}&api_key=${apiKey}&format=json&_=${Date.now()}`;
  const base = "https://ws.audioscrobbler.com/2.0/";

  const urls = [
    `${base}?method=user.getinfo&${params}`,
    ...periods.flatMap(period =>
      types.map(type => `${base}?method=user.${type}&period=${period}&limit=${limit}&${params}`)
    )
  ];

  const responses = await mapConcurrent(urls, 2, url => fetchOrThrow(url));
  return Promise.all(responses.map(r => r.json()));
}

// Wrapper to match the signature expected by runETL and transformMusicData
function transform(rawData) {
  return transformMusicData(...rawData);
}

export async function run() {
  const creds = validateEnv({
    username: 'LASTFM_USERNAME',
    apiKey: 'LASTFM_API_KEY'
  }, 'Last.fm');

  await runETL({
    name: 'Music',
    fetcher: () => fetchMusicData(creds),
    transform,
    outFile: 'src/data/music.json'
  });
}

runIfMain(import.meta.url, run);
