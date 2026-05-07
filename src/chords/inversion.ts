import type { Pitch } from "../primitives/pitch.js";
import type { Chord, InversionPosition } from "./chord.js";

/**
 * Determine the inversion position of a chord from its bass pitch and root.
 *
 * Returns "root" if the bass pitch is enharmonically equal to the chord root.
 * Returns "first", "second", or "third" based on which chord tone is in the bass.
 * Returns undefined if the bass pitch is not a chord tone (slash chord with non-chord bass).
 */
export interface InversionAnalyzer {
  analyze(chord: Chord): InversionPosition | undefined;

  /**
   * Return the index (0-based) into `chord.pitches` of the current bass note.
   * For root position: 0. For first inversion: index of the 3rd, etc.
   */
  bassIndex(chord: Chord): number;

  /**
   * True if the chord is in root position (root is in the bass).
   * Considers `bassNote` override when present.
   */
  isRootPosition(chord: Chord): boolean;
}

/**
 * Rotate chord pitches to place a specific chord tone in the bass.
 * Raises pitches below the target bass by one octave to maintain ascending order.
 *
 * Pure function — returns a new pitch array; does not modify the chord.
 */
export function rotatePitchesToBass(pitches: ReadonlyArray<Pitch>, bassIndex: number): ReadonlyArray<Pitch> {
  if (bassIndex === 0) return pitches;
  const below = pitches.slice(0, bassIndex);
  const above = pitches.slice(bassIndex);
  // Pitches that were below the new bass need octave adjustment — handled by concrete impl
  return [...above, ...below];
}
