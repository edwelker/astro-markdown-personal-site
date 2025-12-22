import fs from 'node:fs/promises';
import { transformMusicData } from './music-logic.mjs';
async function run() {
  const params = `user=${process.env.LASTFM_USERNAME}&api_key=${process.env.LASTFM_API_KEY}&format=json`;
  const base = "http://ws.audioscrobbler.com/2.0/";
  try {
    const res = await Promise.all([
      fetch(`${base}?method=user.getinfo&${params}`),
      // 7 Day
      fetch(`${base}?method=user.gettopartists&period=7day&limit=10&${params}`),
      fetch(`${base}?method=user.gettopalbums&period=7day&limit=6&${params}`),
      fetch(`${base}?method=user.gettoptracks&period=7day&limit=10&${params}`),
      // 1 Month
      fetch(`${base}?method=user.gettopartists&period=1month&limit=10&${params}`),
      fetch(`${base}?method=user.gettopalbums&period=1month&limit=6&${params}`),
      fetch(`${base}?method=user.gettoptracks&period=1month&limit=10&${params}`),
      // 12 Month
      fetch(`${base}?method=user.gettopartists&period=12month&limit=10&${params}`),
      fetch(`${base}?method=user.gettopalbums&period=12month&limit=6&${params}`),
      fetch(`${base}?method=user.gettoptracks&period=12month&limit=10&${params}`),
      // Overall
      fetch(`${base}?method=user.gettopartists&period=overall&limit=10&${params}`),
      fetch(`${base}?method=user.gettopalbums&period=overall&limit=6&${params}`),
      fetch(`${base}?method=user.gettoptracks&period=overall&limit=10&${params}`)
    ]);
    const json = await Promise.all(res.map(r => r.json()));
    const clean = transformMusicData(...json);
    await fs.writeFile('src/data/music.json', JSON.stringify(clean, null, 2));
    console.log('✅ Music: Success');
  } catch (e) { console.error('❌ Music Failed', e); }
}
run();
