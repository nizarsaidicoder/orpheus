import { describe, it, expect } from "vitest";
import { pitchFactory, pitchArithmetic } from "../../src/primitives/pitch.js";
import { NoteLetter, Accidental } from "../../src/primitives/note-name.js";

describe("PitchFactory", () => {
  describe("fromMidi", () => {
    it("builds C4 from MIDI 60 with correct frequency", () => {
      const pitch = pitchFactory.fromMidi(60);
      expect(pitch.midi).toBe(60);
      expect(pitch.frequency).toBeCloseTo(261.63, 1);
    });

    it("builds A4 from MIDI 69 with frequency 440 Hz", () => {
      const pitch = pitchFactory.fromMidi(69);
      expect(pitch.frequency).toBeCloseTo(440, 0);
    });

    it("uses sharp spelling for black keys by default", () => {
      const pitch = pitchFactory.fromMidi(61); // C#/Db
      expect(pitch.spelling.letter).toBe(NoteLetter.C);
      expect(pitch.spelling.accidental).toBe(Accidental.Sharp);
    });

    it("throws RangeError for MIDI < 0", () => {
      expect(() => pitchFactory.fromMidi(-1)).toThrow(RangeError);
    });

    it("throws RangeError for MIDI > 127", () => {
      expect(() => pitchFactory.fromMidi(128)).toThrow(RangeError);
    });

    it("assigns correct octave for C4 (MIDI 60)", () => {
      expect(pitchFactory.fromMidi(60).octave).toBe(4);
    });

    it("assigns correct octave for B3 (MIDI 59)", () => {
      expect(pitchFactory.fromMidi(59).octave).toBe(3);
    });
  });

  describe("fromMidiWithSpelling", () => {
    it("overrides spelling while keeping same MIDI identity", () => {
      const gSharp = pitchFactory.fromMidi(68);
      const aFlat = pitchFactory.fromMidiWithSpelling(68, {
        letter: NoteLetter.A,
        accidental: Accidental.Flat,
      });
      expect(aFlat.midi).toBe(gSharp.midi);
      expect(aFlat.spelling.letter).toBe(NoteLetter.A);
      expect(aFlat.spelling.accidental).toBe(Accidental.Flat);
    });

    it("G# and Ab both produce MIDI 68 with different spellings", () => {
      const gSharp = pitchFactory.fromMidiWithSpelling(68, {
        letter: NoteLetter.G,
        accidental: Accidental.Sharp,
      });
      const aFlat = pitchFactory.fromMidiWithSpelling(68, {
        letter: NoteLetter.A,
        accidental: Accidental.Flat,
      });
      expect(gSharp.midi).toBe(68);
      expect(aFlat.midi).toBe(68);
      expect(gSharp.spelling.letter).toBe(NoteLetter.G);
      expect(aFlat.spelling.letter).toBe(NoteLetter.A);
    });
  });

  describe("fromSpelling", () => {
    it("builds C4 from { letter: C, accidental: Natural } octave 4", () => {
      const pitch = pitchFactory.fromSpelling(
        { letter: NoteLetter.C, accidental: Accidental.Natural },
        4
      );
      expect(pitch.midi).toBe(60);
      expect(pitch.octave).toBe(4);
    });

    it("builds Gb5 from { letter: G, accidental: Flat } octave 5", () => {
      const pitch = pitchFactory.fromSpelling(
        { letter: NoteLetter.G, accidental: Accidental.Flat },
        5
      );
      expect(pitch.midi).toBe(78);
      expect(pitch.spelling.letter).toBe(NoteLetter.G);
      expect(pitch.spelling.accidental).toBe(Accidental.Flat);
    });

    it("throws RangeError when result MIDI exceeds [0, 127]", () => {
      expect(() =>
        pitchFactory.fromSpelling({ letter: NoteLetter.G, accidental: Accidental.Natural }, 15)
      ).toThrow(RangeError);
    });
  });

  describe("fromFrequency", () => {
    it("440 Hz → MIDI 69 (A4)", () => {
      const pitch = pitchFactory.fromFrequency(440);
      expect(pitch.midi).toBe(69);
    });

    it("round-trips: fromFrequency(fromMidi(69).frequency).midi === 69", () => {
      const original = pitchFactory.fromMidi(69);
      const roundTripped = pitchFactory.fromFrequency(original.frequency);
      expect(roundTripped.midi).toBe(69);
    });
  });
});

describe("PitchArithmetic", () => {
  const C4 = pitchFactory.fromMidi(60);
  const G4 = pitchFactory.fromMidi(67);
  const C3 = pitchFactory.fromMidi(48);

  describe("transpose", () => {
    it("transposes C4 up by 7 semitones → G4", () => {
      expect(pitchArithmetic.transpose(C4, 7).midi).toBe(67);
    });

    it("transposes C4 down by 12 semitones → C3", () => {
      expect(pitchArithmetic.transpose(C4, -12).midi).toBe(48);
    });

    it("clamps result to MIDI [0, 127]", () => {
      const low = pitchFactory.fromMidi(0);
      const high = pitchFactory.fromMidi(127);
      expect(pitchArithmetic.transpose(low, -10).midi).toBe(0);
      expect(pitchArithmetic.transpose(high, 10).midi).toBe(127);
    });
  });

  describe("semitonesBetween", () => {
    it("C4 to G4 = +7", () => {
      expect(pitchArithmetic.semitonesBetween(C4, G4)).toBe(7);
    });

    it("G4 to C4 = -7", () => {
      expect(pitchArithmetic.semitonesBetween(G4, C4)).toBe(-7);
    });

    it("same pitch = 0", () => {
      expect(pitchArithmetic.semitonesBetween(C4, C4)).toBe(0);
    });
  });

  describe("isEnharmonic", () => {
    it("G# and Ab are enharmonic", () => {
      const gSharp = pitchFactory.fromMidiWithSpelling(68, {
        letter: NoteLetter.G,
        accidental: Accidental.Sharp,
      });
      const aFlat = pitchFactory.fromMidiWithSpelling(68, {
        letter: NoteLetter.A,
        accidental: Accidental.Flat,
      });
      expect(pitchArithmetic.isEnharmonic(gSharp, aFlat)).toBe(true);
    });

    it("C4 and C5 are not enharmonic", () => {
      expect(pitchArithmetic.isEnharmonic(C4, pitchFactory.fromMidi(72))).toBe(false);
    });

    it("two C4 pitches are enharmonic", () => {
      expect(pitchArithmetic.isEnharmonic(C4, pitchFactory.fromMidi(60))).toBe(true);
    });
  });

  describe("respell", () => {
    it("respells G# → Ab", () => {
      const gSharp = pitchFactory.fromMidiWithSpelling(68, {
        letter: NoteLetter.G,
        accidental: Accidental.Sharp,
      });
      const respelled = pitchArithmetic.respell(gSharp);
      expect(respelled.spelling.letter).toBe(NoteLetter.A);
      expect(respelled.spelling.accidental).toBe(Accidental.Flat);
    });

    it("respells Ab → G#", () => {
      const aFlat = pitchFactory.fromMidiWithSpelling(68, {
        letter: NoteLetter.A,
        accidental: Accidental.Flat,
      });
      const respelled = pitchArithmetic.respell(aFlat);
      expect(respelled.spelling.letter).toBe(NoteLetter.G);
      expect(respelled.spelling.accidental).toBe(Accidental.Sharp);
    });

    it("returns same pitch for C natural (no enharmonic)", () => {
      const respelled = pitchArithmetic.respell(C4);
      expect(respelled.spelling.letter).toBe(NoteLetter.C);
      expect(respelled.spelling.accidental).toBe(Accidental.Natural);
      expect(respelled.midi).toBe(60);
    });
  });
});
