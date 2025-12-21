import fs from 'node:fs/promises';
import { transformTraktData } from './trakt-logic.mjs';

async function run() {
  const USER = process.env.TRAKT_USERNAME;
  const CLIENT_ID = process.env.TRAKT_CLIENT_ID;
  const TMDB_KEY = process.env.TMDB_API_KEY;
  const headers = { 'Content-Type': 'application/json', 'trakt-api-version': '2', 'trakt-api-key': CLIENT_ID };

  try {
    const [mRes, sRes] = await Promise.all([
      fetch(`https://api.trakt.tv/users/${USER}/ratings/movies?limit=500&extended=full`, { headers }),
      fetch(`https://api.trakt.tv/users/${USER}/ratings/shows?limit=500&extended=full`, { headers })
    ]);

    const movies = await mRes.json();
    const shows = await sRes.json();
    
    const uniqueMap = new Map();
    [...movies, ...shows].forEach(item => {
      const id = item.movie?.ids?.imdb || item.show?.ids?.imdb;
      if (id && !uniqueMap.has(id)) uniqueMap.set(id, item);
    });
    const raw = Array.from(uniqueMap.values()).sort((a, b) => new Date(b.rated_at) - new Date(a.rated_at));

    const genreMap = {};
    const directorMap = {};
    const decadeStats = {};

    const enriched = await Promise.all(raw.map(async (item) => {
      const tmdbId = item.movie?.ids?.tmdb || item.show?.ids?.tmdb;
      const type = item.movie ? 'movie' : 'tv';
      let poster = null, director = "Unknown";

      if (tmdbId && TMDB_KEY) {
        const [cRes, tRes] = await Promise.all([
          fetch(`https://api.themoviedb.org/3/${type}/${tmdbId}/credits?api_key=${TMDB_KEY}`),
          fetch(`https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${TMDB_KEY}`)
        ]);
        const credits = await cRes.json();
        const tmdbData = await tRes.json();

        if (item.movie) {
          const d = credits.crew?.find(c => c.job === 'Director');
          if (d) {
            director = d.name;
            directorMap[d.name] = (directorMap[d.name] || 0) + 1;
          }
        }
        if (tmdbData.poster_path) poster = `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}`;
      }

      const year = item.movie?.year || item.show?.year;
      if (year) {
        const decade = Math.floor(year / 10) * 10;
        if (!decadeStats[decade]) decadeStats[decade] = { count: 0, sum: 0 };
        decadeStats[decade].count++;
        decadeStats[decade].sum += item.rating;
      }
      
      (item.movie?.genres || item.show?.genres || []).forEach(g => genreMap[g] = (genreMap[g] || 0) + 1);

      return { ...item, poster, director, year };
    }));

    const sparkline = Object.entries(decadeStats).map(([decade, val]) => ({
      decade: Number(decade),
      score: (val.sum / val.count).toFixed(2),
      volume: val.count
    })).sort((a,b) => a.decade - b.decade);

    const output = {
      lastUpdated: new Date().toISOString(),
      allRatings: transformTraktData(enriched),
      genres: Object.entries(genreMap).sort((a,b) => b[1] - a[1]).slice(0, 10),
      directors: Object.entries(directorMap).sort((a,b) => b[1] - a[1]).slice(0, 10),
      sparkline
    };

    await fs.writeFile('src/data/trakt.json', JSON.stringify(output, null, 2));
    console.log('✅ trakt: synced stats, directors, and graph data.');
  } catch (e) {
    console.error('❌ trakt failed:', e.message);
  }
}
run();
