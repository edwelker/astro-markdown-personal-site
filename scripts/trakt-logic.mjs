export function transformTraktData(data) {
  const ratings = data?.allRatings ?? [];
  return ratings.map(item => ({
    title: item.title || 'Unknown Title',
    rating: item.rating ?? 0,
    poster: item.poster || '',
    href: item.href || '/media'
  }));
}
