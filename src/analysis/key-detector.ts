import type { Pitch } from "../primitives/pitch.js";
import type { Key } from "../harmony/key.js";

/**
 * A probabilistic key detection result.
 */
export interface KeyDetectionResult {
  readonly key: Key;

  /**
   * Confidence score in [0.0, 1.0].
   * Computed from pitch-class coverage against the key's scale,
   * weighted by the Krumhansl-Schmuckler key profiles.
   */
  readonly confidence: number;
}

/**
 * Estimates the most likely key(s) from a collection of pitches.
 *
 * Uses pitch-class frequency distribution matched against major and minor
 * key profiles. The algorithm is probabilistic — a chromatic pitch set
 * will return low-confidence results.
 *
 * Pure function — no state, no side effects.
 */
export interface KeyDetector {
  /**
   * Return all 24 major/minor keys ranked by confidence, highest first.
   *
   * @example detect([C, D, E, F, G, A, B]) → C major at confidence ~0.95, …
   * @example detect([C, Db, D, Eb, E, F, F#, G, Ab, A, Bb, B]) → low confidence, multiple candidates
   */
  detect(pitches: ReadonlyArray<Pitch>): ReadonlyArray<KeyDetectionResult>;

  /**
   * Return only the top-ranked key.
   * Returns undefined if the pitch set is empty.
   */
  bestGuess(pitches: ReadonlyArray<Pitch>): KeyDetectionResult | undefined;
}
