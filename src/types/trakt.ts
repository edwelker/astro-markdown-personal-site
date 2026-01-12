export interface TraktRating {
  rated_at: string;
  rating: number;
  type: 'movie' | 'show' | 'episode';
  poster?: string;
  movie?: {
    title: string;
    year: number;
    ids: { trakt: number; slug: string; imdb: string; tmdb: number };
  };
  show?: {
    title: string;
    year: number;
    ids: { trakt: number; slug: string; imdb: string; tmdb: number };
  };
}

export interface HeatmapCell {
  decade: number;
  rating: number;
  count: number;
}

export interface TraktData {
  lastUpdated: string;
  recentRatings: TraktRating[];
  heatmap: HeatmapCell[];
}
