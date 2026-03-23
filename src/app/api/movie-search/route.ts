import { NextRequest, NextResponse } from "next/server";
import { searchMoviesByTitle } from "@/lib/tmdb";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  if (q.length < 2) return NextResponse.json([]);
  try {
    const movies = await searchMoviesByTitle(q);
    return NextResponse.json(movies);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
