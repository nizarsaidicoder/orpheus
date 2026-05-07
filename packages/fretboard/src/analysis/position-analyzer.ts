import { chordAnalyzer, defaultScaleRegistry, scaleFactory } from "@orpheus/engine";
import type { Chord, Scale, Key } from "@orpheus/engine";
import type { FretPosition } from "../types/fret-position.ts";

export const positionAnalyzer = {
  identifyChord(positions: ReadonlyArray<FretPosition>): Chord | null {
    if (positions.length === 0) return null;
    const pitches = positions.map(p => p.pitch);
    const result = chordAnalyzer.bestFit(pitches);
    return result !== undefined ? result.chord : null;
  },

  identifyScale(positions: ReadonlyArray<FretPosition>, hint?: Key): Scale | null {
    if (positions.length === 0) return null;
    const inputPCs = new Set(positions.map(p => p.pitch.pitchClass as number));

    const root = hint?.tonic ?? positions[0]!.pitch;
    const rootPC = root.pitchClass as number;

    let bestPattern = null;
    let bestScore = 0;

    for (const name of defaultScaleRegistry.names) {
      const pattern = defaultScaleRegistry.get(name)!;
      const patternPCs = new Set(pattern.intervals.map(iv => (rootPC + iv) % 12));

      let matches = 0;
      for (const pc of inputPCs) {
        if (patternPCs.has(pc)) matches++;
      }

      const coverage = matches / Math.max(patternPCs.size, inputPCs.size);
      if (coverage > bestScore) {
        bestScore = coverage;
        bestPattern = pattern;
      }
    }

    if (bestPattern === null || bestScore < 0.6) return null;
    return scaleFactory.build(bestPattern, root);
  },
};
