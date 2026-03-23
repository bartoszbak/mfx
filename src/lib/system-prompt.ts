export function buildExtractionPrompt(title: string, plot: string, genre: string, director: string, actors: string): string {
  return `You are a film analysis assistant designed to extract structured "taste attributes" from a movie.

Your goal is to analyze the given movie and return a concise, well-structured profile that captures how the movie *feels*, not just what it is about.

Movie:
Title: ${title}
Genre: ${genre}
Director: ${director}
Actors: ${actors}
Plot: ${plot}

---

Extract and return the following attributes:

1. Emotional Tone
Describe the dominant emotional experience (e.g. tense, melancholic, uplifting, unsettling, comforting).
Return 2–4 descriptors.

2. Pacing & Energy
Classify pacing as: slow / moderate / fast
Add a short explanation (1 sentence).

3. Narrative Complexity
Classify as: simple / moderate / complex
Indicate if nonlinear or ambiguous.

4. Aesthetic & Visual Style
Describe the visual language (e.g. naturalistic, stylized, cinematic, raw, high-production, minimalist).

5. Character vs Plot Orientation
Classify as: character-driven / plot-driven / balanced
Add 1 sentence explanation.

6. Theme & Intellectual Depth
List 2–4 core themes (e.g. identity, mortality, power, love, isolation).
Indicate depth: light / medium / deep.

7. World Type
Classify setting as: real-world / historical / sci-fi / fantasy / mixed.

8. Familiarity vs Novelty
Classify as: familiar / somewhat fresh / highly experimental
Explain briefly.

9. Social Context Fit
Recommend best viewing context: alone / with partner / with friends
Add 1 short explanation.

10. Creator Signals
Mention notable director/style signals or comparable filmmakers.

---

Return a clean JSON object — no markdown, no text outside the JSON:

{
  "title": "",
  "emotional_tone": [],
  "pacing": { "level": "", "note": "" },
  "narrative_complexity": { "level": "", "nonlinear": true, "ambiguous": true },
  "aesthetic_style": [],
  "orientation": { "type": "", "note": "" },
  "themes": { "topics": [], "depth": "" },
  "world_type": "",
  "novelty": { "level": "", "note": "" },
  "social_context": { "best_for": "", "note": "" },
  "creator_signals": []
}

Rules:
- Be precise, not verbose
- Avoid generic descriptions like "interesting" or "good"
- Focus on viewer experience, not plot summary
- If unsure, make the most reasonable inference`;
}

export function buildRecommendationPrompt(): string {
  return `You are a movie recommendation expert. You will receive:
1. A taste profile extracted from a reference movie the user loved — describing how that film *feels*
2. A list of 10 candidate movies (title, year, genre, director, actors, plot, rating)

Your task:
- Score each candidate against every attribute in the taste profile (emotional tone, pacing, narrative complexity, aesthetic style, orientation, themes, world type, novelty, social context, creator signals)
- Select exactly 3 candidates that best match the taste profile across the most attributes
- Rank them from best to third-best match

Respond with a JSON object in this exact shape (no markdown, no text outside the JSON):
{
  "recommendations": [
    {
      "imdbID": "string",
      "reason": "One sentence referencing 2+ specific taste attributes that match (e.g. shares the tense pacing and character-driven focus of the reference)"
    }
  ]
}

Rules:
- Never include more or fewer than 3 items
- The reason must reference specific taste attributes, not just genre overlap
- Do not mention the candidate movie title in the reason — the UI shows it already
- Do not mention the reference movie title by name in the reason`;
}
