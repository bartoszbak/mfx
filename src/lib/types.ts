export interface TmdbMovie {
  imdbID: string;
  tmdbID: number;
  Title: string;
  Year: string;
  Poster: string;
  overview: string;
  vote_average: number;
  genre_ids: number[];
}

export interface TmdbDetail {
  imdbID: string;
  tmdbID: number;
  Title: string;
  Year: string;
  Rated: string;
  Genre: string;
  Director: string;
  Actors: string;
  Plot: string;
  Poster: string;
  imdbRating: string;
  Runtime: string;
}
