import type { ScalePattern } from "./scale.js";

/**
 * Symmetric scales — defined by repeating interval cells.
 * The symmetry property means transposing by the cell interval returns the same pitch-class set.
 */

/**
 * Whole-tone scale — 6 pitches, all whole-steps.
 * Symmetric: transposing by M2 returns the same pitch-class set.
 * Only two distinct whole-tone scales exist (C and C#/Db).
 */
export const WHOLE_TONE_PATTERN: ScalePattern = Object.freeze({
  name:      "whole-tone",
  category:  "symmetric",
  intervals: Object.freeze([0, 2, 4, 6, 8, 10]),
});

/**
 * Diminished scale (half-whole) — 8 pitches, alternating H-W.
 * Used over diminished 7th chords and dominant 7b9 chords.
 * Symmetric: transposing by m3 returns the same pitch-class set.
 * Only three distinct diminished scales exist.
 */
export const DIMINISHED_HW_PATTERN: ScalePattern = Object.freeze({
  name:      "diminished-half-whole",
  category:  "symmetric",
  intervals: Object.freeze([0, 1, 3, 4, 6, 7, 9, 10]),
});

/**
 * Diminished scale (whole-half) — 8 pitches, alternating W-H.
 * Used over diminished 7th chords.
 */
export const DIMINISHED_WH_PATTERN: ScalePattern = Object.freeze({
  name:      "diminished-whole-half",
  category:  "symmetric",
  intervals: Object.freeze([0, 2, 3, 5, 6, 8, 9, 11]),
});

/**
 * Augmented scale — 6 pitches, alternating m3-H.
 * Symmetric: transposing by M3 returns the same pitch-class set.
 * Only four distinct augmented scales exist.
 */
export const AUGMENTED_PATTERN: ScalePattern = Object.freeze({
  name:      "augmented",
  category:  "symmetric",
  intervals: Object.freeze([0, 3, 4, 7, 8, 11]),
});
