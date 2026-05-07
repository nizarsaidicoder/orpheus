import type { Chord } from "../chords/chord.ts";
import type { Key } from "../harmony/key.ts";
import type { Scale } from "../scales/scale.ts";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

type FunctionEntry = { func: TonalFunction; role?: string };

// Tonal function by scale degree (1-7) in a major key
const MAJOR_FUNCTIONS: Readonly<Record<number, FunctionEntry>> = {
  1: { func: "tonic" },
  2: { func: "predominant", role: "supertonic" },
  3: { func: "tonic",       role: "tonic-substitute" },
  4: { func: "predominant", role: "subdominant" },
  5: { func: "dominant" },
  6: { func: "tonic",       role: "tonic-substitute" },
  7: { func: "dominant",    role: "leading-tone" },
};

// Tonal function by scale degree (1-7) in a minor key (for borrowed chord analysis)
const MINOR_FUNCTIONS: Readonly<Record<number, FunctionEntry>> = {
  1: { func: "tonic" },
  2: { func: "predominant", role: "supertonic" },
  3: { func: "tonic",       role: "tonic-substitute" },
  4: { func: "predominant", role: "subdominant" },
  5: { func: "dominant" },
  6: { func: "tonic",       role: "tonic-substitute" },
  7: { func: "ambiguous" },  // subtonic (natural minor leading tone) — not a clear dominant
};

const QUALITY_FAMILY: Readonly<Record<string, string>> = {
  major: "major", dominant7: "major", major7: "major", major9: "major",
  minor: "minor", minor7: "minor", "minor-major7": "minor", minor9: "minor",
  diminished: "diminished", "half-diminished7": "diminished", diminished7: "diminished",
  augmented: "augmented", "augmented-major7": "augmented",
};

function qualityFamily(kind: string): string {
  return QUALITY_FAMILY[kind] ?? kind;
}

// Derive the triad quality family for scale degree `d` from raw semitone intervals,
// avoiding any Chord allocation.
function diatonicTriadFamily(scale: Scale, d: number): string {
  const root  = scale.degree(d);
  const third = scale.degree(d + 2);
  const fifth = scale.degree(d + 4);
  const t = third.midi - root.midi;
  const f = fifth.midi - root.midi;
  if (t === 3 && f === 6) return "diminished";
  if (t === 3 && f === 7) return "minor";
  if (t === 4 && f === 8) return "augmented";
  return "major";
}

interface DiatonicMatch { scaleDegree: number; family: string }

function findDiatonicDegree(chord: Chord, key: Key): DiatonicMatch | undefined {
  const scale = key.naturalScale;
  const len = scale.pattern.intervals.length;
  for (let d = 1; d <= len; d++) {
    if (scale.degree(d).pitchClass === chord.root.pitchClass) {
      return { scaleDegree: d, family: diatonicTriadFamily(scale, d) };
    }
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Concrete implementation
// ---------------------------------------------------------------------------

export const functionalAnalyzer: FunctionalAnalyzer = {
  analyze(chord: Chord, key: Key): FunctionalAnalysis {
    const chordFamily = qualityFamily(chord.quality.kind);

    function makeResult(entry: FunctionEntry, borrowed: boolean): FunctionalAnalysis {
      return {
        chord, key,
        function: entry.func,
        ...(entry.role !== undefined ? { role: entry.role } : {}),
        isBorrowed: borrowed,
      };
    }

    // Check main key
    const mainDegree = findDiatonicDegree(chord, key);
    if (mainDegree !== undefined) {
      if (mainDegree.family === chordFamily) {
        const map = key.modality === "major" ? MAJOR_FUNCTIONS : MINOR_FUNCTIONS;
        const entry = map[mainDegree.scaleDegree] ?? { func: "ambiguous" as TonalFunction };
        return makeResult(entry, false);
      }
      // Root diatonic but quality altered — check parallel key
      const parallelDegree = findDiatonicDegree(chord, key.parallel);
      if (parallelDegree !== undefined && parallelDegree.family === chordFamily) {
        const map = key.parallel.modality === "major" ? MAJOR_FUNCTIONS : MINOR_FUNCTIONS;
        const entry = map[parallelDegree.scaleDegree] ?? { func: "ambiguous" as TonalFunction };
        return makeResult(entry, true);
      }
      // Quality unmatched — assign function from main key, not borrowed
      const entry = (key.modality === "major" ? MAJOR_FUNCTIONS : MINOR_FUNCTIONS)[mainDegree.scaleDegree]
        ?? { func: "ambiguous" as TonalFunction };
      return makeResult(entry, false);
    }

    // Root not in main key — check parallel key for borrowing
    const parallelDegree = findDiatonicDegree(chord, key.parallel);
    if (parallelDegree !== undefined && parallelDegree.family === chordFamily) {
      const map = key.parallel.modality === "major" ? MAJOR_FUNCTIONS : MINOR_FUNCTIONS;
      const entry = map[parallelDegree.scaleDegree] ?? { func: "ambiguous" as TonalFunction };
      return makeResult(entry, true);
    }

    return { chord, key, function: "ambiguous", isBorrowed: false };
  },
};

/**
 * The three classical tonal functions of a chord within a key.
 * `ambiguous` is returned when the chord's function cannot be determined
 * (e.g. borrowed chords, chords outside the key, or tritone-related chords).
 */
export type TonalFunction = "tonic" | "predominant" | "dominant" | "ambiguous";

/**
 * Full functional analysis result for a chord in a key context.
 */
export interface FunctionalAnalysis {
  readonly chord:    Chord;
  readonly key:      Key;
  readonly function: TonalFunction;

  /**
   * Specific role within the tonal function, where applicable.
   * @example "leading-tone" for viidim7 (dominant function)
   * @example "subdominant" for IV (predominant function)
   * @example "tonic-substitute" for vi (tonic function)
   */
  readonly role?: string;

  /**
   * True if the chord is borrowed from the parallel key (modal mixture).
   * @example bVII in C major = borrowed from C minor
   * @example iv in C major = borrowed from C minor
   */
  readonly isBorrowed: boolean;
}

/**
 * Analyzes the tonal function of a chord within a given key context.
 * Pure function — no state.
 */
export interface FunctionalAnalyzer {
  /**
   * Determine the tonal function of `chord` in `key`.
   *
   * Diatonic assignments (major key):
   * - Tonic:        I, iii, vi
   * - Predominant:  ii, IV
   * - Dominant:     V, viidim
   *
   * Borrowed chords from the parallel minor are analyzed for function
   * within the parallel context and flagged as `isBorrowed: true`.
   */
  analyze(chord: Chord, key: Key): FunctionalAnalysis;
}
