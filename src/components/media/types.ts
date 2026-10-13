export interface RatingItem {
  id: string;
  title: string;
  year: number;
  rating: number;
  director: string;
  directorId: number | null;
  href: string;
  poster: string;
}

export interface SparklineDecade {
  decade: number;
  score: string;
  volume: number;
}

export interface DirectorInfo {
  count: number;
  id: number;
}

export interface TopListItem {
  label: string;
  count: number;
  href: string;
}
