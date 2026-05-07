import type { Interval } from "../primitives/interval.js";
import type { Pitch } from "../primitives/pitch.js";

// ---------------------------------------------------------------------------
// Scale pattern types (the "recipe" — key-agnostic)
// ---------------------------------------------------------------------------

/**
 * Ordered array of semitone offsets from the root that defines a scale pattern.
 * Always begins with 0 (the root itself). Length = number of distinct pitches.
 *
 * @example [0, 2, 4, 5, 7, 9, 11]  — major scale
 * @example [0, 2, 3, 5, 7, 8, 10]  — natural minor scale
 * @example [0, 2, 4, 6, 8, 10]     — whole-tone scale
 */
export type SemitonePattern = ReadonlyArray<number>;

/**
 * Broad category tag for filtering and organizing scale patterns in the registry.
 * Used as a discriminant for exhaustive switch statements over scale families.
 */
export type ScaleCategory =
  | "diatonic"    // major, natural/harmonic/melodic minor
  | "mode"        // church modes: Dorian, Phrygian, Lydian, Mixolydian, Aeolian, Locrian
  | "symmetric"   // whole-tone, diminished (octatonic), augmented
  | "harmonic"    // harmonic major/minor variants
  | "melodic"     // melodic minor and its modes
  | "pentatonic"  // major/minor pentatonic
  | "blues"       // blues scales
  | "synthetic";  // user-defined or non-standard

/**
 * Metadata describing a scale pattern, independent of any root pitch.
 * Serves as the "recipe" that ScaleFactory materializes into a concrete Scale.
 */
export interface ScalePattern {
  readonly name:      string;
  readonly category:  ScaleCategory;
  /** Semitone offsets from root, starting at 0. Never modified after creation. */
  readonly intervals: SemitonePattern;
  /** Names of each mode, if this pattern defines a modal family. */
  readonly modes?:    ReadonlyArray<string>;
}

// ---------------------------------------------------------------------------
// Scale abstract base class
// ---------------------------------------------------------------------------

/**
 * A materialized scale: a root Pitch + a ScalePattern → ordered pitch set.
 *
 * All operations return new Scale instances. Input is never mutated.
 * Concrete subclasses (DiatonicScale, ModeScale, etc.) provide implementations.
 */
export abstract class Scale {
  /** The root pitch from which all degrees are derived. */
  abstract readonly root: Pitch;

  /** The pattern (interval recipe) this scale was built from. */
  abstract readonly pattern: ScalePattern;

  /**
   * All pitches in ascending order from the root.
   * Length equals `pattern.intervals.length`.
   */
  abstract readonly pitches: ReadonlyArray<Pitch>;

  /**
   * Return the pitch at scale degree `n` (1-based).
   * Degree 1 = root. Supports n > pattern length by wrapping with octave adjustment.
   *
   * @throws RangeError if n < 1
   */
  abstract degree(n: number): Pitch;

  /**
   * Return the interval from the root to scale degree `n`.
   * Degree 1 → Unison, Degree 5 in major → Perfect Fifth.
   *
   * @throws RangeError if n < 1
   */
  abstract intervalToDegree(n: number): Interval;

  /**
   * Return a new Scale with the same pattern but transposed to a new root.
   * @param semitones positive = up, negative = down
   */
  abstract transpose(semitones: number): Scale;

  /**
   * Return the mode of this scale starting on degree `modeRoot`.
   * e.g. C major.mode(2) → D Dorian (same pitches, new root and pattern).
   *
   * @throws RangeError if modeRoot < 1 or > pattern length
   */
  abstract mode(degree: number): Scale;

  /**
   * True if `pitch` is contained in this scale (pitch-class comparison only;
   * enharmonic equivalence applied).
   */
  abstract contains(pitch: Pitch): boolean;
}

// ---------------------------------------------------------------------------
// Factory interface
// ---------------------------------------------------------------------------

/**
 * Builds concrete Scale instances from a pattern + root.
 * Separated from Scale itself to keep the abstract class free of dependencies
 * on PitchFactory or other lower-layer factories.
 */
export interface ScaleFactory {
  build(pattern: ScalePattern, root: Pitch): Scale;
}
