import type { Pitch } from "../primitives/pitch.js";
import type { Chord } from "./chord.js";

/**
 * Voicing style for spread-chord generation.
 *
 * - close:   all pitches within one octave, root position
 * - drop2:   second voice from top drops one octave (common 4-voice jazz voicing)
 * - drop3:   third voice from top drops one octave
 * - open:    pitches spread over two or more octaves
 */
export type VoicingStyle = "close" | "drop2" | "drop3" | "open";

/**
 * A voiced chord: a chord with pitches arranged for a specific register and style.
 * Pitches remain in ascending order.
 */
export interface VoicedChord {
  readonly source:  Chord;
  readonly style:   VoicingStyle;
  /** Pitches in ascending order (bass to soprano). */
  readonly pitches: ReadonlyArray<Pitch>;
}

/**
 * Generates voiced versions of chords.
 * All methods are pure functions returning new VoicedChord instances.
 */
export interface VoicingGenerator {
  /**
   * Close-position voicing: all pitches within one octave above the bass.
   * Equivalent to the chord's `pitches` field in root position.
   */
  close(chord: Chord): VoicedChord;

  /**
   * Drop-2 voicing: second pitch from top is dropped one octave.
   * Standard 4-voice jazz voicing for 7th chords.
   * Throws if chord has fewer than 4 pitches.
   */
  drop2(chord: Chord): VoicedChord;

  /**
   * Drop-3 voicing: third pitch from top is dropped one octave.
   * Throws if chord has fewer than 4 pitches.
   */
  drop3(chord: Chord): VoicedChord;

  /**
   * Open voicing: spread pitches across two+ octaves by alternately raising voices.
   */
  open(chord: Chord): VoicedChord;
}
