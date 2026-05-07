import type { Scale } from "../scales/scale.js";
import type { Chord } from "./chord.js";

/**
 * Extension level for harmonization.
 * Controls how many chord tones are stacked on each scale degree.
 */
export type HarmonizationExtension =
  | "triad"       // 3 voices: 1-3-5
  | "seventh"     // 4 voices: 1-3-5-7
  | "ninth"       // 5 voices: 1-3-5-7-9
  | "eleventh"    // 6 voices: 1-3-5-7-9-11
  | "thirteenth"; // 7 voices: 1-3-5-7-9-11-13

/**
 * One entry in a harmonized scale: the diatonic chord built on a scale degree.
 */
export interface HarmonizedDegree {
  /** Scale degree, 1-based. */
  readonly scaleDegree:  number;
  /** Standard roman numeral notation, e.g. "I", "ii", "V7", "viidim". */
  readonly romanNumeral: string;
  /** The chord built on this degree. */
  readonly chord:        Chord;
}

/**
 * Harmonizes a Scale by stacking thirds on each degree.
 * All methods are pure functions.
 */
export interface Harmonizer {
  /**
   * Return all diatonic chords in the scale at the given extension level.
   * Array length equals `scale.pattern.intervals.length`.
   *
   * @example harmonize(CMajor, "seventh")
   *   → [Imaj7, iim7, iiim7, IVmaj7, V7, vim7, viiø7]
   */
  harmonize(
    scale: Scale,
    extension?: HarmonizationExtension
  ): ReadonlyArray<HarmonizedDegree>;

  /**
   * Return the chord built on a single scale degree.
   *
   * @param degree 1-based scale degree
   * @throws RangeError if degree is out of range
   */
  degreeChord(
    scale: Scale,
    degree: number,
    extension?: HarmonizationExtension
  ): Chord;
}
