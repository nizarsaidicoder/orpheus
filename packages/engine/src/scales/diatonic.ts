import type { ScalePattern } from "./scale.ts";

/** Major scale — Ionian mode. W W H W W W H (semitones: 0 2 4 5 7 9 11). */
export const MAJOR_PATTERN: ScalePattern = Object.freeze({
  name:      "major",
  category:  "diatonic",
  intervals: Object.freeze([0, 2, 4, 5, 7, 9, 11]),
  modes:     Object.freeze(["Ionian", "Dorian", "Phrygian", "Lydian", "Mixolydian", "Aeolian", "Locrian"]),
});

/** Natural minor scale — Aeolian mode. W H W W H W W (semitones: 0 2 3 5 7 8 10). */
export const NATURAL_MINOR_PATTERN: ScalePattern = Object.freeze({
  name:      "natural-minor",
  category:  "diatonic",
  intervals: Object.freeze([0, 2, 3, 5, 7, 8, 10]),
});

/**
 * Harmonic minor — raised 7th creates a leading tone and an augmented 2nd (A2) between b6 and 7.
 * Intervals: 0 2 3 5 7 8 11
 */
export const HARMONIC_MINOR_PATTERN: ScalePattern = Object.freeze({
  name:      "harmonic-minor",
  category:  "harmonic",
  intervals: Object.freeze([0, 2, 3, 5, 7, 8, 11]),
});

/**
 * Melodic minor (ascending) — raised 6th and 7th.
 * In classical practice the descending form reverts to natural minor;
 * in jazz (and this engine) the ascending form is used bidirectionally.
 * Intervals: 0 2 3 5 7 9 11
 */
export const MELODIC_MINOR_PATTERN: ScalePattern = Object.freeze({
  name:      "melodic-minor",
  category:  "melodic",
  intervals: Object.freeze([0, 2, 3, 5, 7, 9, 11]),
  modes:     Object.freeze([
    "Melodic Minor",
    "Dorian b2",
    "Lydian Augmented",
    "Lydian Dominant",
    "Mixolydian b6",
    "Locrian #2",
    "Altered",
  ]),
});

/**
 * Harmonic major — major scale with lowered 6th. Creates an augmented 2nd between b6 and 7.
 * Intervals: 0 2 4 5 7 8 11
 */
export const HARMONIC_MAJOR_PATTERN: ScalePattern = Object.freeze({
  name:      "harmonic-major",
  category:  "harmonic",
  intervals: Object.freeze([0, 2, 4, 5, 7, 8, 11]),
});
