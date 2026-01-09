import type { RatingItem, DirectorInfo, TopListItem } from "../components/trakt/types";

export function filterRatings(allRatings: RatingItem[]) {
  const tens = allRatings.filter((r) => r.rating === 10);
  const nines = allRatings.filter((r) => r.rating === 9);
  const eights = allRatings.filter((r) => r.rating === 8);

  // Reversed: Show oldest items first to avoid visual duplication with "Recent Watches"
  const midQuality = allRatings
    .filter((r) => r.rating >= 6 && r.rating < 8)
    .reverse();

  const lowQuality = allRatings
    .filter((r) => r.rating < 6)
    .reverse();

  const recentlyRated = allRatings.slice(0, 10);

  return { tens, nines, eights, midQuality, lowQuality, recentlyRated };
}

export function getDirectorSpotlight(allRatings: RatingItem[], directors: [string, DirectorInfo][]) {
  const topDirectorData = directors?.[0];
  const topDirectorName = topDirectorData ? topDirectorData[0] : "";
  const topDirectorId = topDirectorData ? (topDirectorData[1] as DirectorInfo).id : null;
  
  // Spotlight only includes movies rated 9 or higher by this director
  const directorSpotlight = allRatings.filter(
    (m) => m.director === topDirectorName && m.rating >= 9
  );

  return { topDirectorName, topDirectorId, directorSpotlight };
}

export function mapTopLists(
  genres: [string, number][], 
  directors: [string, DirectorInfo][], 
  username: string
) {
  const topGenres: TopListItem[] = genres.slice(0, 10).map((g) => ({
    label: g[0],
    count: g[1],
    href: `https://trakt.tv/users/${username}/history/movies/added?genres=${g[0].toLowerCase()}`,
  }));

  const topDirectors: TopListItem[] = directors.slice(0, 10).map((d) => ({
    label: d[0],
    count: (d[1] as DirectorInfo).count,
    href: `https://www.google.com/search?q=${encodeURIComponent(d[0])}+director`,
  }));

  return { topGenres, topDirectors };
}
