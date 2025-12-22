import fs from 'node:fs/promises';
import { transformMusicData } from './music-logic.mjs';

async function run() {
  const params = `user=${process.env.LASTFM_USERNAME}&api_key=${process.env.LASTFM_API_KEY}&format=json`;
  const base = "http://ws.audioscrobbler.com/2.0/";
  const limit = 20; // Requested limit for all categories

  try {
    const res = await Promise.all([
      fetch(`${base}?method=user.getinfo&${params}`),
      // 7 Day
      fetch(`${base}?method=user.gettopartists&period=7day&limit=${limit}&${params}`),
      fetch(`${base}?method=user.gettopalbums&period=7day&limit=${limit}&${params}`),
      fetch(`${base}?method=user.gettoptracks&period=7day&limit=${limit}&${params}`),
      // 1 Month
      fetch(`${base}?method=user.gettopartists&period=1month&limit=${limit}&${params}`),
      fetch(`${base}?method=user.gettopalbums&period=1month&limit=${limit}&${params}`),
      fetch(`${base}?method=user.gettoptracks&period=1month&limit=${limit}&${params}`),
      // 12 Month
      fetch(`${base}?method=user.gettopartists&period=12month&limit=${limit}&${params}`),
      fetch(`${base}?method=user.gettopalbums&period=12month&limit=${limit}&${params}`),
      fetch(`${base}?method=user.gettoptracks&period=12month&limit=${limit}&${params}`),
      // Overall
      fetch(`${base}?method=user.gettopartists&period=overall&limit=${limit}&${params}`),
      fetch(`${base}?method=user.gettopalbums&period=overall&limit=${limit}&${params}`),
      fetch(`${base}?method=user.gettoptracks&period=overall&limit=${limit}&${params}`)
    ]);

    const json = await Promise.all(res.map(r => r.json()));
    const clean = transformMusicData(...json);
    await fs.writeFile('src/data/music.json', JSON.stringify(clean, null, 2));
    console.log('✅ Music: Success (Fetched top 20 for all categories)');
  } catch (e) { 
    console.error('❌ Music Fetch Failed', e); 
  }
}

run();
