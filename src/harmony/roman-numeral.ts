import type { Chord } from "../chords/chord.js";
import type { Key } from "./key.js";

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
