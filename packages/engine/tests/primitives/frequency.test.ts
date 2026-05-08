import { describe, it, expect } from "vitest";
import { frequencyConverter, A4_HZ, A4_MIDI } from "../../src/primitives/frequency.ts";
import type { FrequencyHz, MidiNumber } from "../../src/primitives/pitch.ts";
const M = (n: number) => n as MidiNumber;

describe("FrequencyConverter", () => {
  describe("midiToHz", () => {
    it("A4 (MIDI 69) = 440 Hz", () => {
      expect(frequencyConverter.midiToHz(A4_MIDI)).toBeCloseTo(440, 5);
    });

    it("A5 (MIDI 81) = 880 Hz (one octave above)", () => {
      expect(frequencyConverter.midiToHz(M(81))).toBeCloseTo(880, 3);
    });

    it("C4 (MIDI 60) ≈ 261.626 Hz", () => {
      expect(frequencyConverter.midiToHz(M(60))).toBeCloseTo(261.626, 2);
    });

    it("MIDI 0 produces a positive frequency", () => {
      expect(frequencyConverter.midiToHz(M(0))).toBeGreaterThan(0);
    });

    it("MIDI 127 produces a finite positive frequency", () => {
      const f = frequencyConverter.midiToHz(M(127));
      expect(Number.isFinite(f)).toBe(true);
      expect(f).toBeGreaterThan(0);
    });
  });

  describe("hzToMidi", () => {
    it("440 Hz → MIDI 69", () => {
      expect(frequencyConverter.hzToMidi(A4_HZ)).toBe(A4_MIDI);
    });

    it("round-trip: hzToMidi(midiToHz(n)) === n for all MIDI integers 0–127", () => {
      for (let i = 0; i <= 127; i++) {
        const hz = frequencyConverter.midiToHz(M(i));
        expect(frequencyConverter.hzToMidi(hz)).toBe(M(i));
      }
    });
  });

  describe("hzToMidiExact", () => {
    it("440 Hz → exactly 69.0", () => {
      expect(frequencyConverter.hzToMidiExact(A4_HZ)).toBeCloseTo(69, 10);
    });

    it("returns fractional value for frequencies between MIDI notes", () => {
      const halfwayHz = frequencyConverter.midiToHz(M(69)) * Math.pow(2, 0.5 / 12);
      const exact = frequencyConverter.hzToMidiExact(halfwayHz as FrequencyHz);
      expect(exact).toBeGreaterThan(69);
      expect(exact).toBeLessThan(70);
    });
  });
});
