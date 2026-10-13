export interface PlexRatingItem {
  id: string | number;
  imdbId?: string;
  tmdbId?: string | number | null;
  title: string;
  year: number;
  rating: number;
  type: 'movie' | 'show';
  href: string;
  poster: string;
  director: string;
  genres?: string[];
  date?: string;
}

export interface SparklineDecade {
  decade: number;
  score: string;
  volume: number;
}

export interface PlexData {
  allRatings: PlexRatingItem[];
  genres: [string, number][];
  directors: [string, number][];
  sparkline: SparklineDecade[];
  username: string;
  lastUpdated: string;
}
