import fs from 'node:fs/promises';
import path from 'node:path';
import 'dotenv/config';

const API_KEY = process.env.LASTFM_API_KEY;
const USERNAME = process.env.LASTFM_USERNAME;
const OUT_FILE = path.join(process.cwd(), 'src', 'data', 'music.json');
const BASE_URL = "http://ws.audioscrobbler.com/2.0/";

// Helper to construct URL
const getUrl = (method, period = '', limit = 10) => {
  let url = `${BASE_URL}?method=${method}&user=${USERNAME}&api_key=${API_KEY}&format=json&limit=${limit}`;
  if (period) url += `&period=${period}`;
  return url;
};

// --- DATA MAPPERS ---
const mapArtist = (data) => (data?.topartists?.artist || []).map(a => ({
  name: a.name,
  url: a.url,
  plays: a.playcount,
  image: a.image[2]['#text'] || ''
}));

const mapAlbum = (data) => (data?.topalbums?.album || []).map(a => ({
  name: a.name,
  artist: a.artist.name,
  url: a.url,
  plays: a.playcount,
  // Try to get extra large image (3), fall back to large (2)
  image: a.image[3]['#text'] || a.image[2]['#text'] || ''
}));

async function fetchMusic() {
  if (!API_KEY || !USERNAME) return console.warn("⚠️ No Last.fm keys found.");

  console.log(`🎵 Fetching Last.fm data for ${USERNAME}...`);

  try {
    const [
      userRes,
      // Week
      weekArt, weekAlb,
      // Month
      monthArt, monthAlb,
      // Year
      yearArt, yearAlb,
      // All Time
      allTimeArt, allTimeAlb
    ] = await Promise.all([
      fetch(getUrl('user.getinfo')),

      // 7 Days (Fetch 10 of each)
      fetch(getUrl('user.gettopartists', '7day', 10)),
      fetch(getUrl('user.gettopalbums', '7day', 6)), // 6 albums for a nice grid

      // 1 Month (Fetch 10 of each)
      fetch(getUrl('user.gettopartists', '1month', 10)),
      fetch(getUrl('user.gettopalbums', '1month', 6)),

      // 12 Months (Fetch 20 artists, 12 albums)
      fetch(getUrl('user.gettopartists', '12month', 20)),
      fetch(getUrl('user.gettopalbums', '12month', 12)),

      // Overall (Fetch 20 artists, 12 albums)
      fetch(getUrl('user.gettopartists', 'overall', 20)),
      fetch(getUrl('user.gettopalbums', 'overall', 12)),
    ]);

    const output = {
      user: {
        scrobbles: parseInt((await userRes.json()).user?.playcount || 0)
      },
      week: {
        artists: mapArtist(await weekArt.json()),
        albums: mapAlbum(await weekAlb.json())
      },
      month: {
        artists: mapArtist(await monthArt.json()),
        albums: mapAlbum(await monthAlb.json())
      },
      year: {
        artists: mapArtist(await yearArt.json()),
        albums: mapAlbum(await yearAlb.json())
      },
      allTime: {
        artists: mapArtist(await allTimeArt.json()),
        albums: mapAlbum(await allTimeAlb.json())
      }
    };

    await fs.writeFile(OUT_FILE, JSON.stringify(output, null, 2));
    console.log("✅ Music data updated.");

  } catch (error) {
    console.error("❌ Error fetching music:", error);
  }
}

fetchMusic();
