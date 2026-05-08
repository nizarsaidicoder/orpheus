import type { Accidental, SpelledNoteName } from "./note-name.ts";
import { NoteLetter } from "./note-name.ts";
import { ENHARMONIC_TABLE, enharmonicEquivalentOf } from "../utils/enharmonic.ts";
import { frequencyConverter } from "./frequency.ts";
import { assertMidi } from "../utils/validation.ts";
import { BASE_SEMITONES, intervalArithmetic, PERFECT_NUMBERS, qualityFromOffset } from "./interval.ts";
import type { Interval, IntervalNumber } from "./interval.ts";
import { addDiatonicSteps } from "../chords/index.ts";

// ---------------------------------------------------------------------------
// Branded numeric types — prevent accidental coercion from arbitrary numbers
// ---------------------------------------------------------------------------

/** A MIDI note number in [0, 127]. */
export type MidiNumber = number & { readonly __brand: "MidiNumber" };

/** A chromatic pitch class in [0, 11]. C=0, C#/Db=1, …, B=11. */
export type PitchClass = number & { readonly __brand: "PitchClass" };

/** A frequency in Hertz. Always positive. */
export type FrequencyHz = number & { readonly __brand: "FrequencyHz" };

// ---------------------------------------------------------------------------
// Core Pitch value object
// ---------------------------------------------------------------------------

/**
 * An immutable musical pitch.
 *
 * - `midi`:       canonical numeric identity (0–127); enharmonically equivalent
 *                 pitches share the same MIDI number.
 * - `spelling`:   context-dependent diatonic spelling (G# vs Ab).
 * - `frequency`:  derived from `midi` via equal temperament, A4=440 Hz.
 * - `pitchClass`: `midi % 12`, range [0, 11].
 * - `octave`:     scientific octave (C4 = MIDI 60, octave 4).
 */
export interface Pitch {
  readonly midi:       MidiNumber;
  readonly spelling:   SpelledNoteName;
  readonly frequency:  FrequencyHz;
  readonly pitchClass: PitchClass;
  readonly octave:     number;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Constructs immutable Pitch instances from various input forms.
 * All methods return new objects; nothing is mutated.
 */
export interface PitchFactory {
  /** Build from a raw MIDI integer. Uses sharp spelling for black keys by default. */
  fromMidi(midi: number): Pitch;

  /** Build from MIDI with an explicit enharmonic spelling override. */
  fromMidiWithSpelling(midi: number, spelling: SpelledNoteName): Pitch;

  /**
   * Build from a diatonic spelling + scientific octave.
   * C4 = octave 4. Throws RangeError if the resulting MIDI number is outside [0, 127].
   */
  fromSpelling(spelling: SpelledNoteName, octave: number): Pitch;

  /**
   * Build from a frequency in Hz. Rounds to the nearest MIDI number.
   * Uses default (sharp) spelling for the resulting pitch class.
   */
  fromFrequency(hz: number): Pitch;
}

// ---------------------------------------------------------------------------
// Arithmetic (pure functions)
// ---------------------------------------------------------------------------

/**
 * Pure pitch arithmetic. Every operation returns a new Pitch.
 * Input pitches are never modified.
 */
export interface PitchArithmetic {
  /**
   * Return a new Pitch transposed up by `semitones` (negative = down).
   * Preserves the enharmonic spelling direction (sharp/flat) of the original.
   * Clamps result to [0, 127].
   */
  transpose(pitch: Pitch, semitones: number): Pitch;

  /**
   * Return the signed semitone distance from `a` to `b`.
   * Positive = b is above a. Range: [−127, 127].
   */
  semitonesBetween(a: Pitch, b: Pitch): number;

  /**
   * True if two pitches have the same MIDI number (enharmonic equivalence).
   * G# and Ab → true. C4 and C5 → false.
   */
  isEnharmonic(a: Pitch, b: Pitch): boolean;

  /**
   * Return a new Pitch with the alternative enharmonic spelling.
   * G# → Ab, Db → C#, etc.
   * If no standard enharmonic equivalent exists (e.g. C natural), returns the same pitch.
   */
  respell(pitch: Pitch): Pitch;

  /**
  * Transpose a pitch by a diatonic interval, preserving enharmonic spelling.
  * Uses the interval's number and quality to determine the correct target letter
  * and accidental in the context of the source pitch's spelling.
  *
  * @example transposeByInterval(C4, M3) → E4
  * @example transposeByInterval(C4, A4) → F#4 (not Gb4)
  */
  transposeByInterval(pitch: Pitch, interval: Interval): Pitch;

  /**
   * Return the diatonic interval between two pitches, taking their spellings
   * into account. The result carries `number`, `quality`, and `semitones`.
   *
   * @example intervalBetween(C4, E4) → major third (4 semitones)
   * @example intervalBetween(C4, Eb4) → minor third (3 semitones)
   * @example intervalBetween(C4, D#4) → augmented second (3 semitones)
   *   — same semitones as minor third, but different spelling
   */
  intervalBetween(a: Pitch, b: Pitch): Interval;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const NATURAL_PC: Record<NoteLetter, number> = {
  [NoteLetter.C]: 0,
  [NoteLetter.D]: 2,
  [NoteLetter.E]: 4,
  [NoteLetter.F]: 5,
  [NoteLetter.G]: 7,
  [NoteLetter.A]: 9,
  [NoteLetter.B]: 11,
};

// ---------------------------------------------------------------------------
// Concrete implementations
// ---------------------------------------------------------------------------

export const pitchFactory: PitchFactory = {
  fromMidi(midi: number): Pitch {
    assertMidi(midi);
    const pc = midi % 12;
    const spelling = ENHARMONIC_TABLE[pc]![0]!;
    const frequency = frequencyConverter.midiToHz(midi as MidiNumber);
    const octave = Math.floor(midi / 12) - 1;
    return { midi: midi as MidiNumber, spelling, frequency, pitchClass: pc as PitchClass, octave };
  },

  fromMidiWithSpelling(midi: number, spelling: SpelledNoteName): Pitch {
    assertMidi(midi);
    const frequency = frequencyConverter.midiToHz(midi as MidiNumber);
    const pc = midi % 12;
    const naturalPc = NATURAL_PC[spelling.letter];
    const octave = Math.floor((midi - naturalPc - spelling.accidental) / 12) - 1;
    return { midi: midi as MidiNumber, spelling, frequency, pitchClass: pc as PitchClass, octave };
  },

  fromSpelling(spelling: SpelledNoteName, octave: number): Pitch {
    const midi = (octave + 1) * 12 + NATURAL_PC[spelling.letter] + spelling.accidental;
    assertMidi(midi);
    const frequency = frequencyConverter.midiToHz(midi as MidiNumber);
    const pc = midi % 12;
    return { midi: midi as MidiNumber, spelling, frequency, pitchClass: pc as PitchClass, octave };
  },

  fromFrequency(hz: number): Pitch {
    const midi = frequencyConverter.hzToMidi(hz as FrequencyHz);
    return pitchFactory.fromMidi(midi);
  },
};

export const pitchArithmetic: PitchArithmetic = {
  transpose(pitch: Pitch, semitones: number): Pitch {
    const newMidi = Math.max(0, Math.min(127, pitch.midi + semitones));
    const pc = newMidi % 12;
    const spellings = ENHARMONIC_TABLE[pc]!;
    const useFlatSpelling = pitch.spelling.accidental < 0 && spellings.length > 1;
    const spelling = useFlatSpelling ? spellings[1]! : spellings[0]!;
    return pitchFactory.fromMidiWithSpelling(newMidi, spelling);
  },

  semitonesBetween(a: Pitch, b: Pitch): number {
    return b.midi - a.midi;
  },

  isEnharmonic(a: Pitch, b: Pitch): boolean {
    return a.midi === b.midi;
  },

  respell(pitch: Pitch): Pitch {
    const newSpelling = enharmonicEquivalentOf(pitch.spelling);
    return pitchFactory.fromMidiWithSpelling(pitch.midi, newSpelling);
  },

  transposeByInterval(pitch: Pitch, interval: Interval): Pitch {
    const targetLetter = addDiatonicSteps(pitch.spelling.letter, interval.number - 1);
    const targetOctave = pitch.octave + Math.floor((pitch.spelling.letter + interval.number - 1) / 7);
    const targetNaturalMidi = (targetOctave + 1) * 12 + NATURAL_PC[targetLetter];
    const targetMidi = pitch.midi + interval.semitones;
    const neededAccidental = targetMidi - targetNaturalMidi;

    return pitchFactory.fromSpelling(
      { letter: targetLetter, accidental: neededAccidental as Accidental },
      targetOctave,
    );
  },

  intervalBetween(a: Pitch, b: Pitch): Interval {
    const semitones = b.midi - a.midi;
    const aLetter = a.spelling.letter;
    const bLetter = b.spelling.letter;

    // Diatonic steps: how many staff positions apart (ignoring accidentals)
    const rawSteps = bLetter - aLetter;
    // Octave adjustment: how many octaves apart
    const octaveDiff = b.octave - a.octave;
    const diatonicSteps = rawSteps + octaveDiff * 7;

    // Interval number = diatonic steps + 1 (1-based)
    let number: number;
    if (diatonicSteps >= 0) {
      number = diatonicSteps + 1;
    } else {
      // Invert: interval from b up to a, then invert quality
      const inverted = pitchArithmetic.intervalBetween(b, a);
      return intervalArithmetic.invert(inverted);
    }

    // Clamp number to valid range
    const clampedNumber = Math.max(1, Math.min(13, number)) as IntervalNumber;

    // Determine the "natural" semitones this interval number would have
    // in a major scale context
    const isPerfect = PERFECT_NUMBERS.has(clampedNumber);
    const baseSemitones = BASE_SEMITONES[clampedNumber] ?? semitones;
    const offset = semitones - baseSemitones;

    const quality = qualityFromOffset(offset, isPerfect);

    return {
      number: clampedNumber,
      quality,
      semitones,
      isCompound: clampedNumber > 8,
    };
  },
};
