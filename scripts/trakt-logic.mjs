/**
 * calculateDecade
 * Rounds a year down to the start of its decade (e.g., 1994 -> 1990).
 */
export function calculateDecade(year) {
  return Math.floor(year / 10) * 10;
}

/**
 * deduplicate
 * Removes duplicate media entries based on IMDB ID.
 */
export function deduplicate(items) {
  const seen = new Set();
  return items.filter(item => {
    const id = item.movie?.ids?.imdb || item.show?.ids?.imdb;
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

/**
 * transformTraktData
 * Standardizes Trakt ratings for UI components.
 */
export function transformTraktData(data) {
  const ratings = data?.allRatings ?? [];
  return ratings.map(item => ({
    title: item.title || 'Unknown Title',
    rating: item.rating ?? 0,
    poster: item.poster || '',
    href: item.href || '/media'
  }));
}
