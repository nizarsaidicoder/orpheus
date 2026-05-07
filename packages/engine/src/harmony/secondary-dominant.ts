import type { Chord } from "../chords/chord.ts";
import type { Key } from "./key.ts";
import type { RomanDegree } from "./roman-numeral.ts";
import { chordFactory } from "../chords/chord-factory.ts";
import { pitchFactory } from "../primitives/pitch.ts";
import { harmonizer } from "../chords/harmonizer.ts";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

// Valid tonicization targets (not I = tonic, not VII° = non-tonal)
const VALID_TARGETS: ReadonlyArray<RomanDegree> = ["II", "III", "IV", "V", "VI"];

const DEGREE_INDEX: Readonly<Record<RomanDegree, number>> = {
  I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7,
};

// Display labels: IV and V uppercase, ii iii vi lowercase
const DEGREE_LABEL: Readonly<Record<RomanDegree, string>> = {
  I: "I", II: "ii", III: "iii", IV: "IV", V: "V", VI: "vi", VII: "vii",
};

function buildForDegree(target: RomanDegree, key: Key): SecondaryDominant {
  const degNum = DEGREE_INDEX[target];
  const tonicizationRoot = key.naturalScale.degree(degNum);
  // V7 root is a perfect fifth (7 semitones) above the tonicized degree
  const v7Root = pitchFactory.fromMidi(tonicizationRoot.midi + 7);
  const chord = chordFactory.seventh(v7Root, "dominant7");
  const resolvesTo = harmonizer.degreeChord(key.naturalScale, degNum, "triad");
  const label = `V7/${DEGREE_LABEL[target]}`;
  return { chord, tonicizes: target, resolvesTo, label };
}

// ---------------------------------------------------------------------------
// Concrete implementation
// ---------------------------------------------------------------------------

export const secondaryDominantAnalyzer: SecondaryDominantAnalyzer = {
  allIn(key: Key): ReadonlyArray<SecondaryDominant> {
    return VALID_TARGETS.map(t => buildForDegree(t, key));
  },

  of(degree: RomanDegree, key: Key): SecondaryDominant | undefined {
    if (!(VALID_TARGETS as ReadonlyArray<string>).includes(degree)) return undefined;
    return buildForDegree(degree, key);
  },

  identify(chord: Chord, key: Key): SecondaryDominant | undefined {
    if (chord.quality.kind !== "dominant7") return undefined;
    const rootPC = chord.root.pitchClass;
    // Secondary V7 resolves to the degree whose root is a perfect fifth below (7 semitones down)
    const resolutionPC = ((rootPC - 7) % 12 + 12) % 12;
    for (const target of VALID_TARGETS) {
      const degNum = DEGREE_INDEX[target];
      const targetPitch = key.naturalScale.degree(degNum);
      if (targetPitch.pitchClass === resolutionPC) {
        return buildForDegree(target, key);
      }
    }
    return undefined;
  },
};

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
