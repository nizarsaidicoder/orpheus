import type { ScalePattern } from "./scale.ts";

/** Major pentatonic — 5 pitches, no semitones. */
export const MAJOR_PENTATONIC_PATTERN: ScalePattern = Object.freeze({
  name:      "major-pentatonic",
  category:  "pentatonic",
  intervals: Object.freeze([0, 2, 4, 7, 9]),
});

/** Minor pentatonic — 5 pitches; relative minor of major pentatonic. */
export const MINOR_PENTATONIC_PATTERN: ScalePattern = Object.freeze({
  name:      "minor-pentatonic",
  category:  "pentatonic",
  intervals: Object.freeze([0, 3, 5, 7, 10]),
});

/**
 * Blues scale — minor pentatonic + b5 (the "blue note").
 * 6 pitches total.
 */
export const BLUES_PATTERN: ScalePattern = Object.freeze({
  name:      "blues",
  category:  "blues",
  intervals: Object.freeze([0, 3, 5, 6, 7, 10]),
});

/**
 * Phrygian dominant — mode 5 of harmonic minor.
 * Used extensively in flamenco and Middle Eastern music.
 * Intervals: 0 1 4 5 7 8 10
 */
export const PHRYGIAN_DOMINANT_PATTERN: ScalePattern = Object.freeze({
  name:      "phrygian-dominant",
  category:  "synthetic",
  intervals: Object.freeze([0, 1, 4, 5, 7, 8, 10]),
});

/**
 * Double harmonic (Byzantine) scale — two augmented 2nds.
 * Intervals: 0 1 4 5 7 8 11
 */
export const DOUBLE_HARMONIC_PATTERN: ScalePattern = Object.freeze({
  name:      "double-harmonic",
  category:  "synthetic",
  intervals: Object.freeze([0, 1, 4, 5, 7, 8, 11]),
});

/**
 * Hungarian minor (double harmonic minor) — harmonic minor with raised 4th.
 * Intervals: 0 2 3 6 7 8 11
 */
export const HUNGARIAN_MINOR_PATTERN: ScalePattern = Object.freeze({
  name:      "hungarian-minor",
  category:  "synthetic",
  intervals: Object.freeze([0, 2, 3, 6, 7, 8, 11]),
});

/**
 * Lydian dominant (Overtone scale) — mode 4 of melodic minor.
 * Major scale with raised 4th and lowered 7th. Used over dominant 7th chords.
 * Intervals: 0 2 4 6 7 9 10
 */
export const LYDIAN_DOMINANT_PATTERN: ScalePattern = Object.freeze({
  name:      "lydian-dominant",
  category:  "melodic",
  intervals: Object.freeze([0, 2, 4, 6, 7, 9, 10]),
});

/**
 * Altered scale (Super Locrian) — mode 7 of melodic minor.
 * All non-root, non-octave pitches are altered. Used over altered dominant chords.
 * Intervals: 0 1 3 4 6 8 10
 */
export const ALTERED_PATTERN: ScalePattern = Object.freeze({
  name:      "altered",
  category:  "melodic",
  intervals: Object.freeze([0, 1, 3, 4, 6, 8, 10]),
});
