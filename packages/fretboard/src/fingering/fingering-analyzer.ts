import type { ChordVoicing, FretPosition } from "../types/fret-position.ts";
import type { Fingering, FingerAssignment, BarreSegment, Finger } from "../types/fingering.ts";
import { scoreVoicing } from "../chord-shapes/shape-scorer.ts";

function detectBarre(played: FretPosition[]): BarreSegment | undefined {
  // Group by fret, look for 2+ positions on the same fret spanning contiguous strings
  const byFret = new Map<number, FretPosition[]>();
  for (const p of played) {
    if (p.fret === 0) continue;
    const group = byFret.get(p.fret) ?? [];
    group.push(p);
    byFret.set(p.fret, group);
  }

  let bestBarre: BarreSegment | undefined;
  for (const [fret, positions] of byFret) {
    if (positions.length < 2) continue;
    const strings = positions.map(p => p.string).sort((a, b) => a - b);
    // Check contiguous
    let contiguous = true;
    for (let i = 1; i < strings.length; i++) {
      if (strings[i]! - strings[i - 1]! > 1) { contiguous = false; break; }
    }
    if (!contiguous) continue;
    // Use lowest fret barre (index finger)
    if (bestBarre === undefined || fret < bestBarre.fret) {
      bestBarre = {
        fret,
        fromString: strings[0]!,
        toString: strings[strings.length - 1]!,
        finger: 1,
      };
    }
  }
  return bestBarre;
}

export const fingeringAnalyzer = {
  assign(voicing: ChordVoicing): Fingering {
    const played = voicing.slots.filter((s): s is FretPosition => s !== null);
    const barre = detectBarre(played);

    // Positions not covered by barre need individual fingers
    const barreCovered = new Set<FretPosition>();
    if (barre !== undefined) {
      for (const p of played) {
        if (p.fret === barre.fret && p.string >= barre.fromString && p.string <= barre.toString) {
          barreCovered.add(p);
        }
      }
    }

    const needsFinger = played
      .filter(p => p.fret > 0 && !barreCovered.has(p))
      .sort((a, b) => a.fret !== b.fret ? a.fret - b.fret : b.string - a.string);

    // Fingers available: barre uses finger 1, rest get 2,3,4
    const availableFingers: Finger[] = barre !== undefined ? [2, 3, 4] : [1, 2, 3, 4];

    if (needsFinger.length > availableFingers.length) {
      throw new RangeError(
        `Voicing requires ${needsFinger.length + (barre ? 1 : 0)} fingers but only 4 available`,
      );
    }

    const assignments: FingerAssignment[] = [];

    // Barre assignment
    if (barre !== undefined) {
      for (const p of barreCovered) {
        assignments.push({ position: p, finger: 1, isBarre: true });
      }
    }

    // Open strings: finger 0
    for (const p of played) {
      if (p.fret === 0) {
        assignments.push({ position: p, finger: 0, isBarre: false });
      }
    }

    // Remaining fretted positions
    for (let i = 0; i < needsFinger.length; i++) {
      assignments.push({ position: needsFinger[i]!, finger: availableFingers[i]!, isBarre: false });
    }

    const difficulty = scoreVoicing(voicing);
    return { voicing, assignments, difficulty };
  },
};
