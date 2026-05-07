import type { Chord } from "@orpheus/engine";
import type { Fretboard } from "../fretboard/fretboard.js";
import type { FretboardConstraints, Fingering } from "../types/fingering.js";
import { shapeFinder } from "../chord-shapes/shape-finder.js";

function minActiveFret(fingering: Fingering): number {
  const active = fingering.voicing.slots
    .filter((s): s is NonNullable<typeof s> => s !== null)
    .map(p => p.fret)
    .filter(f => f > 0);
  return active.length > 0 ? Math.min(...active) : 0;
}

export const handOptimizer = {
  best(chord: Chord, fretboard: Fretboard, constraints: FretboardConstraints = {}): Fingering {
    const fingerings = shapeFinder.findWithFingering(chord, fretboard, constraints);
    if (fingerings.length === 0) {
      throw new RangeError(`No valid fingering found for chord`);
    }
    return fingerings[0]!;
  },

  optimalPath(chords: ReadonlyArray<Chord>, fretboard: Fretboard, constraints: FretboardConstraints = {}): ReadonlyArray<Fingering> {
    if (chords.length === 0) return [];

    const candidatesPerChord = chords.map(chord =>
      shapeFinder.findWithFingering(chord, fretboard, constraints).slice(0, 10),
    );

    const result: Fingering[] = [];
    let prevMinFret = 0;

    for (const candidates of candidatesPerChord) {
      if (candidates.length === 0) throw new RangeError(`No valid fingering found for a chord in sequence`);

      // Pick candidate with minimal hand shift from previous position
      const best = candidates.reduce((a, b) => {
        const da = Math.abs(minActiveFret(a) - prevMinFret);
        const db = Math.abs(minActiveFret(b) - prevMinFret);
        if (da !== db) return da < db ? a : b;
        return a.difficulty < b.difficulty ? a : b;
      });

      result.push(best);
      prevMinFret = minActiveFret(best);
    }

    return result;
  },
};
