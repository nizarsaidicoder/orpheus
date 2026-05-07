import type { SpelledNoteName } from "./note-name.js";
import { NoteLetter } from "./note-name.js";
import { ENHARMONIC_TABLE, enharmonicEquivalentOf } from "../utils/enharmonic.js";
import { frequencyConverter } from "./frequency.js";
import { assertMidi } from "../utils/validation.js";

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
    const octave = Math.floor(midi / 12) - 1;
    const pc = midi % 12;
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
};
