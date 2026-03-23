import type { TmdbMovie, TmdbDetail } from "@/lib/types";

export type { TmdbMovie, TmdbDetail };

const BASE = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p/w500";

function authHeaders() {
  const token = process.env.TMDB_READ_TOKEN;
  if (!token) throw new Error("TMDB_READ_TOKEN is not set");
  return { Authorization: `Bearer ${token}` };
}

export const GENRE_IDS: Record<string, number> = {
  Action: 28,
  Adventure: 12,
  Animation: 16,
  Comedy: 35,
  Crime: 80,
  Documentary: 99,
  Drama: 18,
  Fantasy: 14,
  Horror: 27,
  Mystery: 9648,
  Romance: 10749,
  "Sci-Fi": 878,
  Thriller: 53,
  Western: 37,
};

interface DiscoverResult {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  overview: string;
  vote_average: number;
  genre_ids: number[];
}

function mapMovie(m: DiscoverResult): TmdbMovie {
  return {
    imdbID: `tmdb-${m.id}`,
    tmdbID: m.id,
    Title: m.title,
    Year: m.release_date?.slice(0, 4) ?? "",
    Poster: m.poster_path ? `${IMG_BASE}${m.poster_path}` : "N/A",
    overview: m.overview,
    vote_average: m.vote_average,
    genre_ids: m.genre_ids,
  };
}

export async function discoverMovies(
  genreNames: string[],
  decade: string
): Promise<TmdbMovie[]> {
  const headers = authHeaders();
  const yearStart = parseInt(decade);
  const yearEnd = yearStart + 9;

  const genreIds = genreNames
    .map((g) => GENRE_IDS[g])
    .filter(Boolean)
    .join(",");

  const params = new URLSearchParams({
    include_adult: "false",
    include_video: "false",
    language: "en-US",
    sort_by: "vote_count.desc",
    "primary_release_date.gte": `${yearStart}-01-01`,
    "primary_release_date.lte": `${yearEnd}-12-31`,
    "vote_count.gte": "50",
    page: "1",
    ...(genreIds ? { with_genres: genreIds } : {}),
  });

  const res = await fetch(`${BASE}/discover/movie?${params}`, {
    headers,
    next: { revalidate: 3600 },
  });
  const data = await res.json();

  if (!data.results?.length) return [];
  return (data.results as DiscoverResult[]).slice(0, 10).map(mapMovie);
}

export async function getMovieDetail(tmdbID: number): Promise<TmdbDetail | null> {
  const headers = authHeaders();

  const [detail, credits] = await Promise.all([
    fetch(`${BASE}/movie/${tmdbID}?language=en-US`, { headers, next: { revalidate: 86400 } }).then((r) => r.json()),
    fetch(`${BASE}/movie/${tmdbID}/credits?language=en-US`, { headers, next: { revalidate: 86400 } }).then((r) => r.json()),
  ]);

  if (!detail.id) return null;

  const director = (credits.crew as { job: string; name: string }[])
    ?.find((c) => c.job === "Director")?.name ?? "Unknown";

  const actors = (credits.cast as { name: string }[])
    ?.slice(0, 4)
    .map((a) => a.name)
    .join(", ") ?? "";

  return {
    imdbID: detail.imdb_id ?? `tmdb-${detail.id}`,
    tmdbID: detail.id,
    Title: detail.title,
    Year: detail.release_date?.slice(0, 4) ?? "",
    Rated: detail.adult ? "R" : "NR",
    Genre: detail.genres?.map((g: { name: string }) => g.name).join(", ") ?? "",
    Director: director,
    Actors: actors,
    Plot: detail.overview ?? "",
    Poster: detail.poster_path ? `${IMG_BASE}${detail.poster_path}` : "N/A",
    imdbRating: detail.vote_average?.toFixed(1) ?? "N/A",
    Runtime: detail.runtime ? `${detail.runtime} min` : "N/A",
  };
}

export async function searchMoviesByTitle(query: string): Promise<TmdbMovie[]> {
  if (!query || query.length < 2) return [];
  const headers = authHeaders();
  const params = new URLSearchParams({
    query,
    include_adult: "false",
    language: "en-US",
    page: "1",
  });
  const res = await fetch(`${BASE}/search/movie?${params}`, { headers, cache: "no-store" });
  const data = await res.json();
  if (!data.results?.length) return [];
  return (data.results as DiscoverResult[]).slice(0, 8).map(mapMovie);
}
