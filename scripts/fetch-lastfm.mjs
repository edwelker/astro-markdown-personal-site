import fs from 'node:fs/promises';
import path from 'node:path';
import 'dotenv/config';

const API_KEY = process.env.LASTFM_API_KEY;
const USERNAME = process.env.LASTFM_USERNAME;
const OUT_FILE = path.join(process.cwd(), 'src', 'data', 'music.json');
const BASE_URL = "http://ws.audioscrobbler.com/2.0/";

// Helper to construct URL
const getUrl = (method, period, limit = 5) =>
  `${BASE_URL}?method=${method}&user=${USERNAME}&api_key=${API_KEY}&format=json&period=${period}&limit=${limit}`;

// Helper to clean Artist data
const mapArtist = (data) => (data?.topartists?.artist || []).map(a => ({
  name: a.name,
  url: a.url,
  plays: a.playcount,
  image: a.image[2]['#text'] || ''
}));

// Helper to clean Album data
const mapAlbum = (data) => (data?.topalbums?.album || []).map(a => ({
  name: a.name,
  artist: a.artist.name,
  url: a.url,
  plays: a.playcount,
  image: a.image[2]['#text'] || ''
}));

async function fetchMusic() {
  if (!API_KEY || !USERNAME) return console.warn("⚠️ No Last.fm keys found.");

  console.log(`🎵 Fetching Last.fm data for ${USERNAME}...`);

  try {
    const [userRes, weekArt, monthArt, weekAlb, monthAlb] = await Promise.all([
      fetch(getUrl('user.getinfo')),
      fetch(getUrl('user.gettopartists', '7day', 5)),
      fetch(getUrl('user.gettopartists', '1month', 5)),
      fetch(getUrl('user.gettopalbums', '7day', 5)),
      fetch(getUrl('user.gettopalbums', '1month', 5))
    ]);

    const output = {
      user: {
        scrobbles: parseInt((await userRes.json()).user?.playcount || 0)
      },
      artists: {
        weekly: mapArtist(await weekArt.json()),
        monthly: mapArtist(await monthArt.json())
      },
      albums: {
        weekly: mapAlbum(await weekAlb.json()),
        monthly: mapAlbum(await monthAlb.json())
      }
    };

    await fs.writeFile(OUT_FILE, JSON.stringify(output, null, 2));
    console.log("✅ Music data updated.");

  } catch (error) {
    console.error("❌ Error fetching music:", error);
  }
}

fetchMusic();
