import fs from 'node:fs/promises';
import { transformTraktData } from './trakt-logic.mjs';

async function run() {
  const existing = JSON.parse(await fs.readFile('src/data/trakt.json', 'utf-8').catch(() => '{"allRatings":[]}'));
  // Ensure we handle both old nested and new flat formats during cache loading
  const flatExisting = Array.isArray(existing.allRatings) ? existing.allRatings : (existing.allRatings?.allRatings || []);
  const cache = new Map(flatExisting.map(r => [r.id, r]));

  const headers = {
    'Content-Type': 'application/json',
    'trakt-api-version': '2',
    'trakt-api-key': process.env.TRAKT_CLIENT_ID
  };

  try {
    const [mRes, sRes] = await Promise.all([
      fetch(`https://api.trakt.tv/users/${process.env.TRAKT_USERNAME}/ratings/movies?limit=500&extended=full`, { headers }),
      fetch(`https://api.trakt.tv/users/${process.env.TRAKT_USERNAME}/ratings/shows?limit=500&extended=full`, { headers })
    ]);

    const raw = [...await mRes.json(), ...await sRes.json()];

    const enriched = await Promise.all(raw.map(async (item) => {
      const imdbId = item.movie?.ids?.imdb || item.show?.ids?.imdb;
      if (cache.has(imdbId) && cache.get(imdbId).poster) return { ...item, ...cache.get(imdbId) };

      const tmdbId = item.movie?.ids?.tmdb || item.show?.ids?.tmdb;
      const type = item.movie ? 'movie' : 'tv';
      let poster = null, director = "Unknown";

      if (tmdbId && process.env.TMDB_API_KEY) {
        const [tRes, cRes] = await Promise.all([
          fetch(`https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${process.env.TMDB_API_KEY}`),
          fetch(`https://api.themoviedb.org/3/${type}/${tmdbId}/credits?api_key=${process.env.TMDB_API_KEY}`)
        ]);
        const tData = await tRes.json();
        const cData = await cRes.json();
        poster = tData.poster_path ? `https://image.tmdb.org/t/p/w500${tData.poster_path}` : null;
        director = cData.crew?.find(c => c.job === 'Director')?.name || "Unknown";
      }
      return { ...item, poster, director };
    }));

    const allRatings = transformTraktData(enriched);

    // Aggregations
    const genreMap = {}, decadeStats = {}, directorMap = {};
    enriched.forEach(item => {
      const year = item.year || item.movie?.year || item.show?.year;
      if (year) {
        const decade = Math.floor(year / 10) * 10;
        if (!decadeStats[decade]) decadeStats[decade] = { count: 0, sum: 0 };
        decadeStats[decade].count++; decadeStats[decade].sum += item.rating;
      }
      if (item.director && item.director !== "Unknown") directorMap[item.director] = (directorMap[item.director] || 0) + 1;
      (item.movie?.genres || item.show?.genres || []).forEach(g => genreMap[g] = (genreMap[g] || 0) + 1);
    });

    const sparkline = Object.entries(decadeStats).map(([d, v]) => ({
      decade: Number(d),
      score: (v.sum / v.count).toFixed(2),
      volume: v.count
    })).sort((a,b) => a.decade - b.decade);

    // THE FIX: Single-level object write
    await fs.writeFile('src/data/trakt.json', JSON.stringify({
      allRatings,
      genres: Object.entries(genreMap).sort((a,b) => b[1] - a[1]).slice(0, 10),
      directors: Object.entries(directorMap).sort((a,b) => b[1] - a[1]).slice(0, 10),
      sparkline,
      username: process.env.TRAKT_USERNAME || "ewelker",
      lastUpdated: new Date().toISOString()
    }, null, 2));

    console.log('✅ Trakt: Fixed nesting and synced.');
  } catch (e) { console.error('❌ Trakt Failed:', e); }
}
run();
