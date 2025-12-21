export function transformTraktData(rawRatings) {
  return (rawRatings || []).map(item => ({
    id: item.movie?.ids?.trakt || item.show?.ids?.trakt || item.id,
    imdbId: item.movie?.ids?.imdb || item.show?.ids?.imdb || item.imdbId,
    title: item.movie?.title || item.show?.title || item.title,
    year: item.movie?.year || item.show?.year || item.year,
    rating: item.rating,
    type: item.movie ? 'movie' : 'show',
    href: item.href || `https://trakt.tv/${item.movie ? 'movies' : 'shows'}/${item.movie?.ids?.slug || item.show?.ids?.slug || ''}`,
    poster: item.poster || "", 
    director: item.director || "Unknown"
  }));
}
