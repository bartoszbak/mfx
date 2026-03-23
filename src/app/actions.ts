"use server";

import { discoverMovies, searchMoviesByTitle, getMovieDetail } from "@/lib/tmdb";
import type { TmdbMovie, TmdbDetail } from "@/lib/types";
import { buildExtractionPrompt, buildRecommendationPrompt } from "@/lib/system-prompt";

export async function getRecommendations(
  genres: string[],
  decade: string
): Promise<TmdbMovie[]> {
  if (genres.length === 0) return [];
  return discoverMovies(genres, decade);
}

export async function searchMovieTitle(query: string): Promise<TmdbMovie[]> {
  return searchMoviesByTitle(query);
}

export interface AiRecommendation {
  movie: TmdbMovie;
  reason: string;
}

async function callOpenRouter(systemPrompt: string, userMessage: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not set");

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter error: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();
  return json.choices?.[0]?.message?.content ?? "";
}

export async function filterWithAI(
  candidates: TmdbMovie[],
  referenceTmdbID: number
): Promise<AiRecommendation[]> {
  // Step 1: fetch reference + all candidate details in parallel
  const [referenceDetail, ...candidateDetails] = await Promise.all([
    getMovieDetail(referenceTmdbID),
    ...candidates.map((m) => getMovieDetail(m.tmdbID)),
  ]);

  if (!referenceDetail) throw new Error("Could not fetch reference movie details");

  const candidatesWithDetail = candidates
    .map((m, i) => ({ movie: m, detail: candidateDetails[i] }))
    .filter((x) => x.detail !== null) as { movie: TmdbMovie; detail: TmdbDetail }[];

  // Step 2: extract taste attributes from the reference movie
  const extractionPrompt = buildExtractionPrompt(
    referenceDetail.Title,
    referenceDetail.Plot,
    referenceDetail.Genre,
    referenceDetail.Director,
    referenceDetail.Actors
  );

  const tasteRaw = await callOpenRouter(extractionPrompt, "Extract the taste profile for this movie.");

  let tasteProfile: object;
  try {
    tasteProfile = JSON.parse(tasteRaw);
  } catch {
    throw new Error("AI returned invalid taste profile JSON");
  }

  // Step 3: use taste profile to pick best 3 from candidates
  const candidateList = candidatesWithDetail
    .map(({ movie, detail }) =>
      `- imdbID: ${movie.imdbID} | ${detail.Title} (${detail.Year}) | Genre: ${detail.Genre} | Director: ${detail.Director} | Actors: ${detail.Actors} | Rating: ${detail.imdbRating} | Plot: ${detail.Plot}`
    )
    .join("\n");

  const userMessage = `Taste profile of the reference movie the user loved:
${JSON.stringify(tasteProfile, null, 2)}

Candidate movies:
${candidateList}`;

  const recommendRaw = await callOpenRouter(buildRecommendationPrompt(), userMessage);

  let parsed: { recommendations: { imdbID: string; reason: string }[] };
  try {
    parsed = JSON.parse(recommendRaw);
  } catch {
    throw new Error("AI returned invalid recommendations JSON");
  }

  const movieMap = new Map(candidates.map((m) => [m.imdbID, m]));

  return parsed.recommendations
    .filter((r) => movieMap.has(r.imdbID))
    .map((r) => ({
      movie: movieMap.get(r.imdbID)!,
      reason: r.reason,
    }));
}
