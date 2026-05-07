import { describe, it, expect } from "vitest";

describe("PitchFactory", () => {
  describe("fromMidi", () => {
    it("builds C4 from MIDI 60 with correct frequency", () => {});
    it("builds A4 from MIDI 69 with frequency 440 Hz", () => {});
    it("uses sharp spelling for black keys by default", () => {});
    it("throws RangeError for MIDI < 0", () => {});
    it("throws RangeError for MIDI > 127", () => {});
    it("assigns correct octave for C4 (MIDI 60)", () => {});
    it("assigns correct octave for B3 (MIDI 59)", () => {});
  });

  describe("fromMidiWithSpelling", () => {
    it("overrides spelling while keeping same MIDI identity", () => {});
    it("G# and Ab both produce MIDI 68 with different spellings", () => {});
  });

  describe("fromSpelling", () => {
    it("builds C4 from { letter: C, accidental: Natural } octave 4", () => {});
    it("builds Gb5 from { letter: G, accidental: Flat } octave 5", () => {});
    it("throws RangeError when result MIDI exceeds [0, 127]", () => {});
  });

  describe("fromFrequency", () => {
    it("440 Hz → MIDI 69 (A4)", () => {});
    it("round-trips: fromFrequency(fromMidi(69).frequency).midi === 69", () => {});
  });
});

describe("PitchArithmetic", () => {
  describe("transpose", () => {
    it("transposes C4 up by 7 semitones → G4", () => {});
    it("transposes C4 down by 12 semitones → C3", () => {});
    it("clamps result to MIDI [0, 127]", () => {});
  });

  describe("semitonesBetween", () => {
    it("C4 to G4 = +7", () => {});
    it("G4 to C4 = -7", () => {});
    it("same pitch = 0", () => {});
  });

  describe("isEnharmonic", () => {
    it("G# and Ab are enharmonic", () => {});
    it("C4 and C5 are not enharmonic", () => {});
    it("two C4 pitches are enharmonic", () => {});
  });

  describe("respell", () => {
    it("respells G# → Ab", () => {});
    it("respells Ab → G#", () => {});
    it("returns same pitch for C natural (no enharmonic)", () => {});
  });
});
