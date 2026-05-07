import type { Scale } from "../scales/scale.js";
import type { Chord, ChordQuality } from "./chord.js";
import type { Interval } from "../primitives/interval.js";
import { intervalFactory } from "../primitives/interval.js";

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

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const STACK_COUNT: Record<HarmonizationExtension, number> = {
  triad: 3, seventh: 4, ninth: 5, eleventh: 6, thirteenth: 7,
};

const ROMAN_NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII"] as const;

// Maps semitone signature (intervals from root as comma-joined string) → ChordQuality
const SIGNATURE_QUALITY: Readonly<Record<string, ChordQuality>> = {
  "4,7":            { kind: "major" },
  "3,7":            { kind: "minor" },
  "3,6":            { kind: "diminished" },
  "4,8":            { kind: "augmented" },
  "4,7,11":         { kind: "major7" },
  "4,7,10":         { kind: "dominant7" },
  "3,7,10":         { kind: "minor7" },
  "3,6,10":         { kind: "half-diminished7" },
  "3,6,9":          { kind: "diminished7" },
  "3,7,11":         { kind: "minor-major7" },
  "4,8,11":         { kind: "augmented-major7" },
  "4,7,11,14":      { kind: "major9" },
  "4,7,10,14":      { kind: "dominant9" },
  "3,7,10,14":      { kind: "minor9" },
  "3,6,10,14":      { kind: "half-diminished9" },
  "4,7,11,14,17":   { kind: "major11" },
  "4,7,10,14,17":   { kind: "dominant11" },
  "3,7,10,14,17":   { kind: "minor11" },
  "3,6,10,14,17":   { kind: "half-diminished11" },
  "4,7,11,14,17,21":   { kind: "major13" },
  "4,7,10,14,17,21":   { kind: "dominant13" },
  "3,7,10,14,17,21":   { kind: "minor13" },
};

function inferQuality(intervalStructure: ReadonlyArray<Interval>): ChordQuality {
  const sig = intervalStructure.map(i => i.semitones).join(",");
  return SIGNATURE_QUALITY[sig] ?? { kind: "major" };
}

function buildRomanNumeral(degree: number, quality: ChordQuality): string {
  const roman = ROMAN_NUMERALS[(degree - 1) % 7] ?? "I";
  switch (quality.kind) {
    case "major":             return roman;
    case "minor":             return roman.toLowerCase();
    case "diminished":        return roman.toLowerCase() + "dim";
    case "augmented":         return roman + "aug";
    case "major7":            return roman + "maj7";
    case "dominant7":         return roman + "7";
    case "minor7":            return roman.toLowerCase() + "m7";
    case "half-diminished7":  return roman.toLowerCase() + "ø7";
    case "diminished7":       return roman.toLowerCase() + "°7";
    case "minor-major7":      return roman.toLowerCase() + "M7";
    case "augmented-major7":  return roman + "+M7";
    case "major9":            return roman + "maj9";
    case "dominant9":         return roman + "9";
    case "minor9":            return roman.toLowerCase() + "m9";
    case "half-diminished9":  return roman.toLowerCase() + "ø9";
    case "major11":           return roman + "maj11";
    case "dominant11":        return roman + "11";
    case "minor11":           return roman.toLowerCase() + "m11";
    case "half-diminished11": return roman.toLowerCase() + "ø11";
    case "major13":           return roman + "maj13";
    case "dominant13":        return roman + "13";
    case "minor13":           return roman.toLowerCase() + "m13";
    default:                  return roman;
  }
}

function buildDegreeChord(scale: Scale, degree: number, stackCount: number): Chord {
  const root = scale.degree(degree);
  const chordTones = Array.from({ length: stackCount }, (_, k) => scale.degree(degree + 2 * k));
  const intervalStructure = chordTones.slice(1).map(p =>
    intervalFactory.fromSemitones(p.midi - root.midi)
  );
  const quality = inferQuality(intervalStructure);
  return {
    root,
    quality,
    pitches: chordTones,
    inversion: "root",
    intervalStructure,
  };
}

// ---------------------------------------------------------------------------
// Concrete implementation
// ---------------------------------------------------------------------------

export const harmonizer: Harmonizer = {
  harmonize(scale: Scale, extension: HarmonizationExtension = "triad"): ReadonlyArray<HarmonizedDegree> {
    const len = scale.pattern.intervals.length;
    const stackCount = STACK_COUNT[extension];
    return Array.from({ length: len }, (_, i) => {
      const degree = i + 1;
      const chord = buildDegreeChord(scale, degree, stackCount);
      return {
        scaleDegree: degree,
        romanNumeral: buildRomanNumeral(degree, chord.quality),
        chord,
      };
    });
  },

  degreeChord(scale: Scale, degree: number, extension: HarmonizationExtension = "triad"): Chord {
    const len = scale.pattern.intervals.length;
    if (degree < 1 || degree > len) {
      throw new RangeError(`Degree must be between 1 and ${len}, got ${degree}`);
    }
    return buildDegreeChord(scale, degree, STACK_COUNT[extension]);
  },
};

// ---------------------------------------------------------------------------

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
