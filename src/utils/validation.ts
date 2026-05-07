import type { MidiNumber } from "../primitives/pitch.js";

/** Returns true if `n` is an integer in [0, 127]. */
export function isMidiNumber(n: unknown): n is MidiNumber {
  return typeof n === "number" && Number.isInteger(n) && n >= 0 && n <= 127;
}

/** Returns true if `n` is an integer in [0, 11]. */
export function isPitchClass(n: unknown): n is number {
  return typeof n === "number" && Number.isInteger(n) && n >= 0 && n <= 11;
}

/** Returns true if `n` is a positive finite number (valid Hz range). */
export function isFrequencyHz(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n) && n > 0;
}

/** Asserts `value` is a valid MIDI number; throws RangeError otherwise. */
export function assertMidi(value: number): asserts value is MidiNumber {
  if (!isMidiNumber(value)) {
    throw new RangeError(`Invalid MIDI number: ${value}. Must be integer in [0, 127].`);
  }
}

/** Asserts `value` is an integer in [1, max]; throws RangeError otherwise. */
export function assertScaleDegree(value: number, max: number): void {
  if (!Number.isInteger(value) || value < 1) {
    throw new RangeError(`Invalid scale degree: ${value}. Must be integer ≥ 1.`);
  }
}
