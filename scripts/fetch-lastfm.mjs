import fs from 'node:fs/promises';
import path from 'node:path';
import 'dotenv/config';

const API_KEY = process.env.LASTFM_API_KEY;
const USERNAME = process.env.LASTFM_USERNAME;
const OUT_FILE = path.join(process.cwd(), 'src', 'data', 'music.json');
const BASE_URL = "http://ws.audioscrobbler.com/2.0/";

// Helper to construct URL
const getUrl = (method, period = '', limit = 5) => {
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
  // Get the extra-large image (index 3) if available, else large (2)
  image: a.image[3]['#text'] || a.image[2]['#text'] || ''
}));

const mapTrack = (data) => (data?.toptracks?.track || []).map(t => ({
  name: t.name,
  artist: t.artist.name,
  url: t.url,
  plays: t.playcount,
  image: t.image?.[1]['#text'] || ''
}));

const mapRecent = (data) => (data?.recenttracks?.track || []).map(t => ({
  name: t.name,
  artist: t.artist['#text'],
  album: t.album['#text'],
  url: t.url,
  image: t.image[1]['#text'] || '',
  date: t.date ? t.date['#text'] : 'Now Playing',
  nowPlaying: !!t['@attr']?.nowplaying
}));

// --- MAIN FETCH ---

async function fetchMusic() {
  if (!API_KEY || !USERNAME) return console.warn("⚠️ No Last.fm keys found.");

  console.log(`🎵 Fetching extended Last.fm data for ${USERNAME}...`);

  try {
    const [
      userRes,
      recentRes,
      // Artists
      weekArt, monthArt, allTimeArt,
      // Albums
      weekAlb, monthAlb, yearAlb,
      // Tracks
      monthTrack
    ] = await Promise.all([
      // Basics
      fetch(getUrl('user.getinfo')),
      fetch(getUrl('user.getrecenttracks', '', 15)), // Get last 15 songs

      // Artists
      fetch(getUrl('user.gettopartists', '7day', 5)),
      fetch(getUrl('user.gettopartists', '1month', 5)),
      fetch(getUrl('user.gettopartists', 'overall', 20)), // Top 20 All Time

      // Albums
      fetch(getUrl('user.gettopalbums', '7day', 5)),
      fetch(getUrl('user.gettopalbums', '1month', 5)),
      fetch(getUrl('user.gettopalbums', '12month', 12)), // Top 12 of the Year

      // Tracks
      fetch(getUrl('user.gettoptracks', '1month', 10)) // Current Obsessions
    ]);

    const output = {
      user: {
        scrobbles: parseInt((await userRes.json()).user?.playcount || 0)
      },
      recent: mapRecent(await recentRes.json()),
      artists: {
        weekly: mapArtist(await weekArt.json()),
        monthly: mapArtist(await monthArt.json()),
        allTime: mapArtist(await allTimeArt.json())
      },
      albums: {
        weekly: mapAlbum(await weekAlb.json()),
        monthly: mapAlbum(await monthAlb.json()),
        yearly: mapAlbum(await yearAlb.json())
      },
      tracks: {
        monthly: mapTrack(await monthTrack.json())
      }
    };

    await fs.writeFile(OUT_FILE, JSON.stringify(output, null, 2));
    console.log("✅ Music data updated.");

  } catch (error) {
    console.error("❌ Error fetching music:", error);
  }
}

fetchMusic();
