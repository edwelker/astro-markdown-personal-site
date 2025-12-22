import fs from 'node:fs/promises';
import dotenv from 'dotenv';
dotenv.config();

// --- CONFIG ---
const USER = process.env.LASTFM_USERNAME;
const API_KEY = process.env.LASTFM_API_KEY;
const OUT_FILE = './src/data/music_history.json';
const PAGES_TO_FETCH = 200; // ~40k tracks (approx 2-3 years)

const delay = (ms) => new Promise(r => setTimeout(r, ms));

async function fetchHistory() {
  console.log(`Starting generic history fetch for user: ${USER}...`);
  let allTracks = [];
  let page = 1;

  try {
    while (page <= PAGES_TO_FETCH) {
      const url = `http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${USER}&api_key=${API_KEY}&format=json&limit=200&page=${page}`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error(`API 404/500 on page ${page}`);
      
      const data = await res.json();
      const tracks = data.recenttracks.track;
      
      if (!tracks || tracks.length === 0) break;
      
      // Filter out "now playing" (no date)
      const clean = tracks.filter(t => t.date);
      allTracks = allTracks.concat(clean);
      
      process.stdout.write(`\rFetched Page ${page}: Total ${allTracks.length} tracks...`);
      page++;
      await delay(200); // Polite rate limit
    }
  } catch (e) {
    console.error("\nFetch stopped early:", e.message);
  }

  console.log(`\nSaving ${allTracks.length} tracks to ${OUT_FILE}...`);
  
  // Minimal transformation to save space
  const minified = allTracks.map(t => ({
    a: t.artist['#text'],
    b: t.album['#text'],
    n: t.name,
    d: parseInt(t.date.uts)
  }));

  await fs.writeFile(OUT_FILE, JSON.stringify(minified), 'utf-8');
  console.log("✅ History Saved.");
}

fetchHistory();
