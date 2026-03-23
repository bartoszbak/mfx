"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MovieCard } from "@/components/MovieCard";
import { MovieCombobox } from "@/components/MovieCombobox";
import { getRecommendations, filterWithAI, AiRecommendation } from "@/app/actions";
import type { TmdbMovie } from "@/lib/types";

const GENRES = [
  "Action", "Adventure", "Animation", "Comedy", "Crime",
  "Documentary", "Drama", "Fantasy", "Horror", "Mystery",
  "Romance", "Sci-Fi", "Thriller", "Western",
];

const DECADES = [
  { label: "1950s", value: "1950" },
  { label: "1960s", value: "1960" },
  { label: "1970s", value: "1970" },
  { label: "1980s", value: "1980" },
  { label: "1990s", value: "1990" },
  { label: "2000s", value: "2000" },
  { label: "2010s", value: "2010" },
  { label: "2020s", value: "2020" },
];

type Stage = "idle" | "candidates" | "ai-results";

export function MoviePicker() {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedDecade, setSelectedDecade] = useState<string>("");
  const [referenceMovie, setReferenceMovie] = useState<TmdbMovie | null>(null);

  const [candidates, setCandidates] = useState<TmdbMovie[]>([]);
  const [aiResults, setAiResults] = useState<AiRecommendation[]>([]);
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string>("");

  const [isFetching, startFetch] = useTransition();
  const [isFiltering, startFilter] = useTransition();

  function toggleGenre(genre: string) {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  }

  function handleSearch() {
    if (selectedGenres.length === 0 || !selectedDecade) return;
    setError("");
    setAiResults([]);
    setStage("idle");
    startFetch(async () => {
      try {
        const results = await getRecommendations(selectedGenres, selectedDecade);
        if (results.length === 0) {
          setError("No movies found. Try different genres or decade.");
          return;
        }
        setCandidates(results);
        setStage("candidates");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    });
  }

  function handleAiFilter() {
    if (!referenceMovie || candidates.length === 0) return;
    setError("");
    startFilter(async () => {
      try {
        const picks = await filterWithAI(candidates, referenceMovie.tmdbID);
        setAiResults(picks);
        setStage("ai-results");
      } catch (e) {
        setError(e instanceof Error ? e.message : "AI filtering failed.");
      }
    });
  }

  const canSearch = selectedGenres.length > 0 && selectedDecade !== "";
  const canFilter = referenceMovie !== null && stage === "candidates";
  const aiMovieIds = new Set(aiResults.map((r) => r.movie.imdbID));

  return (
    <>
      {/* ── Sidebar ── */}
      <aside className="w-1/4 min-w-56 max-w-80 h-screen overflow-y-auto border-r border-border bg-background flex flex-col">
        <div className="p-6 flex flex-col gap-7 flex-1">
          {/* Branding */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Mindflix</h1>
            <p className="text-xs text-muted-foreground mt-1 leading-snug">
              Pick genres &amp; a decade — get curated recommendations.
            </p>
          </div>

          {/* Reference movie */}
          <section className="space-y-2">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                A movie you recently loved
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Used by AI to personalise your top 3
              </p>
            </div>
            <MovieCombobox onSelect={setReferenceMovie} selected={referenceMovie} />
            {referenceMovie && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{referenceMovie.Title}</span>{" "}
                ({referenceMovie.Year})
              </p>
            )}
          </section>

          {/* Genres */}
          <section className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Genres
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {GENRES.map((genre) => {
                const active = selectedGenres.includes(genre);
                return (
                  <button
                    key={genre}
                    onClick={() => toggleGenre(genre)}
                    className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
                  >
                    <Badge
                      variant={active ? "default" : "outline"}
                      className={`cursor-pointer select-none text-xs px-2.5 py-0.5 transition-colors ${
                        active ? "" : "hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      {genre}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Decade */}
          <section className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Decade
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {DECADES.map(({ label, value }) => {
                const active = selectedDecade === value;
                return (
                  <button
                    key={value}
                    onClick={() => setSelectedDecade(value)}
                    className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
                  >
                    <Badge
                      variant={active ? "default" : "outline"}
                      className={`cursor-pointer select-none text-xs px-2.5 py-0.5 transition-colors ${
                        active ? "" : "hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      {label}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Actions */}
          <div className="flex flex-col gap-2 mt-auto pt-4">
            <Button
              onClick={handleSearch}
              disabled={!canSearch || isFetching || isFiltering}
              className="w-full"
            >
              {isFetching ? "Finding movies…" : "Get 10 candidates"}
            </Button>

            {stage === "candidates" && (
              <Button
                onClick={handleAiFilter}
                disabled={!canFilter || isFiltering || isFetching}
                variant="outline"
                className="w-full"
              >
                {isFiltering
                  ? "AI is thinking…"
                  : referenceMovie
                  ? "Get my top 3 (AI)"
                  : "Select a reference movie first"}
              </Button>
            )}

            {error && <p className="text-destructive text-xs">{error}</p>}
          </div>
        </div>
      </aside>

      {/* ── Main results panel ── */}
      <main className="flex-1 h-screen overflow-y-auto bg-background">
        <AnimatePresence mode="wait">
          {stage === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full items-center justify-center text-muted-foreground text-sm"
            >
              Select genres and a decade to get started.
            </motion.div>
          )}

          {/* All 10 candidates */}
          {stage === "candidates" && (
            <motion.section
              key="candidates"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-8"
            >
              <h2 className="text-lg font-semibold mb-6">
                {candidates.length} candidates
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-5">
                {candidates.map((movie, i) => (
                  <MovieCard key={movie.imdbID} movie={movie} index={i} />
                ))}
              </div>
            </motion.section>
          )}

          {/* AI top 3 + remaining */}
          {stage === "ai-results" && aiResults.length > 0 && (
            <motion.section
              key="ai-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-8 space-y-10"
            >
              <div>
                <h2 className="text-lg font-semibold">Your top 3 picks</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Personalised based on{" "}
                  <span className="font-medium text-foreground">{referenceMovie?.Title}</span>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {aiResults.map((rec, i) => (
                  <MovieCard
                    key={rec.movie.imdbID}
                    movie={rec.movie}
                    index={i}
                    reason={rec.reason}
                    highlight
                  />
                ))}
              </div>

              {candidates.filter((m) => !aiMovieIds.has(m.imdbID)).length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                    Other candidates
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-5 opacity-40">
                    {candidates
                      .filter((m) => !aiMovieIds.has(m.imdbID))
                      .map((movie, i) => (
                        <MovieCard key={movie.imdbID} movie={movie} index={i} />
                      ))}
                  </div>
                </div>
              )}
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}
