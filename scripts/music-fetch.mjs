import fs from 'node:fs/promises';
import { transformMusicData } from './music-logic.mjs';

async function run() {
  const API_KEY = process.env.LASTFM_API_KEY;
  const USER = process.env.LASTFM_USERNAME;
  const baseUrl = "http://ws.audioscrobbler.com/2.0/";
  const baseParams = `user=${USER}&api_key=${API_KEY}&format=json`;

  if (!API_KEY || !USER) {
    console.warn("⚠️ No Last.fm keys found.");
    return;
  }

  try {
    console.log(`🎵 Fetching Last.fm data for ${USER}...`);
    
    const endpoints = [
      `${baseUrl}?method=user.getinfo&${baseParams}`,
      `${baseUrl}?method=user.gettopartists&period=7day&limit=10&${baseParams}`,
      `${baseUrl}?method=user.gettopalbums&period=7day&limit=6&${baseParams}`,
      `${baseUrl}?method=user.gettopartists&period=1month&limit=10&${baseParams}`,
      `${baseUrl}?method=user.gettopalbums&period=1month&limit=6&${baseParams}`
    ];

    const responses = await Promise.all(endpoints.map(url => fetch(url)));
    const results = await Promise.all(responses.map(res => res.json()));
    
    const cleanData = transformMusicData(...results);
    
    await fs.writeFile('src/data/music.json', JSON.stringify(cleanData, null, 2));
    console.log("✅ Music data updated successfully.");
  } catch (error) {
    console.error("❌ Music sync failed:", error.message);
  }
}

run();
