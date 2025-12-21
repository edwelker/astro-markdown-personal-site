export function calculateDecade(year) {
  return Math.floor(year / 10) * 10;
}

export function deduplicate(items) {
  const seen = new Set();
  return items.filter(item => {
    const id = item.movie?.ids?.imdb || item.show?.ids?.imdb;
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

export function transformTraktData(data) {
  const ratings = data?.allRatings ?? [];
  return ratings.map(item => ({
    title: item.title || 'Unknown Title',
    rating: item.rating ?? 0,
    poster: item.poster || '',
    href: item.href || '/media'
  }));
}
