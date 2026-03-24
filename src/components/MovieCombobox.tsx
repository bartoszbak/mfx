"use client";

import { useState, useEffect, useRef } from "react";
import type { TmdbMovie } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface Props {
  onSelect: (movie: TmdbMovie) => void;
  selected: TmdbMovie | null;
}

export function MovieCombobox({ onSelect, selected }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TmdbMovie[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const justSelectedRef = useRef(false);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    // Skip search triggered by selecting a movie
    if (justSelectedRef.current) {
      justSelectedRef.current = false;
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/movie-search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 350);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleSelect(movie: TmdbMovie) {
    justSelectedRef.current = true;
    onSelect(movie);
    setQuery(movie.Title);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <Input
        placeholder="Pick a movie…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          if (selected && e.target.value !== selected.Title) onSelect(null as unknown as TmdbMovie);
        }}
        className="w-full"
      />
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
          …
        </div>
      )}
      {open && results.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg max-h-72 overflow-y-auto">
          {results.map((movie) => {
            const hasPoster = movie.Poster && movie.Poster !== "N/A";
            return (
              <li
                key={movie.imdbID}
                onMouseDown={() => handleSelect(movie)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors",
                  selected?.imdbID === movie.imdbID && "bg-accent"
                )}
              >
                <div className="relative w-8 h-12 shrink-0 bg-muted rounded overflow-hidden">
                  {hasPoster ? (
                    <Image src={movie.Poster} alt={movie.Title} fill className="object-cover" sizes="32px" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-[10px]">?</div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{movie.Title}</p>
                  <p className="text-xs text-muted-foreground">{movie.Year}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
