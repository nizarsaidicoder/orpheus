import type { ChordVoicing } from "../types/fret-position.ts";

export function scoreVoicing(voicing: ChordVoicing): number {
  const played = voicing.slots.filter((s): s is NonNullable<typeof s> => s !== null);
  if (played.length === 0) return Infinity;

  const activeFrets = played.map(p => p.fret).filter(f => f > 0);
  const openCount = played.length - activeFrets.length;

  let score = 0;

  // Fret span penalty
  if (activeFrets.length >= 2) {
    const minFret = Math.min(...activeFrets);
    const maxFret = Math.max(...activeFrets);
    score += (maxFret - minFret) * 10;
    // High-up-neck penalty
    score += Math.max(0, minFret - 12) * 5;
  }

  // String skip penalty: gaps between played strings
  const playedStrings = played.map(p => p.string).sort((a, b) => a - b);
  for (let i = 1; i < playedStrings.length; i++) {
    const gap = playedStrings[i]! - playedStrings[i - 1]! - 1;
    score += gap * 8;
  }

  // Barre penalty
  if (voicing.barre !== undefined) score += 15;

  // Open string bonus
  score -= openCount * 8;

  // Thin voicing penalty
  if (played.length <= 3) score += 5;

  // CAGED shape bonus: familiar shapes are easier to play
  if (voicing.shape !== undefined) score -= 10;

  // Root not in bass penalty — checked externally in finder
  return Math.max(0, score);
}
