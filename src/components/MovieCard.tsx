"use client";

import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
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
      className="h-full"
    >
      <Card className={`overflow-hidden h-full flex flex-col hover:shadow-lg transition-shadow ${highlight ? "ring-2 ring-primary" : ""}`}>
        <div className="relative aspect-[2/3] bg-muted">
          {hasPoster ? (
            <Image
              src={movie.Poster}
              alt={movie.Title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
              No poster
            </div>
          )}
          {highlight && (
            <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-semibold px-2 py-0.5 rounded-full">
              AI Pick
            </div>
          )}
        </div>
        <CardContent className="p-3 flex flex-col gap-1">
          <p className="font-semibold text-sm leading-tight line-clamp-2">{movie.Title}</p>
          <p className="text-xs text-muted-foreground">{movie.Year}</p>
          {reason && (
            <p className="text-xs text-muted-foreground italic mt-1 line-clamp-3">{reason}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
