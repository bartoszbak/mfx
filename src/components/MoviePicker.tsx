"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MovieCard } from "@/components/MovieCard";
import { MovieCombobox } from "@/components/MovieCombobox";
import { getRecommendations, filterWithAI, AiRecommendation, TasteProfile } from "@/app/actions";
import { LanguageCombobox } from "@/components/LanguageCombobox";
import Image from "next/image";
import type { TmdbMovie } from "@/lib/types";

function HowItWorksModal({ onClose }: { onClose: () => void }) {
  const [showTech, setShowTech] = useState(false);

  return (
    <motion.div
      key="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="bg-background rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">How it works</h2>
          <button
            onClick={() => setShowTech((v) => !v)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
          >
            {showTech ? "Hide the tech" : "Cut the bs, give me tech."}
          </button>
        </div>
        <ol className="space-y-3 text-sm text-muted-foreground">
          <li className="flex gap-3">
            <span className="font-semibold text-foreground shrink-0">1.</span>
            <span>Pick a movie you recently loved — this becomes your taste reference.</span>
          </li>
          <li className="flex gap-3">
            <span className="font-semibold text-foreground shrink-0">2.</span>
            <span>Select one or more genres and a decade to narrow the search.</span>
          </li>
          <li className="flex gap-3">
            <span className="font-semibold text-foreground shrink-0">3.</span>
            <span>AI extracts the emotional tone, pacing, and style of your reference movie.</span>
          </li>
          <li className="flex gap-3">
            <span className="font-semibold text-foreground shrink-0">4.</span>
            <span>It scores candidates against your taste profile and returns your top 7 matches.</span>
          </li>
        </ol>

        <AnimatePresence>
          {showTech && (
            <motion.ol
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="overflow-hidden space-y-3 text-sm text-muted-foreground mt-5 pt-5 border-t border-border"
            >
              <li className="flex gap-3">
                <span className="font-semibold text-foreground shrink-0">①</span>
                <span>Your filters hit the <strong className="text-foreground">TMDB Discover API</strong> — genre IDs, decade range, original language, sorted by vote count. Returns up to 10 candidates.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-foreground shrink-0">②</span>
                <span>Your reference movie and all candidates are fetched in parallel from <strong className="text-foreground">TMDB movie + credits endpoints</strong>.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-foreground shrink-0">③</span>
                <span><strong className="text-foreground">GPT-4o-mini via OpenRouter</strong> extracts a structured taste profile from the reference: emotional tone, pacing, narrative complexity, aesthetic style, themes, and more — as JSON.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-foreground shrink-0">④</span>
                <span>A second <strong className="text-foreground">GPT-4o-mini</strong> call scores each candidate against every taste attribute and returns the top 7 ranked matches with one-sentence reasons.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-foreground shrink-0">⑤</span>
                <span>Everything runs as <strong className="text-foreground">Next.js Server Actions</strong> — no API routes, no client-side secrets.</span>
              </li>
            </motion.ol>
          )}
        </AnimatePresence>

        <Button className="mt-6 w-full" onClick={onClose}>Got it</Button>
      </motion.div>
    </motion.div>
  );
}

function TasteProfileModal({ profile, referenceMovie, onClose }: { profile: TasteProfile; referenceMovie: TmdbMovie; onClose: () => void }) {
  const rows: { label: string; value: string }[] = [
    { label: "Emotional tone", value: profile.emotional_tone.join(", ") },
    { label: "Pacing", value: profile.pacing },
    { label: "Narrative complexity", value: profile.narrative_complexity },
    { label: "Orientation", value: profile.orientation },
    { label: "World type", value: profile.world_type },
    { label: "Novelty", value: profile.novelty },
    { label: "Themes", value: profile.themes.join(", ") },
    { label: "Creator signals", value: profile.creator_signals.join(", ") },
  ].filter((r) => r.value);

  const hasPoster = referenceMovie.Poster && referenceMovie.Poster !== "N/A";

  return (
    <motion.div
      key="taste-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="bg-background rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4">Taste profile</h2>

        {/* Reference movie */}
        <div className="flex gap-3 mb-5 pb-5 border-b border-border">
          <div className="relative w-12 h-16 shrink-0 rounded-lg overflow-hidden bg-muted ring-1 ring-black/10">
            {hasPoster ? (
              <Image src={referenceMovie.Poster} alt={referenceMovie.Title} fill className="object-cover" sizes="48px" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-[10px]">?</div>
            )}
          </div>
          <div className="min-w-0 self-center">
            <p className="font-medium text-sm text-foreground leading-tight">{referenceMovie.Title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{referenceMovie.Year} · your reference pick</p>
          </div>
        </div>

        <dl className="space-y-3">
          {rows.map(({ label, value }) => (
            <div key={label} className="flex gap-3">
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground w-36 shrink-0 pt-0.5">
                {label}
              </dt>
              <dd className="text-sm text-foreground">{value}</dd>
            </div>
          ))}
        </dl>
        <Button className="mt-6 w-full" onClick={onClose}>Close</Button>
      </motion.div>
    </motion.div>
  );
}

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

export function MoviePicker() {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedDecade, setSelectedDecade] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [referenceMovie, setReferenceMovie] = useState<TmdbMovie | null>(null);
  const [aiResults, setAiResults] = useState<AiRecommendation[]>([]);
  const [tasteProfile, setTasteProfile] = useState<TasteProfile | null>(null);
  const [hasResults, setHasResults] = useState(false);
  const [error, setError] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showTasteProfile, setShowTasteProfile] = useState(false);

  function toggleGenre(genre: string) {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  }

  function handleGetRecommendations() {
    if (selectedGenres.length === 0 || !selectedDecade || !referenceMovie) return;
    setError("");
    setAiResults([]);
    setTasteProfile(null);
    setHasResults(false);
    startTransition(async () => {
      try {
        const candidates = await getRecommendations(selectedGenres, selectedDecade, selectedCountry || undefined);
        if (candidates.length === 0) {
          setError("No movies found. Try different filters.");
          return;
        }
        const { recommendations, tasteProfile } = await filterWithAI(candidates, referenceMovie.tmdbID, selectedCountry || undefined);
        setAiResults(recommendations);
        setTasteProfile(tasteProfile);
        setHasResults(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    });
  }

  const canSubmit = selectedGenres.length > 0 && selectedDecade !== "" && referenceMovie !== null;

  return (
    <>
      {/* ── Sidebar ── */}
      <aside className="w-[380px] shrink-0 h-screen flex flex-col p-6">
        <div className="flex flex-col gap-7 flex-1 bg-background border border-border rounded-2xl shadow-md overflow-y-auto p-6">
          {/* Branding */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Mindflix</h1>
            <p className="text-xs text-muted-foreground mt-1 leading-snug">
              Pick a movie you loved, choose genres &amp; a decade — get AI-curated picks tailored to your taste.
            </p>
          </div>

          {/* Reference movie */}
          <section className="space-y-2">
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
            <div className="flex flex-wrap gap-2">
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
                      className={`cursor-pointer select-none text-sm px-3.5 py-1.5 transition-colors ${
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
            <div className="flex flex-wrap gap-2">
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
                      className={`cursor-pointer select-none text-sm px-3.5 py-1.5 transition-colors ${
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

          {/* Cinema from */}
          <section className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Cinema from
            </h2>
            <LanguageCombobox value={selectedCountry} onChange={setSelectedCountry} />
          </section>

          {/* Action */}
          <div className="flex flex-col gap-2 mt-auto pt-4">
            <Button
              onClick={handleGetRecommendations}
              disabled={!canSubmit || isPending}
              className="w-full"
            >
              {isPending ? "Finding your picks…" : "Get my top 7"}
            </Button>
            {!referenceMovie && (
              <p className="text-xs text-muted-foreground text-center">
                Add a reference movie to unlock
              </p>
            )}
            {error && <p className="text-destructive text-xs">{error}</p>}
          </div>
        </div>
      </aside>

      <AnimatePresence>
        {showHowItWorks && <HowItWorksModal onClose={() => setShowHowItWorks(false)} />}
        {showTasteProfile && tasteProfile && referenceMovie && (
          <TasteProfileModal
            profile={tasteProfile}
            referenceMovie={referenceMovie}
            onClose={() => setShowTasteProfile(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Main results panel ── */}
      <main className="flex-1 h-screen overflow-y-auto scroll-smooth snap-y snap-mandatory bg-background relative">
        <div className="sticky top-0 z-10 flex justify-end gap-2 p-4 pointer-events-none">
          <AnimatePresence>
            {tasteProfile && referenceMovie && (
              <motion.div
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="pointer-events-auto"
                  onClick={() => setShowTasteProfile(true)}
                >
                  Your taste
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
          <Button
            variant="outline"
            size="sm"
            className="pointer-events-auto"
            onClick={() => setShowHowItWorks(true)}
          >
            How it works
          </Button>
        </div>
        <AnimatePresence mode="wait">
          {!hasResults && !isPending && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full items-center justify-center text-muted-foreground text-sm"
            >
              Select a reference movie, genres, and a decade to get started.
            </motion.div>
          )}

          {isPending && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full items-center justify-center text-muted-foreground text-sm gap-2"
            >
              <span className="animate-pulse">Analysing your taste and finding the best matches…</span>
            </motion.div>
          )}

          {hasResults && aiResults.length > 0 && (
            <motion.div
              key="ai-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {aiResults.map((rec, i) => (
                <div key={rec.movie.imdbID} className="h-screen flex items-center justify-center snap-center">
                  <MovieCard movie={rec.movie} index={i} reason={rec.reason} highlight />
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}
