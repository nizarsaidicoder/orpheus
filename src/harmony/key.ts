import type { Pitch } from "../primitives/pitch.js";
import type { SpelledNoteName } from "../primitives/note-name.js";
import type { Scale } from "../scales/scale.js";

/**
 * Modality of a key.
 * Kept separate from ScaleCategory so "key of A minor" is independent
 * of whether harmonic, melodic, or natural minor is used.
 */
export type Modality = "major" | "minor";

/**
 * A musical key: a tonic pitch + modality.
 *
 * The key signature (sharps/flats) is derived from tonic + modality via
 * the circle of fifths. Key values are immutable; navigation properties
 * (relative, parallel, enharmonicEquivalent) return pre-computed Key instances.
 */
export interface Key {
  readonly tonic:    Pitch;
  readonly modality: Modality;

  /**
   * Number of sharps (+) or flats (−) in the key signature.
   * C major = 0, G major = +1, F major = −1, F# major = +6, Gb major = −6.
   */
  readonly signature: number;

  /**
   * The scale most naturally associated with this key.
   * Major → Ionian (major scale). Minor → Aeolian (natural minor).
   */
  readonly naturalScale: Scale;

  /**
   * The relative key: same key signature, different tonic and modality.
   * C major ↔ A minor. G major ↔ E minor.
   */
  readonly relative: Key;

  /**
   * The parallel key: same tonic, opposite modality.
   * C major ↔ C minor. A major ↔ A minor.
   */
  readonly parallel: Key;

  /**
   * The enharmonic respelling of this key (only differs for keys with 5+ accidentals).
   * F# major ↔ Gb major. B major ↔ Cb major. C# major ↔ Db major.
   * Keys with no enharmonic equivalent return themselves.
   */
  readonly enharmonicEquivalent: Key;

  /**
   * Return the correct diatonic spelling for any MIDI pitch class in this key's context.
   * This is the critical method for enharmonic disambiguation:
   *   - In D major, pitch class 6 (F#/Gb) → F#
   *   - In Gb major, pitch class 6 → Gb
   *
   * @param pitchClass integer in [0, 11]
   */
  spellPitchClass(pitchClass: number): SpelledNoteName;
}

/**
 * Factory for constructing Key instances.
 * Pre-computes and caches all 30 standard keys (15 major + 15 minor)
 * including enharmonic equivalents.
 */
export interface KeyFactory {
  /** Build a key from a tonic pitch and modality. */
  build(tonic: Pitch, modality: Modality): Key;

  /** Retrieve one of the 15 major keys by signature (−7 to +7). */
  major(signature: number): Key;

  /** Retrieve one of the 15 minor keys by signature (−7 to +7). */
  minor(signature: number): Key;

  /** All major keys in circle-of-fifths order (C, G, D, …, F). */
  readonly allMajor: ReadonlyArray<Key>;

  /** All minor keys in circle-of-fifths order (A, E, B, …, D). */
  readonly allMinor: ReadonlyArray<Key>;
}
