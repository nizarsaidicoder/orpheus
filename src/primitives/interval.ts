// ---------------------------------------------------------------------------
// Interval number and quality
// ---------------------------------------------------------------------------

/**
 * Diatonic interval number (ordinal, 1-based, music convention).
 * Unison = 1, Octave = 8, Thirteenth = 13.
 */
export type IntervalNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

/**
 * Quality of an interval.
 *
 * - Perfect:          applies to unisons (1), fourths (4), fifths (5), octaves (8),
 *                     and their compound equivalents (11, 12).
 * - Major / Minor:    applies to seconds, thirds, sixths, sevenths (and compounds).
 * - Aug / Dim:        applies to any interval number.
 * - Doubly aug/dim:   included for chromatic completeness (e.g. double-sharp leading tones).
 */
export type IntervalQuality =
  | "doubly-diminished"
  | "diminished"
  | "minor"
  | "perfect"
  | "major"
  | "augmented"
  | "doubly-augmented";

// ---------------------------------------------------------------------------
// Compile-time validity enforcement via discriminated union
// ---------------------------------------------------------------------------

/**
 * Perfect-interval numbers: unison, fourth, fifth, octave, and their compounds.
 * Only perfect-family qualities are valid for these.
 */
type PerfectIntervalConstraint = {
  readonly number:  1 | 4 | 5 | 8 | 11 | 12;
  readonly quality: "perfect" | "augmented" | "diminished" | "doubly-augmented" | "doubly-diminished";
};

/**
 * Imperfect-interval numbers: 2nds, 3rds, 6ths, 7ths, and compounds.
 * Perfect quality is not valid for these.
 */
type ImperfectIntervalConstraint = {
  readonly number:  2 | 3 | 6 | 7 | 9 | 10 | 13;
  readonly quality: "major" | "minor" | "augmented" | "diminished" | "doubly-augmented" | "doubly-diminished";
};

// ---------------------------------------------------------------------------
// Core Interval value object
// ---------------------------------------------------------------------------

/**
 * A fully qualified musical interval. Immutable value object.
 *
 * `semitones` is the canonical chromatic size; `number` + `quality` give the
 * diatonic spelling which determines enharmonic meaning in context.
 * A minor third and an augmented second are both 3 semitones but have different
 * diatonic functions and voice-leading implications.
 */
export interface Interval {
  readonly number:     IntervalNumber;
  readonly quality:    IntervalQuality;
  readonly semitones:  number;
  readonly isCompound: boolean;
}

/**
 * An Interval that has been validated for quality/number compatibility.
 * The TypeScript compiler will reject constructing `{ number: 3, quality: "perfect" }`
 * as a ValidInterval because 3 only appears in ImperfectIntervalConstraint.
 */
export type ValidInterval = (PerfectIntervalConstraint | ImperfectIntervalConstraint) & Interval;

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Constructs Interval instances. All methods return new immutable objects.
 */
export interface IntervalFactory {
  /**
   * Build a ValidInterval from a diatonic number and quality.
   * Throws TypeError if the quality is incompatible with the number
   * (e.g. perfect third, major fifth).
   */
  fromNumberAndQuality(number: IntervalNumber, quality: IntervalQuality): ValidInterval;

  /**
   * Build an Interval from a raw semitone count.
   * Uses major/perfect quality by default; pass `preferFlat: true` for minor/diminished.
   * For compound intervals pass semitones > 12.
   */
  fromSemitones(semitones: number, preferFlat?: boolean): Interval;
}

// ---------------------------------------------------------------------------
// Arithmetic (pure functions)
// ---------------------------------------------------------------------------

/**
 * Pure interval arithmetic. All operations return new Interval instances.
 */
export interface IntervalArithmetic {
  /**
   * Stack two intervals. P5 + P4 = P8.
   * Result number = a.number + b.number − 1 (music convention — roots overlap).
   */
  add(a: Interval, b: Interval): Interval;

  /**
   * Invert an interval within an octave.
   * Number rule: inverted number = 9 − original.
   * Quality rule: major ↔ minor, augmented ↔ diminished, perfect ↔ perfect.
   * @example invert(M3) → m6, invert(P5) → P4, invert(A4) → d5
   */
  invert(interval: Interval): Interval;

  /**
   * Complement: the interval that when added to `interval` sums to a perfect octave.
   * Equivalent to inversion for simple intervals.
   */
  complement(interval: Interval): Interval;

  /**
   * Reduce a compound interval to its simple equivalent within one octave.
   * @example simplify(M9) → M2, simplify(P8) → P8 (octave stays as-is)
   */
  simplify(interval: Interval): Interval;

  /**
   * Add one or more octaves to produce a compound interval.
   * @example compound(M3, 1) → M10
   */
  compound(interval: Interval, octaves?: number): Interval;

  /**
   * Compare two intervals by chromatic size.
   * Returns negative if a < b, 0 if equal, positive if a > b.
   */
  compare(a: Interval, b: Interval): number;
}

// ---------------------------------------------------------------------------
// Common interval constants (semitone values for reference)
// ---------------------------------------------------------------------------

export const SEMITONES = {
  UNISON:              0,
  MINOR_SECOND:        1,
  MAJOR_SECOND:        2,
  MINOR_THIRD:         3,
  MAJOR_THIRD:         4,
  PERFECT_FOURTH:      5,
  TRITONE:             6,
  PERFECT_FIFTH:       7,
  MINOR_SIXTH:         8,
  MAJOR_SIXTH:         9,
  MINOR_SEVENTH:       10,
  MAJOR_SEVENTH:       11,
  OCTAVE:              12,
  MINOR_NINTH:         13,
  MAJOR_NINTH:         14,
  MINOR_TENTH:         15,
  MAJOR_TENTH:         16,
  PERFECT_ELEVENTH:    17,
  AUGMENTED_ELEVENTH:  18,
  PERFECT_TWELFTH:     19,
  MINOR_THIRTEENTH:    20,
  MAJOR_THIRTEENTH:    21,
} as const;
