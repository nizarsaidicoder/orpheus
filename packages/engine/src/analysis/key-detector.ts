import type { Pitch } from "../primitives/pitch.ts";
import type { Key } from "../harmony/key.ts";
import { keyFactory } from "../harmony/key.ts";

// ---------------------------------------------------------------------------
// Krumhansl-Schmuckler key profiles (C-rooted)
// ---------------------------------------------------------------------------

const KS_MAJOR = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const KS_MINOR = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];

function rotateProfile(profile: number[], shift: number): number[] {
  return [...profile.slice(shift), ...profile.slice(0, shift)];
}

function pearsonCorrelation(a: number[], b: number[]): number {
  const n = 12;
  let sumA = 0, sumB = 0;
  for (let i = 0; i < n; i++) { sumA += a[i]!; sumB += b[i]!; }
  const meanA = sumA / n, meanB = sumB / n;
  let num = 0, denA = 0, denB = 0;
  for (let i = 0; i < n; i++) {
    const da = a[i]! - meanA, db = b[i]! - meanB;
    num += da * db; denA += da * da; denB += db * db;
  }
  if (denA === 0 || denB === 0) return 0;
  return num / Math.sqrt(denA * denB);
}

// 12 major keys (by signature 0..+11, mapped to circle position via tonic PC)
// Keys in circle order from C (sig 0) clockwise: C,G,D,A,E,B,F#,Db,Ab,Eb,Bb,F
const MAJOR_KEYS: ReadonlyArray<Key> = [
  keyFactory.major(0),   // C  (tonic PC 0)
  keyFactory.major(1),   // G  (tonic PC 7)
  keyFactory.major(2),   // D  (tonic PC 2)
  keyFactory.major(3),   // A  (tonic PC 9)
  keyFactory.major(4),   // E  (tonic PC 4)
  keyFactory.major(5),   // B  (tonic PC 11)
  keyFactory.major(6),   // F# (tonic PC 6)
  keyFactory.major(-5),  // Db (tonic PC 1)
  keyFactory.major(-4),  // Ab (tonic PC 8)
  keyFactory.major(-3),  // Eb (tonic PC 3)
  keyFactory.major(-2),  // Bb (tonic PC 10)
  keyFactory.major(-1),  // F  (tonic PC 5)
];

const MINOR_KEYS: ReadonlyArray<Key> = [
  keyFactory.minor(0),   // A  (tonic PC 9)
  keyFactory.minor(1),   // E  (tonic PC 4)
  keyFactory.minor(2),   // B  (tonic PC 11)
  keyFactory.minor(3),   // F# (tonic PC 6)
  keyFactory.minor(4),   // C# (tonic PC 1)
  keyFactory.minor(5),   // G# (tonic PC 8)
  keyFactory.minor(6),   // D# (tonic PC 3)
  keyFactory.minor(-5),  // Bb (tonic PC 10)
  keyFactory.minor(-4),  // F  (tonic PC 5)
  keyFactory.minor(-3),  // C  (tonic PC 0)
  keyFactory.minor(-2),  // G  (tonic PC 7)
  keyFactory.minor(-1),  // D  (tonic PC 2)
];

// ---------------------------------------------------------------------------
// Concrete implementation
// ---------------------------------------------------------------------------

export const keyDetector: KeyDetector = {
  detect(pitches: ReadonlyArray<Pitch>): ReadonlyArray<KeyDetectionResult> {
    if (pitches.length === 0) return [];

    // Build pitch class frequency vector
    const counts = new Array<number>(12).fill(0);
    for (const p of pitches) counts[p.pitchClass]!++;

    // Compute correlations for all 24 keys
    const correlations: Array<{ key: Key; r: number }> = [];
    for (const key of MAJOR_KEYS) {
      const profile = rotateProfile(KS_MAJOR, key.tonic.pitchClass);
      correlations.push({ key, r: pearsonCorrelation(counts, profile) });
    }
    for (const key of MINOR_KEYS) {
      const profile = rotateProfile(KS_MINOR, key.tonic.pitchClass);
      correlations.push({ key, r: pearsonCorrelation(counts, profile) });
    }

    // Sort descending by correlation
    correlations.sort((a, b) => b.r - a.r);

    // Normalize: map r ∈ [-1, 1] → confidence ∈ [0, 1]
    const maxR = correlations[0]!.r;
    const minR = correlations[correlations.length - 1]!.r;
    const range = maxR - minR || 1;

    return correlations.map(({ key, r }) => ({
      key,
      confidence: Math.max(0, Math.min(1, (r - minR) / range)),
    }));
  },

  bestGuess(pitches: ReadonlyArray<Pitch>): KeyDetectionResult | undefined {
    return keyDetector.detect(pitches)[0];
  },
};

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
