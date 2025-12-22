import fs from 'node:fs/promises';
import { transformTraktData } from './trakt-logic.mjs';

const CONCURRENCY_LIMIT = 5; // Total of 10 TMDB requests in flight at once

async function enrichItem(item, cache) {
  const imdbId = item.movie?.ids?.imdb || item.show?.ids?.imdb;
  
  if (imdbId && cache.has(imdbId) && cache.get(imdbId).poster) {
    return { ...item, ...cache.get(imdbId) };
  }

  const tmdbId = item.movie?.ids?.tmdb || item.show?.ids?.tmdb;
  const type = item.movie ? 'movie' : 'tv';
  let poster = null, director = "Unknown";

  if (tmdbId && process.env.TMDB_API_KEY) {
    try {
      const [tRes, cRes] = await Promise.all([
        fetch(`https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${process.env.TMDB_API_KEY}`),
        fetch(`https://api.themoviedb.org/3/${type}/${tmdbId}/credits?api_key=${process.env.TMDB_API_KEY}`)
      ]);
      
      const tData = await tRes.json();
      const cData = await cRes.json();
      
      poster = tData.poster_path ? `https://image.tmdb.org/t/p/w500${tData.poster_path}` : null;
      director = cData.crew?.find(c => c.job === 'Director')?.name || "Unknown";
    } catch (err) {
      console.warn(`⚠️ TMDB failed: ${tmdbId}`);
    }
  }
  return { ...item, poster, director };
}

async function mapConcurrent(items, limit, fn) {
  const results = [];
  const executing = new Set();
  for (const item of items) {
    const p = Promise.resolve().then(() => fn(item)).then(res => {
      executing.delete(p);
      return res;
    });
    executing.add(p);
    results.push(p);
    if (executing.size >= limit) {
      await Promise.race(executing);
    }
  }
  return Promise.all(results);
}

async function run() {
  const dataPath = 'src/data/trakt.json';
  const existingRaw = await fs.readFile(dataPath, 'utf-8').catch(() => '{"allRatings":[]}');
  const existing = JSON.parse(existingRaw);
  const flatExisting = Array.isArray(existing.allRatings) ? existing.allRatings : (existing.allRatings?.allRatings || []);
  const cache = new Map(flatExisting.map(r => [r.imdbId, r]));

  const headers = {
    'Content-Type': 'application/json',
    'trakt-api-version': '2',
    'trakt-api-key': process.env.TRAKT_CLIENT_ID
  };

  try {
    console.log('📡 Fetching Trakt data...');
    const [mRes, sRes] = await Promise.all([
      fetch(`https://api.trakt.tv/users/${process.env.TRAKT_USERNAME}/ratings/movies?limit=1000&extended=full`, { headers }),
      fetch(`https://api.trakt.tv/users/${process.env.TRAKT_USERNAME}/ratings/shows?limit=1000&extended=full`, { headers })
    ]);

    const raw = [...await mRes.json(), ...await sRes.json()];
    
    console.log(`🚀 Enriching ${raw.length} items (Concurrency: ${CONCURRENCY_LIMIT})...`);
    const enriched = await mapConcurrent(raw, CONCURRENCY_LIMIT, (item) => enrichItem(item, cache));

    const allRatings = transformTraktData(enriched);
    const genreMap = {}, decadeStats = {}, directorMap = {};

    enriched.forEach(item => {
      const year = item.year || item.movie?.year || item.show?.year;
      if (year) {
        const decade = Math.floor(year / 10) * 10;
        if (!decadeStats[decade]) decadeStats[decade] = { count: 0, sum: 0 };
        decadeStats[decade].count++; 
        decadeStats[decade].sum += item.rating;
      }
      if (item.director && item.director !== "Unknown") {
        directorMap[item.director] = (directorMap[item.director] || 0) + 1;
      }
      (item.movie?.genres || item.show?.genres || []).forEach(g => {
        genreMap[g] = (genreMap[g] || 0) + 1;
      });
    });

    await fs.writeFile(dataPath, JSON.stringify({
      allRatings,
      genres: Object.entries(genreMap).sort((a,b) => b[1] - a[1]).slice(0, 10),
      directors: Object.entries(directorMap).sort((a,b) => b[1] - a[1]).slice(0, 10),
      sparkline: Object.entries(decadeStats).map(([d, v]) => ({
        decade: Number(d),
        score: (v.sum / v.count).toFixed(2),
        volume: v.count
      })).sort((a,b) => a.decade - b.decade),
      username: process.env.TRAKT_USERNAME || "ewelker",
      lastUpdated: new Date().toISOString()
    }, null, 2));

    console.log(`✅ Trakt: Sync complete.`);
  } catch (e) { 
    console.error('❌ Trakt Failed:', e); 
  }
}
run();
