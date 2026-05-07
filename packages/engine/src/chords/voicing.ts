import type { Pitch } from "../primitives/pitch.ts";
import type { Chord } from "./chord.ts";
import { pitchArithmetic } from "../primitives/pitch.ts";

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

// ---------------------------------------------------------------------------
// Concrete implementation
// ---------------------------------------------------------------------------

function sortedAscending(pitches: Pitch[]): Pitch[] {
  return [...pitches].sort((a, b) => a.midi - b.midi);
}

export const voicingGenerator: VoicingGenerator = {
  close(chord: Chord): VoicedChord {
    return { source: chord, style: "close", pitches: chord.pitches };
  },

  drop2(chord: Chord): VoicedChord {
    if (chord.pitches.length < 4) {
      throw new RangeError(`drop2 requires at least 4 voices, got ${chord.pitches.length}`);
    }
    const ps = chord.pitches;
    const dropIdx = ps.length - 2; // second from top
    const dropped = pitchArithmetic.transpose(ps[dropIdx]!, -12);
    const rest = [...ps.slice(0, dropIdx), ...ps.slice(dropIdx + 1)];
    return { source: chord, style: "drop2", pitches: sortedAscending([dropped, ...rest]) };
  },

  drop3(chord: Chord): VoicedChord {
    if (chord.pitches.length < 4) {
      throw new RangeError(`drop3 requires at least 4 voices, got ${chord.pitches.length}`);
    }
    const ps = chord.pitches;
    const dropIdx = ps.length - 3; // third from top
    const dropped = pitchArithmetic.transpose(ps[dropIdx]!, -12);
    const rest = [...ps.slice(0, dropIdx), ...ps.slice(dropIdx + 1)];
    return { source: chord, style: "drop3", pitches: sortedAscending([dropped, ...rest]) };
  },

  open(chord: Chord): VoicedChord {
    // Raise every voice at an odd index (2nd, 4th, ...) up one octave
    const raised = chord.pitches.map((p, i) =>
      i % 2 === 1 ? pitchArithmetic.transpose(p, 12) : p
    );
    return { source: chord, style: "open", pitches: sortedAscending(raised) };
  },
};

// ---------------------------------------------------------------------------

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
