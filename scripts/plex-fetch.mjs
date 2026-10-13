/**
 * scripts/plex-fetch.mjs
 *
 * Architecture: Plex Cloud-First with Sovereign Append-Only Historical Ledger
 * ----------------------------------------------------------------------------
 * 1. Why Plex Cloud-First over Per-Server:
 *    - The user operates multiple Plex servers (e.g. main server `shostakovich` and
 *      laptop server `stravinsky` used while traveling/remote).
 *    - Querying individual PMS instances requires maintaining fragile network
 *      endpoints (dynamic IPs, port forwards, waking sleeping laptops).
 *    - Plex Cloud (https://community.plex.tv/api GraphQL `ratingsV2`) automatically
 *      federates account-level ratings across all servers and streaming titles into
 *      a single unified stream, regardless of which machine was used or whether
 *      media files were migrated between servers.
 *
 * 2. Why a Sovereign Historical Ledger (src/data/cache/historical-ratings.json):
 *    - PMS and Plex Cloud are third-party systems. If local media files are deleted
 *      from disk, PMS purges the item from its library.
 *    - Direct backdating to Plex Cloud is not possible because Plex sets `date: NOW()`,
 *      which would corrupt historical order and displace recent watches.
 *    - If cloud data is ever desynced or policies change, data could be lost.
 *    - Solution: An append-only, version-controlled archive in Git. On every build,
 *      we ingest cloud and PMS ratings, update ratings/dates in place, but NEVER delete
 *      any item. This permanently preserved 18 historical Trakt titles rated years ago
 *      that no longer exist on server disks.
 *
 * 3. Technical Learnings & Key Gotchas:
 *    - Persistent IDs vs. String Fragility: Service titles diverge (e.g. Trakt "Se7en"
 *      vs Plex "Seven"; "Star Wars: Andor" vs "Andor"). Anchoring matching on immutable
 *      IDs (`id`, `imdbId`, `tmdbId`) makes presentation metadata (title, poster, genres)
 *      fungible, allowing automatic deduplication and adoption of canonical Plex titles.
 *    - Poster URLs: Local PMS returns relative thumbnail paths (`/library/metadata/...`)
 *      which only work when proxied through PMS port 32400 and fail on the public web.
 *      The fetcher and merger enforce that only absolute public CDN URLs (TMDb /
 *      metadata-static.plex.tv) are saved to the archive.
 *    - Dynamic User Identity: GraphQL requires the user's account UUID. We dynamically
 *      query `https://plex.tv/api/v2/user` rather than hardcoding.
 */

import fs from 'node:fs/promises';
import { runETL, mapConcurrent } from './lib-etl.mjs';
import {
  extractGuids,
  mergeAppendOnly,
  transformAndAggregatePlexData,
} from './plex-logic.mjs';
import { validateEnv } from './lib-credentials.mjs';
import { fetchOrThrow, runIfMain } from './lib-utils.mjs';

const CONCURRENCY_LIMIT = 5;

export async function fetchPlexUserUuid({
  plexToken,
  clientIdentifier = 'edwelker-site-fetcher',
}) {
  const res = await fetchOrThrow('https://plex.tv/api/v2/user', {
    headers: {
      Accept: 'application/json',
      'X-Plex-Token': plexToken,
      'X-Plex-Client-Identifier': clientIdentifier,
    },
  });
  const data = await res.json();
  return {
    uuid: data.uuid,
    username: data.username,
  };
}

export async function fetchPlexCloudRatings({
  plexToken,
  userUuid,
  clientIdentifier = 'edwelker-site-fetcher',
}) {
  const query = `query GetRatings($userId: ID!, $after: String) {
    user(id: $userId) {
      ratingsV2(first: 100, after: $after) {
        pageInfo { hasNextPage endCursor }
        nodes {
          rating
          date
          metadataItem { id guid title year type slug }
        }
      }
    }
  }`;

  let allNodes = [];
  let after = null;
  let hasNext = true;

  while (hasNext) {
    const res = await fetchOrThrow('https://community.plex.tv/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-plex-token': plexToken,
        'X-Plex-Client-Identifier': clientIdentifier,
      },
      body: JSON.stringify({ query, variables: { userId: userUuid, after } }),
    });

    const data = await res.json();
    const ratings = data.data?.user?.ratingsV2;
    if (!ratings) break;

    allNodes.push(...(ratings.nodes || []));
    hasNext = Boolean(ratings.pageInfo?.hasNextPage);
    after = ratings.pageInfo?.endCursor || null;
  }

  return allNodes;
}

export async function fetchCloudItemMetadata({
  id,
  plexToken,
  clientIdentifier = 'edwelker-site-fetcher',
}) {
  try {
    const res = await fetchOrThrow(
      `https://metadata.provider.plex.tv/library/metadata/${id}?includeGuids=1`,
      {
        headers: {
          Accept: 'application/json',
          'X-Plex-Token': plexToken,
          'X-Plex-Client-Identifier': clientIdentifier,
        },
      }
    );
    const data = await res.json();
    return data.MediaContainer?.Metadata?.[0] || null;
  } catch {
    return null;
  }
}

export async function discoverPlexServerUri({
  plexToken,
  clientIdentifier = 'edwelker-site-fetcher',
}) {
  const url = 'https://plex.tv/api/v2/resources?includeHttps=1&includeRelay=1';
  const res = await fetchOrThrow(url, {
    headers: {
      Accept: 'application/json',
      'X-Plex-Token': plexToken,
      'X-Plex-Client-Identifier': clientIdentifier,
    },
  });

  const resources = await res.json();
  const servers = (Array.isArray(resources) ? resources : []).filter((r) =>
    r.provides?.includes('server')
  );

  if (servers.length === 0) {
    throw new Error('No Plex Media Server found associated with this account.');
  }

  const primaryServer = servers[0];
  const connections = primaryServer.connections || [];
  const connection =
    connections.find((c) => c.protocol === 'https' && c.uri) ||
    connections.find((c) => c.uri) ||
    null;

  if (!connection?.uri) {
    throw new Error(`No valid connection URI found for server ${primaryServer.name}`);
  }

  return {
    uri: connection.uri,
    token: primaryServer.accessToken || plexToken,
  };
}

export async function fetchPlexLibrarySections({ plexUrl, plexToken }) {
  const res = await fetchOrThrow(`${plexUrl}/library/sections`, {
    headers: {
      Accept: 'application/json',
      'X-Plex-Token': plexToken,
    },
  });

  const data = await res.json();
  const directories = data.MediaContainer?.Directory || [];
  const list = Array.isArray(directories) ? directories : [directories];
  return list.filter(
    (d) => d && (d.type === 'movie' || d.type === 'show') && d.agent !== 'tv.plex.agents.none'
  );
}

export async function fetchPlexRatedItems({ plexUrl, plexToken, sectionKey }) {
  const res = await fetchOrThrow(
    `${plexUrl}/library/sections/${sectionKey}/all?userRating%3E=1&includeGuids=1`,
    {
      headers: {
        Accept: 'application/json',
        'X-Plex-Token': plexToken,
      },
    }
  );

  const data = await res.json();
  const metadata = data.MediaContainer?.Metadata || [];
  const list = Array.isArray(metadata) ? metadata : [metadata];
  return list.filter((item) => item && item.userRating !== undefined && Number(item.userRating) > 0);
}

export async function fetchPlexServerRatings({ plexUrl, plexToken }) {
  try {
    let effectiveUrl = plexUrl;
    let effectiveToken = plexToken;
    if (!effectiveUrl) {
      const discovered = await discoverPlexServerUri({ plexToken });
      effectiveUrl = discovered.uri;
      effectiveToken = discovered.token;
    }
    const sections = await fetchPlexLibrarySections({ plexUrl: effectiveUrl, plexToken: effectiveToken });
    const sectionItems = await Promise.all(
      sections.map((section) =>
        fetchPlexRatedItems({
          plexUrl: effectiveUrl,
          plexToken: effectiveToken,
          sectionKey: section.key,
        })
      )
    );
    return sectionItems.flat();
  } catch (err) {
    console.warn(`⚠️ Could not fetch from local Plex Media Server (${err.message}). Proceeding with cloud ratings.`);
    return [];
  }
}

export async function enrichItem(item, { cache, apiKey }) {
  const { imdbId, tmdbId } = extractGuids(item);
  const cacheKey = imdbId || (tmdbId ? String(tmdbId) : null);

  if (cacheKey && cache.has(cacheKey) && cache.get(cacheKey).poster) {
    return { ...item, ...cache.get(cacheKey) };
  }

  const type = item.type === 'show' ? 'tv' : 'movie';
  let poster = null;
  let director = item.Director?.[0]?.tag || item.director || 'Unknown';
  let genres = (item.Genre || []).map((g) => (typeof g === 'string' ? g : g.tag)).filter(Boolean);

  if (tmdbId && apiKey) {
    try {
      const [tRes, cRes] = await Promise.all([
        fetchOrThrow(`https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${apiKey}`),
        fetchOrThrow(`https://api.themoviedb.org/3/${type}/${tmdbId}/credits?api_key=${apiKey}`),
      ]);

      const tData = await tRes.json();
      const cData = await cRes.json();

      poster = tData.poster_path ? `https://image.tmdb.org/t/p/w500${tData.poster_path}` : null;
      director = cData.crew?.find((c) => c.job === 'Director')?.name || director;
      genres = (tData.genres || []).map((g) => g.name.toLowerCase());
    } catch {
      console.warn(`⚠️ TMDB enrichment failed for ${type} id ${tmdbId}`);
    }
  }

  return { ...item, poster, director, genres };
}

export async function fetchAndEnrichPlexData({
  plexServerUrl,
  plexToken,
  tmdbApiKey,
  archivePath = 'src/data/cache/historical-ratings.json',
  cachePath = 'src/data/cache/plex.json',
}) {
  let existingArchive = [];
  try {
    const raw = await fs.readFile(archivePath, 'utf-8');
    const parsed = JSON.parse(raw);
    existingArchive = Array.isArray(parsed) ? parsed : parsed.allRatings || [];
  } catch {
    try {
      const raw = await fs.readFile(cachePath, 'utf-8');
      const parsed = JSON.parse(raw);
      existingArchive = Array.isArray(parsed) ? parsed : parsed.allRatings || [];
    } catch {
      existingArchive = [];
    }
  }

  const cacheMap = new Map();
  existingArchive.forEach((i) => {
    if (i.imdbId) cacheMap.set(i.imdbId.toLowerCase(), i);
    if (i.title && i.year) {
      const norm = String(i.title).toLowerCase().replace(/[^a-z0-9]/g, '');
      cacheMap.set(`${norm}|${i.year}`, i);
    }
  });

  console.log('... Fetching Plex user info...');
  const { uuid: userUuid, username } = await fetchPlexUserUuid({ plexToken });
  console.log(`... Fetching cloud ratings for user ${username} (${userUuid})...`);
  const cloudNodes = await fetchPlexCloudRatings({ plexToken, userUuid });
  console.log(`... Found ${cloudNodes.length} cloud rating(s)...`);

  const enrichedCloud = await mapConcurrent(cloudNodes, CONCURRENCY_LIMIT, async (node) => {
    const m = node.metadataItem;
    const norm = String(m?.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const titleKey = `${norm}|${m?.year}`;
    const cached = cacheMap.get(titleKey);

    if (cached && cached.poster && cached.director && cached.director !== 'Unknown') {
      return {
        ...cached,
        id: m?.id || cached.id,
        title: m?.title || cached.title,
        year: m?.year || cached.year,
        rating: node.rating,
        date: node.date,
      };
    }

    const meta = await fetchCloudItemMetadata({ id: m?.id, plexToken });
    const { imdbId, tmdbId } = extractGuids(meta || {});
    const isShow = (m?.type || '').toLowerCase().includes('show');

    let poster = meta?.thumb || '';
    let director = meta?.Director?.[0]?.tag || 'Unknown';
    let genres = (meta?.Genre || []).map((g) => g.tag).filter(Boolean);

    if (tmdbId && tmdbApiKey && (!poster || director === 'Unknown')) {
      const enriched = await enrichItem(
        { type: isShow ? 'show' : 'movie', Guid: [{ id: `tmdb://${tmdbId}` }] },
        { cache: cacheMap, apiKey: tmdbApiKey }
      );
      if (enriched.poster) poster = enriched.poster;
      if (enriched.director && enriched.director !== 'Unknown') director = enriched.director;
      if (enriched.genres && enriched.genres.length > 0) genres = enriched.genres;
    }

    let href = '';
    if (tmdbId) href = `https://www.themoviedb.org/${isShow ? 'tv' : 'movie'}/${tmdbId}`;
    else if (imdbId) href = `https://www.imdb.com/title/${imdbId}/`;

    return {
      id: m?.id,
      imdbId: imdbId || '',
      tmdbId: tmdbId ? Number(tmdbId) : null,
      title: m?.title || '',
      year: m?.year || 0,
      rating: node.rating,
      type: isShow ? 'show' : 'movie',
      href,
      poster,
      director,
      genres,
      date: node.date,
    };
  });

  const pmsRaw = await fetchPlexServerRatings({ plexUrl: plexServerUrl, plexToken });
  const pmsFormatted = pmsRaw.map((p) => {
    const { imdbId, tmdbId } = extractGuids(p);
    const isShow = p.type === 'show';
    let href = '';
    if (tmdbId) href = `https://www.themoviedb.org/${isShow ? 'tv' : 'movie'}/${tmdbId}`;
    else if (imdbId) href = `https://www.imdb.com/title/${imdbId}/`;

    const sec = Number(p.lastRatedAt || 0);
    const date = sec ? new Date(sec < 1e11 ? sec * 1000 : sec).toISOString() : undefined;

    return {
      id: p.ratingKey || p.id,
      imdbId: imdbId || '',
      tmdbId: tmdbId ? Number(tmdbId) : null,
      title: p.title,
      year: p.year || 0,
      rating: Math.round(Number(p.userRating || 0)),
      type: isShow ? 'show' : 'movie',
      href,
      poster: p.thumb && p.thumb.startsWith('http') ? p.thumb : '',
      director: p.Director?.[0]?.tag || 'Unknown',
      genres: (p.Genre || []).map((g) => (typeof g === 'string' ? g : g.tag)).filter(Boolean),
      date,
    };
  });

  const mergedWithCloud = mergeAppendOnly(existingArchive, enrichedCloud);
  const finalArchive = mergeAppendOnly(mergedWithCloud, pmsFormatted);

  console.log(`... Append-only archive now holds ${finalArchive.length} lifetime ratings. Persisting archive...`);
  await fs.writeFile(archivePath, JSON.stringify(finalArchive, null, 2), 'utf-8');

  return finalArchive;
}

export async function run() {
  const plexServerUrl = process.env.PLEX_SERVER_URL || process.env.PLEX_URL;
  const tmdbApiKey = process.env.TMDB_API_KEY;

  const outFile = 'src/data/plex.json';
  const cacheFile = 'src/data/cache/plex.json';
  const archiveFile = 'src/data/cache/historical-ratings.json';

  await runETL({
    name: 'Plex',
    fetcher: async () => {
      const { plexToken } = validateEnv({ plexToken: 'PLEX_TOKEN' }, 'Plex');
      return fetchAndEnrichPlexData({
        plexServerUrl,
        plexToken,
        tmdbApiKey,
        archivePath: archiveFile,
        cachePath: cacheFile,
      });
    },
    transform: (data) =>
      transformAndAggregatePlexData(data, {
        username: process.env.PLEX_USERNAME || 'ewelker',
      }),
    outFile,
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
