"use client";

import { motion } from "motion/react";
import type { TmdbMovie } from "@/lib/types";
import Image from "next/image";

interface Props {
  movie: TmdbMovie;
  index: number;
  reason?: string;
  highlight?: boolean;
}

export function MovieCard({ movie, index, reason, highlight }: Props) {
  const hasPoster = movie.Poster && movie.Poster !== "N/A";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className="relative group bg-muted overflow-hidden rounded-[1.5rem]"
      style={{ height: "70vh", aspectRatio: "2/3" }}
    >
      {/* Poster */}
      {hasPoster ? (
        <Image
          src={movie.Poster}
          alt={movie.Title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, 20vw"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
          No poster
        </div>
      )}

      {highlight && (
        <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-semibold px-2 py-0.5 rounded-full z-10">
          AI Pick
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-x-2 bottom-2 translate-y-[calc(100%+0.5rem)] group-hover:translate-y-0 transition-transform duration-300 ease-in-out bg-white rounded-2xl p-3 flex flex-col gap-1">
        <p className="font-semibold text-sm text-gray-900 leading-tight line-clamp-2">{movie.Title}</p>
        <p className="text-xs text-gray-500">{movie.Year}</p>
        {reason && (
          <p className="text-xs text-gray-600 italic mt-1 line-clamp-4">{reason}</p>
        )}
      </div>
    </motion.div>
  );
}
