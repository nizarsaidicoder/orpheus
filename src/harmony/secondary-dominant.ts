import type { Chord } from "../chords/chord.js";
import type { Key } from "./key.js";
import type { RomanDegree } from "./roman-numeral.js";

/**
 * A secondary dominant relationship: a chord that temporarily tonicizes
 * a scale degree other than I by functioning as its V (or VII) chord.
 *
 * @example V/V in C major: the chord D7 → resolves to G major (the V of C)
 * @example V/ii in C major: the chord A7 → resolves to D minor (the ii of C)
 */
export interface SecondaryDominant {
  /** The secondary dominant chord itself (the applied V7). */
  readonly chord: Chord;

  /** The scale degree being tonicized. e.g. "V" for V/V. */
  readonly tonicizes: RomanDegree;

  /**
   * The chord of resolution (the "I" of the local tonicization).
   * Useful for voice-leading analysis and progression building.
   */
  readonly resolvesTo: Chord;

  /** Conventional label, e.g. "V7/ii", "V/IV". */
  readonly label: string;
}

/**
 * Derives and identifies secondary dominants within a key.
 * All methods are pure functions.
 */
export interface SecondaryDominantAnalyzer {
  /**
   * Return all valid secondary dominants available in the given key.
   * Conventional targets: ii, iii, IV, V, vi
   * (VII° is excluded as a tonicization target — non-tonal).
   *
   * @example allIn(CMajor) → [V7/ii=A7, V7/iii=B7, V7/IV=C7, V7/V=D7, V7/vi=E7]
   */
  allIn(key: Key): ReadonlyArray<SecondaryDominant>;

  /**
   * Return the secondary dominant that resolves to the given scale degree.
   * Returns undefined if no conventional secondary dominant exists for that degree.
   *
   * @example of("V", CMajor) → D7 (V7/V)
   * @example of("VII", CMajor) → undefined
   */
  of(degree: RomanDegree, key: Key): SecondaryDominant | undefined;

  /**
   * Identify whether a given chord functions as a secondary dominant in the key.
   * Returns the SecondaryDominant relationship if it matches; otherwise undefined.
   *
   * @example identify(A7, CMajor) → { tonicizes: "II", resolves to: Dm, label: "V7/ii" }
   */
  identify(chord: Chord, key: Key): SecondaryDominant | undefined;
}
