import type { SpelledNoteName } from "./note-name.js";

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
