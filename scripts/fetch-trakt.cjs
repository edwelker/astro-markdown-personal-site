const fs = require('fs');
const path = require('path');
const https = require('https');

async function downloadImage(url, filename) {
  const localPath = path.join(__dirname, '../public/posters', filename);
  if (fs.existsSync(localPath)) return `/posters/${filename}`;
  return new Promise((resolve) => {
    const file = fs.createWriteStream(localPath);
    https.get(url, (res) => {
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(`/posters/${filename}`); });
    }).on('error', () => resolve(null));
  });
}

const shuffle = (array) => array.sort(() => Math.random() - 0.5);

async function fetchTraktRatings() {
  const CLIENT_ID = process.env.TRAKT_CLIENT_ID;
  const USERNAME = process.env.TRAKT_USERNAME;
  const TMDB_KEY = process.env.TMDB_API_KEY;
  if (!CLIENT_ID || !USERNAME) return;

  const headers = { 'Content-Type': 'application/json', 'trakt-api-version': '2', 'trakt-api-key': CLIENT_ID };

  try {
    const [mRes, sRes] = await Promise.all([
      fetch(`https://api.trakt.tv/users/${USERNAME}/ratings/movies?limit=500&extended=full`, { headers }),
      fetch(`https://api.trakt.tv/users/${USERNAME}/ratings/shows?limit=500&extended=full`, { headers })
    ]);

    const movies = await mRes.json();
    const shows = await sRes.json();
    
    const uniqueMap = new Map();
    [...movies, ...shows].forEach(item => {
      const id = item.movie?.ids?.imdb || item.show?.ids?.imdb;
      if (id && !uniqueMap.has(id)) {
        uniqueMap.set(id, item);
      }
    });

    const allRaw = Array.from(uniqueMap.values()).sort((a, b) => new Date(b.rated_at) - new Date(a.rated_at));

    const genreMap = {};
    const directorMap = {};
    const actorMap = {};
    const decadeStats = {};

    // Filter and shuffle categories for enrichment
    const tens = allRaw.filter(i => i.rating === 10);
    const nines = shuffle(allRaw.filter(i => i.rating === 9)).slice(0, 10);
    const eights = shuffle(allRaw.filter(i => i.rating === 8)).slice(0, 10);
    const sixToSeven = shuffle(allRaw.filter(i => i.rating >= 6 && i.rating < 8)).slice(0, 10);
    const fiveBelow = shuffle(allRaw.filter(i => i.rating < 6)).slice(0, 10);

    const rawToEnrich = [...allRaw.slice(0, 20), ...tens, ...nines, ...eights, ...sixToSeven, ...fiveBelow];
    const uniqueEnrichIds = Array.from(new Set(rawToEnrich.map(i => i.movie?.ids?.imdb || i.show?.ids?.imdb)));
    const toEnrich = uniqueEnrichIds.map(id => uniqueMap.get(id));

    const enriched = await Promise.all(toEnrich.map(async (item) => {
      const tmdbId = item.movie?.ids?.tmdb || item.show?.ids?.tmdb;
      const type = item.movie ? 'movie' : 'tv';
      let poster = null;
      let director = "Unknown";
      let directorId = null;

      if (tmdbId && TMDB_KEY) {
        const creditsRes = await fetch(`https://api.themoviedb.org/3/${type}/${tmdbId}/credits?api_key=${TMDB_KEY}`);
        const credits = await creditsRes.json();
        
        if (item.movie) {
          credits.crew?.filter(c => c.job === 'Director').forEach(d => {
            director = d.name;
            directorId = d.id;
            directorMap[d.name] = { count: (directorMap[d.name]?.count || 0) + 1, id: d.id };
          });
        }
        credits.cast?.slice(0, 5).forEach(a => {
          actorMap[a.name] = (actorMap[a.name] || 0) + 1;
        });

        const tmdbRes = await fetch(`https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${TMDB_KEY}`);
        const tmdbData = await tmdbRes.json();
        if (tmdbData.poster_path) {
          poster = await downloadImage(`https://image.tmdb.org/t/p/w500${tmdbData.poster_path}`, `${type}-${tmdbId}.jpg`);
        }
      }

      return {
        title: item.movie?.title || item.show?.title,
        year: item.movie?.year || item.show?.year,
        rating: item.rating,
        director,
        directorId,
        href: item.movie ? `https://www.imdb.com/title/${item.movie.ids.imdb}` : `https://www.imdb.com/title/${item.show.ids.imdb}`,
        poster
      };
    }));

    allRaw.forEach(item => {
      const year = item.movie?.year || item.show?.year;
      if (year) {
        const decade = Math.floor(year / 10) * 10;
        if (!decadeStats[decade]) decadeStats[decade] = { count: 0, sum: 0 };
        decadeStats[decade].count++;
        decadeStats[decade].sum += item.rating;
      }
      const itemGenres = item.movie?.genres || item.show?.genres || [];
      itemGenres.forEach(g => genreMap[g] = (genreMap[g] || 0) + 1);
    });

    const sparkline = Object.entries(decadeStats).map(([decade, val]) => ({
      decade: Number(decade),
      score: (val.sum / val.count).toFixed(2),
      volume: val.count
    })).sort((a,b) => a.decade - b.decade);

    fs.writeFileSync(path.join(__dirname, '../src/data/trakt.json'), JSON.stringify({
      lastUpdated: new Date().toISOString(),
      username: USERNAME,
      allRatings: enriched,
      genres: Object.entries(genreMap).sort((a,b) => b[1] - a[1]).slice(0, 10),
      directors: Object.entries(directorMap).sort((a,b) => b[1].count - a[1].count).slice(0, 10),
      actors: Object.entries(actorMap).sort((a,b) => b[1] - a[1]).slice(0, 10),
      sparkline
    }, null, 2));
  } catch (err) { console.error(err); }
}
fetchTraktRatings();
