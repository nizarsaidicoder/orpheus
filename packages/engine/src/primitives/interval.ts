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

// ---------------------------------------------------------------------------
// Internal lookup tables and helpers
// ---------------------------------------------------------------------------

const BASE_SEMITONES: Record<IntervalNumber, number> = {
  1: 0, 2: 2, 3: 4, 4: 5, 5: 7, 6: 9, 7: 11,
  8: 12, 9: 14, 10: 16, 11: 17, 12: 19, 13: 21,
};

const PERFECT_NUMBERS = new Set<number>([1, 4, 5, 8, 11, 12]);

const SEMITONES_TO_INTERVAL: Readonly<Record<number, [IntervalNumber, IntervalQuality]>> = {
  0:  [1,  "perfect"],
  1:  [2,  "minor"],
  2:  [2,  "major"],
  3:  [3,  "minor"],
  4:  [3,  "major"],
  5:  [4,  "perfect"],
  6:  [4,  "augmented"],
  7:  [5,  "perfect"],
  8:  [6,  "minor"],
  9:  [6,  "major"],
  10: [7,  "minor"],
  11: [7,  "major"],
  12: [8,  "perfect"],
  13: [9,  "minor"],
  14: [9,  "major"],
  15: [10, "minor"],
  16: [10, "major"],
  17: [11, "perfect"],
  18: [11, "augmented"],
  19: [12, "perfect"],
  20: [13, "minor"],
  21: [13, "major"],
};

const QUALITY_INVERSION: Record<IntervalQuality, IntervalQuality> = {
  "perfect":           "perfect",
  "major":             "minor",
  "minor":             "major",
  "augmented":         "diminished",
  "diminished":        "augmented",
  "doubly-augmented":  "doubly-diminished",
  "doubly-diminished": "doubly-augmented",
};

function qualityOffset(quality: IntervalQuality, isPerfect: boolean): number {
  switch (quality) {
    case "doubly-diminished": return isPerfect ? -2 : -3;
    case "diminished":        return isPerfect ? -1 : -2;
    case "minor":             return -1;
    case "perfect":           return 0;
    case "major":             return 0;
    case "augmented":         return 1;
    case "doubly-augmented":  return 2;
  }
}

function qualityFromOffset(offset: number, isPerfect: boolean): IntervalQuality {
  if (isPerfect) {
    if (offset <= -2) return "doubly-diminished";
    if (offset === -1) return "diminished";
    if (offset === 0)  return "perfect";
    if (offset === 1)  return "augmented";
    return "doubly-augmented";
  } else {
    if (offset <= -3) return "doubly-diminished";
    if (offset === -2) return "diminished";
    if (offset === -1) return "minor";
    if (offset === 0)  return "major";
    if (offset === 1)  return "augmented";
    return "doubly-augmented";
  }
}

function validateQualityForNumber(number: IntervalNumber, quality: IntervalQuality): void {
  const isPerfect = PERFECT_NUMBERS.has(number);
  if (isPerfect && (quality === "major" || quality === "minor")) {
    throw new TypeError(
      `quality "${quality}" is invalid for perfect-type interval number ${number}`
    );
  }
  if (!isPerfect && quality === "perfect") {
    throw new TypeError(
      `quality "perfect" is invalid for imperfect-type interval number ${number}`
    );
  }
}

// ---------------------------------------------------------------------------
// Concrete implementations
// ---------------------------------------------------------------------------

export const intervalFactory: IntervalFactory = {
  fromNumberAndQuality(number: IntervalNumber, quality: IntervalQuality): ValidInterval {
    validateQualityForNumber(number, quality);
    const isPerfect = PERFECT_NUMBERS.has(number);
    const semitones = BASE_SEMITONES[number] + qualityOffset(quality, isPerfect);
    const isCompound = number > 8;
    return { number, quality, semitones, isCompound } as ValidInterval;
  },

  fromSemitones(semitones: number, preferFlat?: boolean): Interval {
    let entry = SEMITONES_TO_INTERVAL[semitones];
    if (entry !== undefined) {
      if (semitones === 6 && preferFlat === true) {
        entry = [5, "diminished"];
      }
      const [number, quality] = entry;
      return { number, quality, semitones, isCompound: number > 8 };
    }
    const clamped = Math.max(0, Math.min(21, semitones));
    const [number, quality] = SEMITONES_TO_INTERVAL[clamped]!;
    return { number, quality, semitones, isCompound: number > 8 };
  },
};

export const intervalArithmetic: IntervalArithmetic = {
  add(a: Interval, b: Interval): Interval {
    const number = (a.number + b.number - 1) as IntervalNumber;
    const semitones = a.semitones + b.semitones;
    const isPerfect = PERFECT_NUMBERS.has(number);
    const base = BASE_SEMITONES[number] ?? semitones;
    const quality = qualityFromOffset(semitones - base, isPerfect);
    return { number, quality, semitones, isCompound: number > 8 };
  },

  invert(interval: Interval): Interval {
    const number = (9 - interval.number) as IntervalNumber;
    const quality = QUALITY_INVERSION[interval.quality];
    const semitones = 12 - interval.semitones;
    return { number, quality, semitones, isCompound: number > 8 };
  },

  complement(interval: Interval): Interval {
    return intervalArithmetic.invert(interval);
  },

  simplify(interval: Interval): Interval {
    if (interval.number <= 8) return { ...interval, isCompound: false };
    let { number, semitones } = interval;
    while (number > 8) {
      number = (number - 7) as IntervalNumber;
      semitones -= 12;
    }
    return { number, quality: interval.quality, semitones, isCompound: false };
  },

  compound(interval: Interval, octaves = 1): Interval {
    const number = (interval.number + 7 * octaves) as IntervalNumber;
    const semitones = interval.semitones + 12 * octaves;
    return { number, quality: interval.quality, semitones, isCompound: number > 8 };
  },

  compare(a: Interval, b: Interval): number {
    return a.semitones - b.semitones;
  },
};
