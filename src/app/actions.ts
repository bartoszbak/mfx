"use server";

import { discoverMovies, searchMoviesByTitle, getMovieDetail } from "@/lib/tmdb";
import type { TmdbMovie } from "@/lib/types";
import { buildRecommendationPrompt } from "@/lib/system-prompt";

export async function getRecommendations(
  genres: string[],
  decade: string,
  originCountry?: string
): Promise<TmdbMovie[]> {
  if (genres.length === 0) return [];
  return discoverMovies(genres, decade, originCountry);
}

export async function searchMovieTitle(query: string): Promise<TmdbMovie[]> {
  return searchMoviesByTitle(query);
}

export interface AiRecommendation {
  movie: TmdbMovie;
  reason: string;
}

export interface TasteProfile {
  emotional_tone: string[];
  pacing: string;
  narrative_complexity: string;
  orientation: string;
  themes: string[];
  world_type: string;
  novelty: string;
  creator_signals: string[];
}

export interface FilterResult {
  recommendations: AiRecommendation[];
  tasteProfile: TasteProfile;
}

export async function filterWithAI(
  candidates: TmdbMovie[],
  referenceTmdbID: number,
  originCountry?: string
): Promise<FilterResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not set");

  const referenceDetail = await getMovieDetail(referenceTmdbID);
  if (!referenceDetail) throw new Error("Could not fetch reference movie details");

  const referenceBlock = `Reference movie:
Title: ${referenceDetail.Title} (${referenceDetail.Year})
Genre: ${referenceDetail.Genre}
Director: ${referenceDetail.Director}
Actors: ${referenceDetail.Actors}
Rating: ${referenceDetail.imdbRating}
Plot: ${referenceDetail.Plot}`;

  const candidateList = candidates
    .map((m) =>
      `- imdbID: ${m.imdbID} | ${m.Title} (${m.Year}) | Rating: ${m.vote_average.toFixed(1)} | Overview: ${m.overview}`
    )
    .join("\n");

  const userMessage = `${referenceBlock}\n\nCandidates:\n${candidateList}`;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-4o-mini",
      messages: [
        { role: "system", content: buildRecommendationPrompt(originCountry) },
        { role: "user", content: userMessage },
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter error: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();
  const raw = json.choices?.[0]?.message?.content ?? "";

  let parsed: { taste_profile: TasteProfile; recommendations: { imdbID: string; reason: string }[] };
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("AI returned invalid JSON");
  }

  const movieMap = new Map(candidates.map((m) => [m.imdbID, m]));

  const recommendations = parsed.recommendations
    .filter((r) => movieMap.has(r.imdbID))
    .slice(0, 7)
    .map((r) => ({
      movie: movieMap.get(r.imdbID)!,
      reason: r.reason,
    }));

  return { recommendations, tasteProfile: parsed.taste_profile };
}
