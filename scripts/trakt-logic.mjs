export function calculateDecade(year) {
  return Math.floor(year / 10) * 10;
}

export function deduplicate(items) {
  const seen = new Set();
  return (items || []).filter(item => {
    const id = item.movie?.ids?.imdb || item.show?.ids?.imdb;
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

export const transformTraktData = (data) => {
  const ratings = Array.isArray(data) ? data : (data?.allRatings || []);
  return ratings.map(item => ({
    title: item.title || item.movie?.title || item.show?.title || 'Unknown',
    rating: item.rating ?? 0,
    poster: item.poster || '',
    href: item.href || (item.movie ? `https://imdb.com/title/${item.movie.ids?.imdb}` : ''),
    year: item.year || item.movie?.year || item.show?.year,
    director: item.director || 'Unknown'
  }));
};
