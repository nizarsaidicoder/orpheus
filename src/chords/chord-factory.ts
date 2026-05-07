import type { Pitch } from "../primitives/pitch.js";
import type { Chord, ChordAlteration, ChordQuality, InversionPosition } from "./chord.js";

/**
 * Configuration bag for building any chord type.
 * Used by `ChordFactory.build()` for full control.
 */
export interface ChordBuildOptions {
  readonly root:         Pitch;
  readonly quality:      ChordQuality;
  readonly alterations?: ReadonlyArray<ChordAlteration>;
  /** When true, omit the fifth from the voicing (common in jazz extended chords). */
  readonly omitFifth?:   boolean;
}

/**
 * Factory for constructing immutable Chord instances.
 * All methods return new objects; nothing is mutated.
 */
export interface ChordFactory {
  /**
   * Build a root-position triad.
   * @example triad(C4, "major") → C major triad {C, E, G}
   */
  triad(
    root: Pitch,
    quality: "major" | "minor" | "diminished" | "augmented" | "sus2" | "sus4"
  ): Chord;

  /**
   * Build a root-position seventh chord.
   * @example seventh(G4, "dominant7") → G7 {G, B, D, F}
   */
  seventh(
    root: Pitch,
    quality: "major7" | "dominant7" | "minor7" | "half-diminished7" | "diminished7" | "minor-major7" | "augmented-major7"
  ): Chord;

  /**
   * Build any chord from a full ChordBuildOptions descriptor.
   * Supports extensions (9th, 11th, 13th) and alterations (b9, #11, etc.).
   */
  build(options: ChordBuildOptions): Chord;

  /**
   * Return a new Chord in the specified inversion.
   * Rotates `pitches` so the target chord tone is in the bass.
   * Throws RangeError if `position` is "third" but the chord has fewer than 4 pitches.
   */
  invert(chord: Chord, position: "first" | "second" | "third"): Chord;

  /**
   * Return a slash chord: a Chord with an explicit `bassNote` override.
   * The `bassNote` need not be a chord tone (e.g. C major over E bass = C/E).
   * @example slash(cMajor, E4) → C/E
   */
  slash(chord: Chord, bassNote: Pitch): Chord;
}
