import fs from 'node:fs/promises';
import { runETL, mapConcurrent } from './lib-etl.mjs';
import { transformTraktData } from './trakt-logic.mjs';
import { validateEnv } from './lib-credentials.mjs';
import { fetchOrThrow, runIfMain } from './lib-utils.mjs';

const CONCURRENCY_LIMIT = 5;

export async function getTraktAccessToken({ clientId, clientSecret, refreshToken }) {
  const res = await fetchOrThrow('https://api.trakt.tv/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
      grant_type: 'refresh_token',
    }),
  });
  const data = await res.json();
  return { accessToken: data.access_token, newRefreshToken: data.refresh_token };
}

export async function enrichItem(item, { cache, apiKey }) {
  const imdbId = item.movie?.ids?.imdb || item.show?.ids?.imdb;
  if (imdbId && cache.has(imdbId) && cache.get(imdbId).poster) {
    return { ...item, ...cache.get(imdbId) };
  }

  const tmdbId = item.movie?.ids?.tmdb || item.show?.ids?.tmdb;
  const type = item.movie ? 'movie' : 'tv';
  let poster = null,
    director = 'Unknown',
    genres = [];

  if (tmdbId) {
    try {
      const [tRes, cRes] = await Promise.all([
        fetchOrThrow(`https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${apiKey}`),
        fetchOrThrow(`https://api.themoviedb.org/3/${type}/${tmdbId}/credits?api_key=${apiKey}`),
      ]);

      const tData = await tRes.json();
      const cData = await cRes.json();

      poster = tData.poster_path ? `https://image.tmdb.org/t/p/w500${tData.poster_path}` : null;
      director = cData.crew?.find((c) => c.job === 'Director')?.name || 'Unknown';
      genres = (tData.genres || []).map((g) => g.name.toLowerCase());
    } catch (err) {
      console.warn(`⚠️ TMDB enrichment failed for ${type} id ${tmdbId}`);
    }
  }
  return { ...item, poster, director, genres };
}

export async function fetchAndEnrichTraktData({ clientId, accessToken, username, tmdbApiKey, dataPath }) {
  const existingRaw = await fs.readFile(dataPath, 'utf-8').catch(() => '{"allRatings":[]}');
  const existing = JSON.parse(existingRaw);
  const flatExisting = Array.isArray(existing.allRatings)
    ? existing.allRatings
    : existing.allRatings?.allRatings || [];
  const cache = new Map(flatExisting.map((r) => [r.imdbId, r]));

  const headers = {
    'Content-Type': 'application/json',
    'trakt-api-version': '2',
    'trakt-api-key': clientId,
    Authorization: `Bearer ${accessToken}`,
  };

  console.log('... Fetching Trakt ratings...');
  const [mRes, sRes] = await Promise.all([
    fetchOrThrow(`https://api.trakt.tv/users/${username}/ratings/movies`, { headers }),
    fetchOrThrow(`https://api.trakt.tv/users/${username}/ratings/shows`, { headers }),
  ]);

  const raw = [...(await mRes.json()), ...(await sRes.json())];

  console.log(`... Enriching ${raw.length} items with TMDB data...`);
  return mapConcurrent(raw, CONCURRENCY_LIMIT, (item) =>
    enrichItem(item, { cache, apiKey: tmdbApiKey })
  );
}

export function transformAndAggregateTraktData(enriched, { username }) {
  const allRatings = transformTraktData(enriched);
  const genreMap = {},
    decadeStats = {},
    directorMap = {};

  enriched.forEach((item) => {
    const year = item.year || item.movie?.year || item.show?.year;
    if (year) {
      const decade = Math.floor(year / 10) * 10;
      if (!decadeStats[decade]) decadeStats[decade] = { count: 0, sum: 0 };
      decadeStats[decade].count++;
      decadeStats[decade].sum += item.rating;
    }
    if (item.director && item.director !== 'Unknown') {
      directorMap[item.director] = (directorMap[item.director] || 0) + 1;
    }
    (item.genres || []).forEach((g) => {
      genreMap[g] = (genreMap[g] || 0) + 1;
    });
  });

  return {
    allRatings,
    genres: Object.entries(genreMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10),
    directors: Object.entries(directorMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10),
    sparkline: Object.entries(decadeStats)
      .map(([d, v]) => ({
        decade: Number(d),
        score: (v.sum / v.count).toFixed(2),
        volume: v.count,
      }))
      .sort((a, b) => a.decade - b.decade),
    username: username || 'ewelker',
    lastUpdated: new Date().toISOString(),
  };
}

export async function run() {
  // TRAKT_ACCESS_TOKEN can be set directly (e.g. in Cloudflare) to skip the OAuth
  // token exchange. Trakt access tokens are valid for ~3 months. When one expires,
  // set a fresh one via the Trakt API and update the env var manually.
  //
  // When running via GitHub Actions, omit TRAKT_ACCESS_TOKEN and provide
  // TRAKT_CLIENT_SECRET + TRAKT_REFRESH_TOKEN instead — the refresh token flow
  // will run, and the new refresh token is written to /tmp/trakt-new-refresh-token.txt
  // so the workflow can update the secret for the next run.
  const directAccessToken = process.env.TRAKT_ACCESS_TOKEN;

  const baseEnv = {
    clientId: 'TRAKT_CLIENT_ID',
    username: 'TRAKT_USERNAME',
    tmdbApiKey: 'TMDB_API_KEY',
  };

  const refreshEnv = directAccessToken
    ? baseEnv
    : { ...baseEnv, clientSecret: 'TRAKT_CLIENT_SECRET', refreshToken: 'TRAKT_REFRESH_TOKEN' };

  const creds = validateEnv(refreshEnv, 'Trakt or TMDB');

  const outFile = 'src/data/trakt.json';
  // Use the committed cache file to seed the enrichment process
  const cacheFile = 'src/data/cache/trakt.json';

  await runETL({
    name: 'Trakt',
    fetcher: async () => {
      let accessToken;
      if (directAccessToken) {
        accessToken = directAccessToken;
      } else {
        const result = await getTraktAccessToken(creds);
        accessToken = result.accessToken;
        if (result.newRefreshToken) {
          await fs.writeFile('/tmp/trakt-new-refresh-token.txt', result.newRefreshToken, 'utf-8');
        }
      }
      return fetchAndEnrichTraktData({
        ...creds,
        accessToken,
        dataPath: cacheFile,
      });
    },
    transform: (data) =>
      transformAndAggregateTraktData(data, {
        username: creds.username,
      }),
    outFile: outFile,
    defaultData: {
      allRatings: [],
      genres: [],
      directors: [],
      sparkline: [],
      username: 'ewelker',
      lastUpdated: 'never',
    },
  });
}

runIfMain(import.meta.url, run);
