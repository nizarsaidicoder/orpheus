import type { ScalePattern } from "./scale.js";

/**
 * The seven church modes as standalone ScalePatterns.
 * Each is a rotation of the major scale starting on a different degree.
 * Intervals are listed relative to the mode's own root (not C major).
 */

/** Mode 1 — same as major scale. */
export const IONIAN_PATTERN: ScalePattern = Object.freeze({
  name:      "ionian",
  category:  "mode",
  intervals: Object.freeze([0, 2, 4, 5, 7, 9, 11]),
});

/** Mode 2 — Dorian: minor scale with raised 6th. */
export const DORIAN_PATTERN: ScalePattern = Object.freeze({
  name:      "dorian",
  category:  "mode",
  intervals: Object.freeze([0, 2, 3, 5, 7, 9, 10]),
});

/** Mode 3 — Phrygian: minor scale with lowered 2nd. */
export const PHRYGIAN_PATTERN: ScalePattern = Object.freeze({
  name:      "phrygian",
  category:  "mode",
  intervals: Object.freeze([0, 1, 3, 5, 7, 8, 10]),
});

/** Mode 4 — Lydian: major scale with raised 4th (tritone above root). */
export const LYDIAN_PATTERN: ScalePattern = Object.freeze({
  name:      "lydian",
  category:  "mode",
  intervals: Object.freeze([0, 2, 4, 6, 7, 9, 11]),
});

/** Mode 5 — Mixolydian: major scale with lowered 7th. The dominant scale. */
export const MIXOLYDIAN_PATTERN: ScalePattern = Object.freeze({
  name:      "mixolydian",
  category:  "mode",
  intervals: Object.freeze([0, 2, 4, 5, 7, 9, 10]),
});

/** Mode 6 — Aeolian: same as natural minor scale. */
export const AEOLIAN_PATTERN: ScalePattern = Object.freeze({
  name:      "aeolian",
  category:  "mode",
  intervals: Object.freeze([0, 2, 3, 5, 7, 8, 10]),
});

/** Mode 7 — Locrian: diminished scale; b2, b5. Unstable, rarely tonic. */
export const LOCRIAN_PATTERN: ScalePattern = Object.freeze({
  name:      "locrian",
  category:  "mode",
  intervals: Object.freeze([0, 1, 3, 5, 6, 8, 10]),
});

export const ALL_CHURCH_MODES: ReadonlyArray<ScalePattern> = Object.freeze([
  IONIAN_PATTERN,
  DORIAN_PATTERN,
  PHRYGIAN_PATTERN,
  LYDIAN_PATTERN,
  MIXOLYDIAN_PATTERN,
  AEOLIAN_PATTERN,
  LOCRIAN_PATTERN,
]);
