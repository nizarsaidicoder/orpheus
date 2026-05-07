import { describe, it, expect } from "vitest";
import { frequencyConverter, A4_HZ, A4_MIDI } from "../../src/primitives/frequency.ts";

describe("FrequencyConverter", () => {
  describe("midiToHz", () => {
    it("A4 (MIDI 69) = 440 Hz", () => {
      expect(frequencyConverter.midiToHz(A4_MIDI)).toBeCloseTo(440, 5);
    });

    it("A5 (MIDI 81) = 880 Hz (one octave above)", () => {
      expect(frequencyConverter.midiToHz(81 as any)).toBeCloseTo(880, 3);
    });

    it("C4 (MIDI 60) ≈ 261.626 Hz", () => {
      expect(frequencyConverter.midiToHz(60 as any)).toBeCloseTo(261.626, 2);
    });

    it("MIDI 0 produces a positive frequency", () => {
      expect(frequencyConverter.midiToHz(0 as any)).toBeGreaterThan(0);
    });

    it("MIDI 127 produces a finite positive frequency", () => {
      const f = frequencyConverter.midiToHz(127 as any);
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
        const hz = frequencyConverter.midiToHz(i as any);
        expect(frequencyConverter.hzToMidi(hz)).toBe(i);
      }
    });
  });

  describe("hzToMidiExact", () => {
    it("440 Hz → exactly 69.0", () => {
      expect(frequencyConverter.hzToMidiExact(A4_HZ)).toBeCloseTo(69, 10);
    });

    it("returns fractional value for frequencies between MIDI notes", () => {
      const halfwayHz = frequencyConverter.midiToHz(69 as any) * Math.pow(2, 0.5 / 12);
      const exact = frequencyConverter.hzToMidiExact(halfwayHz as any);
      expect(exact).toBeGreaterThan(69);
      expect(exact).toBeLessThan(70);
    });
  });
});
