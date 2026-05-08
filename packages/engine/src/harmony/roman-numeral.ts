import type { Chord } from "../chords/chord.ts";
import type { Key } from "./key.ts";
import { chordFactory } from "../chords/chord-factory.ts";
import { pitchFactory } from "../primitives/pitch.ts";

/**
 * Scale degree as a Roman numeral literal type.
 * Uppercase denotes major quality in the root triad; lowercase denotes minor/diminished.
 * The type system uses uppercase strings — case rendering is handled by `isUpperCase`.
 */
export type RomanDegree = "I" | "II" | "III" | "IV" | "V" | "VI" | "VII";

/**
 * Modifiers that alter the function or origin of a Roman numeral.
 */
export type RomanNumeralModifier =
  | "secondary"    // V/X applied-chord tonicization
  | "applied"      // Augmented sixth chords (Italian, German, French)
  | "borrowed"     // Modal mixture from parallel key
  | "neapolitan";  // bII (Neapolitan sixth)

/**
 * A parsed Roman numeral analysis token.
 * Represents a single harmonic function within a key.
 *
 * @example  V7    → { degree: "V", isUpperCase: true, quality: "dominant7", modifiers: [] }
 * @example  viø7  → { degree: "VII", isUpperCase: false, quality: "half-diminished7", modifiers: [] }
 * @example  V7/ii → { degree: "V", quality: "dominant7", modifiers: ["secondary"], secondaryOf: "II" }
 */
export interface RomanNumeralToken {
  readonly degree:       RomanDegree;
  /** True if the root triad is major quality (uppercase in notation). */
  readonly isUpperCase:  boolean;
  /** Chord quality kind — corresponds to ChordQuality.kind. */
  readonly quality:      string;
  readonly modifiers:    ReadonlyArray<RomanNumeralModifier>;
  /** Present when this is a secondary-function chord (V/x, VII/x). */
  readonly secondaryOf?: RomanDegree;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const ROMAN_TO_DEGREE: Readonly<Record<string, RomanDegree>> = {
  I: "I", II: "II", III: "III", IV: "IV", V: "V", VI: "VI", VII: "VII",
};
const DEGREE_INDEX: Readonly<Record<RomanDegree, number>> = {
  I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7,
};

// quality-suffix → ChordQuality.kind  (for parse)
const SUFFIX_TO_QUALITY: Readonly<Record<string, string>> = {
  "":      "major",
  "7":     "dominant7",
  "maj7":  "major7",
  "M7":    "major7",
  "ø7":    "half-diminished7",
  "°7":    "diminished7",
  "dim7":  "diminished7",
  "m7":    "minor7",
  "9":     "dominant9",
  "11":    "dominant11",
  "13":    "dominant13",
  "m9":    "minor9",
  "maj9":  "major9",
};

// ChordQuality.kind → display suffix  (for render)
const QUALITY_TO_SUFFIX: Readonly<Record<string, string>> = {
  major:             "",
  minor:             "",
  diminished:        "dim",
  augmented:         "aug",
  major7:            "maj7",
  dominant7:         "7",
  minor7:            "m7",
  "half-diminished7":"ø7",
  diminished7:       "°7",
  "minor-major7":    "mM7",
  dominant9:         "9",
  major9:            "maj9",
  minor9:            "m9",
  dominant11:        "11",
  major11:           "maj11",
  minor11:           "m11",
  dominant13:        "13",
  major13:           "maj13",
  minor13:           "m13",
};

// ---------------------------------------------------------------------------
// Concrete implementation
// ---------------------------------------------------------------------------

export const romanNumeralAnalyzer: RomanNumeralAnalyzer = {
  parse(notation: string): RomanNumeralToken {
    // Handle secondary function: "V7/ii"
    const slashIdx = notation.indexOf("/");
    let secondaryOf: RomanDegree | undefined;
    let base = notation;
    if (slashIdx > 0) {
      const targetStr = notation.slice(slashIdx + 1).toUpperCase();
      secondaryOf = ROMAN_TO_DEGREE[targetStr];
      base = notation.slice(0, slashIdx);
    }

    // Strip leading "b" (Neapolitan bII)
    const modifiers: RomanNumeralModifier[] = [];
    let normalized = base;
    if (normalized.startsWith("b")) {
      modifiers.push("neapolitan");
      normalized = normalized.slice(1);
    }
    if (secondaryOf) modifiers.push("secondary");

    // Separate roman numeral from quality suffix
    const romanPattern = /^(VII|VI|IV|V|III|II|I)/i;
    const romanMatch = normalized.match(romanPattern);
    if (!romanMatch) throw new SyntaxError(`Invalid Roman numeral notation: "${notation}"`);

    const romanRaw = romanMatch[1]!;
    const suffix   = normalized.slice(romanRaw.length);
    const isUpperCase = romanRaw[0] === romanRaw[0]!.toUpperCase();
    const degree   = ROMAN_TO_DEGREE[romanRaw.toUpperCase()];
    if (!degree) throw new SyntaxError(`Invalid degree: "${romanRaw}"`);

    const quality = suffix !== ""
      ? (SUFFIX_TO_QUALITY[suffix] ?? (isUpperCase ? "major" : "minor"))
      : (isUpperCase ? "major" : "minor");

    return {
      degree,
      isUpperCase,
      quality,
      modifiers,
      ...(secondaryOf ? { secondaryOf } : {}),
    };
  },

  render(token: RomanNumeralToken): string {
    const roman = token.isUpperCase ? token.degree : token.degree.toLowerCase();
    const suffix = QUALITY_TO_SUFFIX[token.quality] ?? "";
    let result = roman + suffix;
    if (token.secondaryOf) result += "/" + token.secondaryOf.toLowerCase();
    if (token.modifiers.includes("neapolitan")) result = "b" + result;
    return result;
  },

  analyze(chord: Chord, key: Key): RomanNumeralToken {
    const rootPC = chord.root.pitchClass;
    const scale  = key.naturalScale;
    // Find which scale degree has this root PC
    let degreeNum = 0;
    for (let d = 1; d <= scale.pattern.intervals.length; d++) {
      if (scale.degree(d).pitchClass === rootPC) { degreeNum = d; break; }
    }
    if (degreeNum === 0) throw new Error(`Root not diatonic in this key`);

    const degrees: RomanDegree[] = ["I", "II", "III", "IV", "V", "VI", "VII"];
    const degree   = degrees[degreeNum - 1]!;
    const quality  = chord.quality.kind;
    const isUpperCase = quality === "major" || quality === "major7" ||
      quality === "dominant7" || quality === "augmented" || quality === "augmented-major7";

    return { degree, isUpperCase, quality, modifiers: [] };
  },

  realize(token: RomanNumeralToken, key: Key): Chord {
    const degreeNum = DEGREE_INDEX[token.degree];
    const root      = key.naturalScale.degree(degreeNum);
    const quality   = token.quality;

    // Map quality kind to triad/seventh builder
    const seventhQualities = new Set([
      "major7","dominant7","minor7","half-diminished7","diminished7",
      "minor-major7","augmented-major7",
    ]);
    const triadQualities = new Set([
      "major","minor","diminished","augmented","sus2","sus4",
    ]);

    if (triadQualities.has(quality)) {
      return chordFactory.triad(root, quality as Parameters<typeof chordFactory.triad>[1]);
    }
    if (seventhQualities.has(quality)) {
      return chordFactory.seventh(root, quality as Parameters<typeof chordFactory.seventh>[1]);
    }
    // Fallback: build as major triad
    /* c8 ignore next */
    return chordFactory.triad(root, "major");
  },
};

// ---------------------------------------------------------------------------

/**
 * Bidirectional Roman numeral analysis.
 *
 * - `analyze`: Chord + Key → RomanNumeralToken (analysis direction)
 * - `realize`: RomanNumeralToken + Key → Chord (realization direction)
 * - `parse`:   string notation → RomanNumeralToken
 * - `render`:  RomanNumeralToken → standard string notation
 */
export interface RomanNumeralAnalyzer {
  /**
   * Identify the Roman numeral function of a chord within a key.
   * Handles diatonic chords, secondary functions, and borrowed chords.
   *
   * @throws Error if the chord cannot be identified in the key
   */
  analyze(chord: Chord, key: Key): RomanNumeralToken;

  /**
   * Build the chord corresponding to a Roman numeral token in a given key.
   * @example realize(parse("V7"), CMajor) → G dominant seventh chord
   */
  realize(token: RomanNumeralToken, key: Key): Chord;

  /**
   * Parse a Roman numeral string into a structured token.
   * Supports: case (I/i), quality suffixes (7, maj7, ø7, °7), alterations (b9, #11),
   * secondary functions (V7/ii), and modifiers (bII for Neapolitan).
   *
   * @throws SyntaxError if the string is not valid Roman numeral notation
   */
  parse(notation: string): RomanNumeralToken;

  /**
   * Render a token to its canonical string notation.
   * @example render({ degree: "V", quality: "dominant7", … }) → "V7"
   */
  render(token: RomanNumeralToken): string;
}
