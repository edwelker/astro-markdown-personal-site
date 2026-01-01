import fs from 'node:fs/promises';
import { runETL, mapConcurrent } from './lib-etl.mjs';
import { transformTraktData } from './trakt-logic.mjs';

const CONCURRENCY_LIMIT = 5;

export async function enrichItem(item, { cache, apiKey }) {
  const imdbId = item.movie?.ids?.imdb || item.show?.ids?.imdb;
  if (imdbId && cache.has(imdbId) && cache.get(imdbId).poster) {
    return { ...item, ...cache.get(imdbId) };
  }

  const tmdbId = item.movie?.ids?.tmdb || item.show?.ids?.tmdb;
  const type = item.movie ? 'movie' : 'tv';
  let poster = null, director = "Unknown";

  if (tmdbId && apiKey) {
    try {
      const [tRes, cRes] = await Promise.all([
        fetch(`https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${apiKey}`),
        fetch(`https://api.themoviedb.org/3/${type}/${tmdbId}/credits?api_key=${apiKey}`)
      ]);
      
      const tData = await tRes.json();
      const cData = await cRes.json();
      
      poster = tData.poster_path ? `https://image.tmdb.org/t/p/w500${tData.poster_path}` : null;
      director = cData.crew?.find(c => c.job === 'Director')?.name || "Unknown";
    } catch (err) {
      console.warn(`⚠️ TMDB enrichment failed for ${type} id ${tmdbId}`);
    }
  }
  return { ...item, poster, director };
}

export async function fetchAndEnrichTraktData({ clientId, username, tmdbApiKey, dataPath }) {
  const existingRaw = await fs.readFile(dataPath, 'utf-8').catch(() => '{"allRatings":[]}');
  const existing = JSON.parse(existingRaw);
  const flatExisting = Array.isArray(existing.allRatings) ? existing.allRatings : (existing.allRatings?.allRatings || []);
  const cache = new Map(flatExisting.map(r => [r.imdbId, r]));

  const headers = {
    'Content-Type': 'application/json',
    'trakt-api-version': '2',
    'trakt-api-key': clientId
  };
  
  console.log('... Fetching Trakt ratings...');
  const [mRes, sRes] = await Promise.all([
    fetch(`https://api.trakt.tv/users/${username}/ratings/movies?limit=1000&extended=full`, { headers }),
    fetch(`https://api.trakt.tv/users/${username}/ratings/shows?limit=1000&extended=full`, { headers })
  ]);
  if (!mRes.ok || !sRes.ok) throw new Error('Failed to fetch from Trakt');
  
  const raw = [...await mRes.json(), ...await sRes.json()];
  
  console.log(`... Enriching ${raw.length} items with TMDB data...`);
  return mapConcurrent(raw, CONCURRENCY_LIMIT, (item) => enrichItem(item, { cache, apiKey: tmdbApiKey }));
}

export function transformAndAggregateTraktData(enriched, { username }) {
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

  return {
    allRatings,
    genres: Object.entries(genreMap).sort((a,b) => b[1] - a[1]).slice(0, 10),
    directors: Object.entries(directorMap).sort((a,b) => b[1] - a[1]).slice(0, 10),
    sparkline: Object.entries(decadeStats).map(([d, v]) => ({
      decade: Number(d),
      score: (v.sum / v.count).toFixed(2),
      volume: v.count
    })).sort((a,b) => a.decade - b.decade),
    username: username || "ewelker",
    lastUpdated: new Date().toISOString()
  };
}

export async function run() {
  const outFile = 'src/data/trakt.json';
  // Use the committed cache file to seed the enrichment process
  const cacheFile = 'src/data/cache/trakt.json';

  await runETL({
    name: 'Trakt',
    fetcher: () => fetchAndEnrichTraktData({
      clientId: process.env.TRAKT_CLIENT_ID,
      username: process.env.TRAKT_USERNAME,
      tmdbApiKey: process.env.TMDB_API_KEY,
      dataPath: cacheFile
    }),
    transform: (data) => transformAndAggregateTraktData(data, { 
      username: process.env.TRAKT_USERNAME 
    }),
    outFile: outFile,
    defaultData: { allRatings: [], genres: [], directors: [], sparkline: [], username: "ewelker", lastUpdated: "never" }
  });
}

// This allows the script to be run directly, or imported by a parallel runner.
/* v8 ignore next 3 */
if (process.argv[1] === new URL(import.meta.url).pathname) {
  run();
}
