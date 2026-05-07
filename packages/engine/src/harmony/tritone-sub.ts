import type { Pitch } from "../primitives/pitch.ts";
import type { Chord } from "../chords/chord.ts";
import type { Key } from "./key.ts";
import { chordFactory } from "../chords/chord-factory.ts";
import { pitchFactory } from "../primitives/pitch.ts";

// ---------------------------------------------------------------------------
// Concrete implementation
// ---------------------------------------------------------------------------

export const tritoneSubstitution: TritoneSubstitution = {
  substitute(chord: Chord): Chord {
    if (chord.quality.kind !== "dominant7") {
      throw new TypeError(`tritone substitute requires dominant7, got "${chord.quality.kind}"`);
    }
    const subRoot = pitchFactory.fromMidi(chord.root.midi + 6);
    return chordFactory.seventh(subRoot, "dominant7");
  },

  forKey(key: Key): TritoneSubPair {
    // V7: degree 5 of the natural scale
    const v7Root = key.naturalScale.degree(5);
    const original = chordFactory.seventh(v7Root, "dominant7");
    const substitute = tritoneSubstitution.substitute(original);
    // Guide tones: 3rd and 7th of original
    // 3rd = 4 semitones above root; 7th = 10 semitones above root
    const guideTone1 = pitchFactory.fromMidi(v7Root.midi + 4) as Pitch;
    const guideTone2 = pitchFactory.fromMidi(v7Root.midi + 10) as Pitch;
    return { original, substitute, sharedGuideTones: [guideTone1, guideTone2] };
  },

  isTritoneSub(chord: Chord, key: Key): boolean {
    if (chord.quality.kind !== "dominant7") return false;
    const pair = tritoneSubstitution.forKey(key);
    return chord.root.pitchClass === pair.substitute.root.pitchClass;
  },
};

/**
 * A tritone substitution pair.
 *
 * The tritone substitute of a dominant 7th chord has its root a tritone (augmented 4th / 6 semitones) away.
 * The two chords share the same guide tones (3rd and 7th), which swap roles:
 *   - Original 3rd (leading tone)   = Substitute 7th
 *   - Original 7th (tendency tone)  = Substitute 3rd
 *
 * @example G7 (V7 in C) → Db7 (tritone sub); shared guide tones: B (=Cb) and F (=E#)
 */
export interface TritoneSubPair {
  /** The original dominant seventh chord. */
  readonly original: Chord;

  /** The tritone substitute (root is a tritone above/below the original root). */
  readonly substitute: Chord;

  /**
   * The two shared guide tones between original and substitute.
   * First element = 3rd of original = 7th of substitute.
   * Second element = 7th of original = 3rd of substitute.
   */
  readonly sharedGuideTones: readonly [Pitch, Pitch];
}

/**
 * Logic for computing and identifying tritone substitutions.
 * All methods are pure functions.
 */
export interface TritoneSubstitution {
  /**
   * Compute the tritone substitute of a dominant seventh chord.
   * The substitute root is exactly 6 semitones (augmented 4th) above the original root.
   *
   * @throws TypeError if `chord.quality.kind` is not "dominant7"
   */
  substitute(chord: Chord): Chord;

  /**
   * Return the TritoneSubPair for the primary dominant (V7) in a given key.
   * @example forKey(CMajor) → { original: G7, substitute: Db7, guideTones: [B, F] }
   */
  forKey(key: Key): TritoneSubPair;

  /**
   * Identify whether a chord is the tritone substitute of the dominant seventh in a key.
   * @example isTritoneSub(Db7, CMajor) → true (Db7 substitutes G7)
   * @example isTritoneSub(F7, CMajor)  → false
   */
  isTritoneSub(chord: Chord, key: Key): boolean;
}
