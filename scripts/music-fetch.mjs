import { runETL } from './lib-etl.mjs';
import { transformMusicData } from './music-logic.mjs';

const periods = ['7day', '3month', '12month', 'overall'];
const types = ['gettopartists', 'gettopalbums', 'gettoptracks'];
const limit = 40;

export async function fetchMusicData({ username, apiKey }) {
  if (!username || !apiKey) throw new Error('LASTFM_USERNAME and LASTFM_API_KEY must be set');
  const params = `user=${username}&api_key=${apiKey}&format=json`;
  const base = "http://ws.audioscrobbler.com/2.0/";

  const urls = [
    `${base}?method=user.getinfo&${params}`,
    ...periods.flatMap(period =>
      types.map(type => `${base}?method=user.${type}&period=${period}&limit=${limit}&${params}`)
    )
  ];

  const responses = await Promise.all(urls.map(url => fetch(url)));
  for (const response of responses) {
    if (!response.ok) throw new Error(`HTTP ${response.status} for ${response.url}`);
  }
  return Promise.all(responses.map(r => r.json()));
}

// Wrapper to match the signature expected by runETL and transformMusicData
function transform(rawData) {
  return transformMusicData(...rawData);
}

export async function run() {
  await runETL({
    name: 'Music',
    fetcher: () => fetchMusicData({ 
      username: process.env.LASTFM_USERNAME, 
      apiKey: process.env.LASTFM_API_KEY 
    }),
    transform,
    outFile: 'src/data/music.json'
  });
}

// This allows the script to be run directly, or imported by a parallel runner.
if (process.argv[1] === new URL(import.meta.url).pathname) {
  run();
}
