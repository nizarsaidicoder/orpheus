import type { Chord } from "../chords/chord.js";
import type { Key } from "../harmony/key.js";

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
