import type { FrequencyHz, MidiNumber } from "./pitch.ts";

/** Standard concert A reference: A4 = MIDI 69 = 440 Hz. */
export const A4_HZ   = 440 as FrequencyHz;
export const A4_MIDI = 69  as MidiNumber;

/**
 * Equal-temperament frequency ↔ MIDI conversion.
 * Formula: f = 440 × 2^((midi − 69) / 12)
 */
export interface FrequencyConverter {
  /** Convert a MIDI number to its equal-temperament frequency. */
  midiToHz(midi: MidiNumber): FrequencyHz;

  /** Convert a frequency to the nearest integer MIDI number. */
  hzToMidi(hz: FrequencyHz): MidiNumber;

  /** Convert a frequency to a fractional MIDI number (for microtonal use). */
  hzToMidiExact(hz: FrequencyHz): number;
}

/** Concrete stateless implementation. */
export const frequencyConverter: FrequencyConverter = {
  midiToHz(midi: MidiNumber): FrequencyHz {
    return (A4_HZ * Math.pow(2, (midi - A4_MIDI) / 12)) as FrequencyHz;
  },

  hzToMidi(hz: FrequencyHz): MidiNumber {
    const exact = A4_MIDI + 12 * Math.log2(hz / A4_HZ);
    return Math.round(exact) as MidiNumber;
  },

  hzToMidiExact(hz: FrequencyHz): number {
    return A4_MIDI + 12 * Math.log2(hz / A4_HZ);
  },
};
