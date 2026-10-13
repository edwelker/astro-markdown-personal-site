export function extractGuids(item) {
  let imdbId = null;
  let tmdbId = null;
  const guids = item?.Guid || [];
  if (Array.isArray(guids)) {
    for (const g of guids) {
      const id = g?.id || '';
      if (id.startsWith('imdb://')) imdbId = id.replace('imdb://', '');
      if (id.startsWith('tmdb://')) tmdbId = id.replace('tmdb://', '');
    }
  }
  return { imdbId, tmdbId };
}

export function normalizeTitle(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

export function findMatchingItem(target, list) {
  if (!target || !Array.isArray(list)) return null;

  const targetId = target.id ? String(target.id).trim() : null;
  const targetImdb = target.imdbId ? target.imdbId.toLowerCase().trim() : null;
  const targetTmdb = target.tmdbId ? String(target.tmdbId).trim() : null;
  const targetTitle = normalizeTitle(target.title);
  const targetYear = Number(target.year) || 0;
  const targetType = (target.type || 'movie').toLowerCase().includes('show') ? 'show' : 'movie';

  // 1. Match by persistent plex id if available
  if (targetId) {
    const match = list.find((item) => {
      const id = item?.id ? String(item.id).trim() : null;
      return id && id === targetId;
    });
    if (match) return match;
  }

  // 2. Match by imdbId
  if (targetImdb) {
    const match = list.find((item) => {
      const imdb = item?.imdbId ? item.imdbId.toLowerCase().trim() : null;
      return imdb && imdb === targetImdb;
    });
    if (match) return match;
  }

  // 3. Match by tmdbId
  if (targetTmdb) {
    const match = list.find((item) => {
      const tmdb = item?.tmdbId ? String(item.tmdbId).trim() : null;
      return tmdb && tmdb === targetTmdb;
    });
    if (match) return match;
  }

  // 4. Fallback match by normalized title and year (for historical titles without IDs)
  if (targetTitle) {
    let match = list.find((item) => {
      const itemTitle = normalizeTitle(item?.title);
      const itemYear = Number(item?.year) || 0;
      const itemType = (item?.type || 'movie').toLowerCase().includes('show') ? 'show' : 'movie';
      return itemTitle === targetTitle && itemYear === targetYear && itemType === targetType;
    });
    if (match) return match;

    if (targetYear > 0) {
      match = list.find((item) => {
        const itemTitle = normalizeTitle(item?.title);
        const itemYear = Number(item?.year) || 0;
        const itemType = (item?.type || 'movie').toLowerCase().includes('show') ? 'show' : 'movie';
        return (
          itemTitle === targetTitle &&
          Math.abs(itemYear - targetYear) <= 1 &&
          itemType === targetType
        );
      });
      if (match) return match;
    }
  }

  return null;
}

export function getItemTimestamp(item) {
  if (item?.date) {
    const t = new Date(item.date).getTime();
    if (!Number.isNaN(t)) return t;
  }
  if (item?.lastRatedAt) {
    const t = Number(item.lastRatedAt);
    return t < 1e11 ? t * 1000 : t;
  }
  if (item?.lastViewedAt) {
    const t = Number(item.lastViewedAt);
    return t < 1e11 ? t * 1000 : t;
  }
  return 0;
}

export function mergeAppendOnly(existingArchive = [], newItems = []) {
  const merged = Array.isArray(existingArchive) ? [...existingArchive] : [];

  for (const item of newItems) {
    const { imdbId, tmdbId } = extractGuids(item);
    const effectiveImdbId = imdbId || item.imdbId || '';
    const effectiveTmdbId = tmdbId || item.tmdbId || null;

    const match = findMatchingItem(
      {
        id: item.id || item.ratingKey,
        imdbId: effectiveImdbId,
        tmdbId: effectiveTmdbId,
        title: item.title,
        year: item.year,
        type: item.type,
      },
      merged
    );

    const isShow = (item.type || '').toLowerCase().includes('show');
    let href = item.href;
    if (!href || href.includes('trakt.tv')) {
      if (effectiveTmdbId) {
        href = `https://www.themoviedb.org/${isShow ? 'tv' : 'movie'}/${effectiveTmdbId}`;
      } else if (effectiveImdbId) {
        href = `https://www.imdb.com/title/${effectiveImdbId}/`;
      } else {
        href = '';
      }
    }

    const ratingVal = item.userRating !== undefined ? item.userRating : item.rating;
    const rating = Math.round(Number(ratingVal || 0));

    if (match) {
      // Prioritize Plex canonical titles, years, IDs, and assets (metadata is fungible)
      if (item.title) match.title = item.title;
      if (item.year) match.year = item.year;
      if (item.id) match.id = item.id;
      if (rating > 0) match.rating = rating;

      const itemTime = getItemTimestamp(item);
      const matchTime = getItemTimestamp(match);
      if (itemTime > matchTime || (!match.date && item.date)) {
        match.date = item.date || (itemTime ? new Date(itemTime).toISOString() : match.date);
      }

      if (effectiveImdbId) match.imdbId = effectiveImdbId;
      if (effectiveTmdbId) match.tmdbId = effectiveTmdbId;
      if (item.poster && item.poster.startsWith('http')) match.poster = item.poster;
      if (
        item.director &&
        item.director !== 'Unknown'
      ) {
        match.director = item.director;
      }
      if (item.genres && item.genres.length > 0) {
        match.genres = item.genres;
      }
      if (href && (!match.href || match.href.includes('trakt.tv'))) match.href = href;
    } else {
      const year =
        item.year ||
        (item.originallyAvailableAt ? new Date(item.originallyAvailableAt).getFullYear() : 0);

      const itemTime = getItemTimestamp(item);
      const date = item.date || (itemTime ? new Date(itemTime).toISOString() : undefined);

      merged.push({
        id: item.ratingKey || item.id,
        imdbId: effectiveImdbId,
        tmdbId: effectiveTmdbId,
        title: item.title || '',
        year,
        rating,
        type: isShow ? 'show' : 'movie',
        href,
        poster: item.poster || '',
        director: item.director || 'Unknown',
        genres: item.genres || [],
        date,
      });
    }
  }

  return merged
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const aTime = getItemTimestamp(a.item);
      const bTime = getItemTimestamp(b.item);
      if (bTime !== aTime) return bTime - aTime;
      return a.index - b.index;
    })
    .map((x) => x.item);
}

export function transformPlexData(rawRatings) {
  if (!rawRatings || !Array.isArray(rawRatings)) {
    return [];
  }

  const sorted = rawRatings
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const aTime = getItemTimestamp(a.item);
      const bTime = getItemTimestamp(b.item);
      if (bTime !== aTime) return bTime - aTime;
      return a.index - b.index;
    })
    .map((x) => x.item);

  return sorted.map((item) => {
    const { imdbId, tmdbId } = extractGuids(item);
    const isShow = (item.type || '').toLowerCase().includes('show');
    const effectiveImdbId = imdbId || item.imdbId || '';
    const effectiveTmdbId = tmdbId || item.tmdbId || null;

    let href = item.href;
    if (!href || href.includes('trakt.tv')) {
      if (effectiveTmdbId) {
        href = `https://www.themoviedb.org/${isShow ? 'tv' : 'movie'}/${effectiveTmdbId}`;
      } else if (effectiveImdbId) {
        href = `https://www.imdb.com/title/${effectiveImdbId}/`;
      } else {
        href = '';
      }
    }

    const year =
      item.year ||
      (item.originallyAvailableAt ? new Date(item.originallyAvailableAt).getFullYear() : 0);

    const ratingVal = item.userRating !== undefined ? item.userRating : item.rating;
    const rating = Math.round(Number(ratingVal || 0));

    return {
      id: item.ratingKey || item.id,
      imdbId: effectiveImdbId,
      tmdbId: effectiveTmdbId,
      title: item.title || '',
      year,
      rating,
      type: isShow ? 'show' : 'movie',
      href,
      poster: item.poster || '',
      director: item.director || 'Unknown',
      genres: item.genres || [],
      date: item.date,
    };
  });
}

export function transformAndAggregatePlexData(enriched, { username = 'ewelker' } = {}) {
  const allRatings = transformPlexData(enriched);
  const genreMap = {};
  const decadeStats = {};
  const directorMap = {};

  (enriched || []).forEach((item) => {
    const year =
      item.year ||
      (item.originallyAvailableAt ? new Date(item.originallyAvailableAt).getFullYear() : 0);
    const ratingVal = item.userRating !== undefined ? item.userRating : item.rating;
    const rating = Math.round(Number(ratingVal || 0));

    if (year) {
      const decade = Math.floor(year / 10) * 10;
      if (!decadeStats[decade]) decadeStats[decade] = { count: 0, sum: 0 };
      decadeStats[decade].count++;
      decadeStats[decade].sum += rating;
    }

    if (item.director && item.director !== 'Unknown') {
      directorMap[item.director] = (directorMap[item.director] || 0) + 1;
    }

    const genres =
      item.genres ||
      (item.Genre || []).map((g) => (typeof g === 'string' ? g : g.tag)).filter(Boolean);

    genres.forEach((g) => {
      const genreKey = String(g).toLowerCase();
      genreMap[genreKey] = (genreMap[genreKey] || 0) + 1;
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
