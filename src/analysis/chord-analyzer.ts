import type { Pitch } from "../primitives/pitch.js";
import type { Chord } from "../chords/chord.js";

/**
 * A confidence-ranked interpretation of an unordered pitch set as a chord.
 */
export interface ChordInterpretation {
  readonly chord: Chord;

  /**
   * Confidence score in [0.0, 1.0].
   * 1.0 = complete, unambiguous chord.
   * Lower values indicate incomplete or ambiguous pitch sets.
   */
  readonly confidence: number;

  /** Human-readable rationale for this interpretation. */
  readonly rationale: string;
}

/**
 * Identifies the most likely chord(s) from an arbitrary set of pitches.
 *
 * The analyzer:
 * 1. Enumerates all rotations of the pitch set (testing each as a potential root).
 * 2. Scores each candidate against known chord templates.
 * 3. Returns results ranked by confidence, highest first.
 *
 * Pure function — stateless and deterministic.
 */
export interface ChordAnalyzer {
  /**
   * Return all plausible chord interpretations for the given pitches, ranked by confidence.
   * The pitch set may be incomplete (e.g. missing the fifth).
   * Returns an empty array if no conventional chord matches any rotation.
   *
   * @example analyze([C4, E4, G4])       → [{ chord: C major, confidence: 1.0 }]
   * @example analyze([C4, E4])            → [{ chord: C major, confidence: 0.6 }, …]
   * @example analyze([C4, F#4, A4])       → [{ chord: D7, confidence: 0.7 }, …]
   */
  analyze(pitches: ReadonlyArray<Pitch>): ReadonlyArray<ChordInterpretation>;

  /**
   * Return only the top-ranked interpretation.
   * Returns undefined if no conventional chord fits the pitch set.
   */
  bestFit(pitches: ReadonlyArray<Pitch>): ChordInterpretation | undefined;
}
