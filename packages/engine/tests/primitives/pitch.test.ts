import { describe, it, expect } from "vitest";
import { pitchFactory, pitchArithmetic } from "../../src/primitives/pitch.ts";
import { NoteLetter, Accidental } from "../../src/primitives/note-name.ts";
import { intervalFactory } from "../../src/primitives/interval.ts";

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
    it("preserves caller's octave even when MIDI falls in different octave (Cb4)", () => {
      const pitch = pitchFactory.fromSpelling(
        { letter: NoteLetter.C, accidental: Accidental.Flat },
        4
      );
      expect(pitch.midi).toBe(59);    // MIDI 59 = B3
      expect(pitch.octave).toBe(4);   // but it's still Cb4 (not B3)
      expect(pitch.spelling.letter).toBe(NoteLetter.C);
      expect(pitch.spelling.accidental).toBe(Accidental.Flat);
    });

    it("preserves caller's octave even when MIDI falls in different octave (B#4)", () => {
      const pitch = pitchFactory.fromSpelling(
        { letter: NoteLetter.B, accidental: Accidental.Sharp },
        4
      );
      expect(pitch.midi).toBe(72);    // MIDI 72 — enharmonic with C5
      expect(pitch.octave).toBe(4);   // but it's still B#4 (not C5)
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
    it("transposing from a flat spelling preserves flat preference when possible", () => {
      const bFlat = pitchFactory.fromMidiWithSpelling(70, {
        letter: NoteLetter.B,
        accidental: Accidental.Flat,
      });
      const up = pitchArithmetic.transpose(bFlat, 3); // Bb → Db (prefer flat over C#)
      expect(up.spelling.letter).toBe(NoteLetter.D);
      expect(up.spelling.accidental).toBe(Accidental.Flat);
    });

    it("transposing from natural defaults to sharp for black keys", () => {
      const up = pitchArithmetic.transpose(C4, 1); // C → C#
      expect(up.spelling.letter).toBe(NoteLetter.C);
      expect(up.spelling.accidental).toBe(Accidental.Sharp);
    });

    it("transposing to white key keeps natural spelling", () => {
      const up = pitchArithmetic.transpose(C4, 2); // C → D
      expect(up.spelling.letter).toBe(NoteLetter.D);
      expect(up.spelling.accidental).toBe(Accidental.Natural);
    });
  });
  describe("PitchArithmetic.transposeByInterval()", () => {
    const C4 = pitchFactory.fromMidi(60);

    it("C4 + M3 → E4", () => {
      const M3 = intervalFactory.fromNumberAndQuality(3, "major");
      const result = pitchArithmetic.transposeByInterval(C4, M3);
      expect(result.midi).toBe(64);
      expect(result.spelling.letter).toBe(NoteLetter.E);
      expect(result.spelling.accidental).toBe(Accidental.Natural);
    });
    it("C4 + m3 → Eb4 (not D#)", () => {
      const m3 = intervalFactory.fromNumberAndQuality(3, "minor");
      const result = pitchArithmetic.transposeByInterval(C4, m3);
      expect(result.midi).toBe(63);
      expect(result.spelling.letter).toBe(NoteLetter.E);
      expect(result.spelling.accidental).toBe(Accidental.Flat);
    });

    it("C4 + P5 → G4", () => {
      const P5 = intervalFactory.fromNumberAndQuality(5, "perfect");
      const result = pitchArithmetic.transposeByInterval(C4, P5);
      expect(result.midi).toBe(67);
      expect(result.spelling.letter).toBe(NoteLetter.G);
    });

    it("C4 + A4 → F#4 (not Gb)", () => {
      const A4 = intervalFactory.fromNumberAndQuality(4, "augmented");
      const result = pitchArithmetic.transposeByInterval(C4, A4);
      expect(result.midi).toBe(66);
      expect(result.spelling.letter).toBe(NoteLetter.F);
      expect(result.spelling.accidental).toBe(Accidental.Sharp);
    });

    it("C4 + d5 → Gb4 (not F#)", () => {
      const d5 = intervalFactory.fromNumberAndQuality(5, "diminished");
      const result = pitchArithmetic.transposeByInterval(C4, d5);
      expect(result.midi).toBe(66);
      expect(result.spelling.letter).toBe(NoteLetter.G);
      expect(result.spelling.accidental).toBe(Accidental.Flat);
    });

    it("C4 + M7 → B4", () => {
      const M7 = intervalFactory.fromNumberAndQuality(7, "major");
      const result = pitchArithmetic.transposeByInterval(C4, M7);
      expect(result.midi).toBe(71);
      expect(result.spelling.letter).toBe(NoteLetter.B);
    });

    it("C4 + P8 → C5", () => {
      const P8 = intervalFactory.fromNumberAndQuality(8, "perfect");
      const result = pitchArithmetic.transposeByInterval(C4, P8);
      expect(result.midi).toBe(72);
      expect(result.spelling.letter).toBe(NoteLetter.C);
      expect(result.octave).toBe(5);
    });

    it("G4 + M3 → B4", () => {
      const G4 = pitchFactory.fromMidiWithSpelling(67, { letter: NoteLetter.G, accidental: Accidental.Natural });
      const M3 = intervalFactory.fromNumberAndQuality(3, "major");
      const result = pitchArithmetic.transposeByInterval(G4, M3);
      expect(result.midi).toBe(71);
      expect(result.spelling.letter).toBe(NoteLetter.B);
      expect(result.spelling.accidental).toBe(Accidental.Natural);
    });

    it("F#4 + m3 → A4", () => {
      const Fs4 = pitchFactory.fromMidiWithSpelling(66, { letter: NoteLetter.F, accidental: Accidental.Sharp });
      const m3 = intervalFactory.fromNumberAndQuality(3, "minor");
      const result = pitchArithmetic.transposeByInterval(Fs4, m3);
      expect(result.midi).toBe(69);
      expect(result.spelling.letter).toBe(NoteLetter.A);
      expect(result.spelling.accidental).toBe(Accidental.Natural);
    });
  });

  describe("PitchArithmetic.intervalBetween()", () => {
    const C4 = pitchFactory.fromMidi(60);

    it("C4 → E4 = M3", () => {
      const E4 = pitchFactory.fromMidiWithSpelling(64, { letter: NoteLetter.E, accidental: Accidental.Natural });
      const interval = pitchArithmetic.intervalBetween(C4, E4);
      expect(interval.number).toBe(3);
      expect(interval.quality).toBe("major");
      expect(interval.semitones).toBe(4);
    });

    it("C4 → Eb4 = m3", () => {
      const Eb4 = pitchFactory.fromMidiWithSpelling(63, { letter: NoteLetter.E, accidental: Accidental.Flat });
      const interval = pitchArithmetic.intervalBetween(C4, Eb4);
      expect(interval.number).toBe(3);
      expect(interval.quality).toBe("minor");
      expect(interval.semitones).toBe(3);
    });

    it("C4 → D#4 = A2 (augmented second, not minor third)", () => {
      const Ds4 = pitchFactory.fromMidiWithSpelling(63, { letter: NoteLetter.D, accidental: Accidental.Sharp });
      const interval = pitchArithmetic.intervalBetween(C4, Ds4);
      expect(interval.number).toBe(2);
      expect(interval.quality).toBe("augmented");
      expect(interval.semitones).toBe(3);
    });

    it("C4 → G4 = P5", () => {
      const G4 = pitchFactory.fromMidiWithSpelling(67, { letter: NoteLetter.G, accidental: Accidental.Natural });
      const interval = pitchArithmetic.intervalBetween(C4, G4);
      expect(interval.number).toBe(5);
      expect(interval.quality).toBe("perfect");
      expect(interval.semitones).toBe(7);
    });

    it("C4 → F#4 = A4", () => {
      const Fs4 = pitchFactory.fromMidiWithSpelling(66, { letter: NoteLetter.F, accidental: Accidental.Sharp });
      const interval = pitchArithmetic.intervalBetween(C4, Fs4);
      expect(interval.number).toBe(4);
      expect(interval.quality).toBe("augmented");
      expect(interval.semitones).toBe(6);
    });

    it("C4 → Gb4 = d5", () => {
      const Gb4 = pitchFactory.fromMidiWithSpelling(66, { letter: NoteLetter.G, accidental: Accidental.Flat });
      const interval = pitchArithmetic.intervalBetween(C4, Gb4);
      expect(interval.number).toBe(5);
      expect(interval.quality).toBe("diminished");
      expect(interval.semitones).toBe(6);
    });

    it("C4 → C5 = P8", () => {
      const C5 = pitchFactory.fromMidiWithSpelling(72, { letter: NoteLetter.C, accidental: Accidental.Natural });
      const interval = pitchArithmetic.intervalBetween(C4, C5);
      expect(interval.number).toBe(8);
      expect(interval.quality).toBe("perfect");
      expect(interval.semitones).toBe(12);
    });

    it("C4 → B4 = M7", () => {
      const B4 = pitchFactory.fromMidiWithSpelling(71, { letter: NoteLetter.B, accidental: Accidental.Natural });
      const interval = pitchArithmetic.intervalBetween(C4, B4);
      expect(interval.number).toBe(7);
      expect(interval.quality).toBe("major");
      expect(interval.semitones).toBe(11);
    });

    it("E4 → C4 (descending) = m6 (inverted from M3)", () => {
      const E4 = pitchFactory.fromMidiWithSpelling(64, { letter: NoteLetter.E, accidental: Accidental.Natural });
      const interval = pitchArithmetic.intervalBetween(E4, C4);
      // E down to C is a descending M3 — should invert to m6 ascending
      // Or if function returns signed/descending, adapt accordingly
      expect(interval.number).toBe(6);
      expect(interval.quality).toBe("minor");
      expect(interval.semitones).toBe(8);
    });

    it("F4 → B4 = A4 (tritone)", () => {
      const F4 = pitchFactory.fromMidiWithSpelling(65, { letter: NoteLetter.F, accidental: Accidental.Natural });
      const B4 = pitchFactory.fromMidiWithSpelling(71, { letter: NoteLetter.B, accidental: Accidental.Natural });
      const interval = pitchArithmetic.intervalBetween(F4, B4);
      expect(interval.number).toBe(4);
      expect(interval.quality).toBe("augmented");
      expect(interval.semitones).toBe(6);
    });

    it("F4 → Cb5 = d5", () => {
      const F4 = pitchFactory.fromMidiWithSpelling(65, { letter: NoteLetter.F, accidental: Accidental.Natural });
      const Cb5 = pitchFactory.fromMidiWithSpelling(71, { letter: NoteLetter.C, accidental: Accidental.Flat });
      const interval = pitchArithmetic.intervalBetween(F4, Cb5);
      expect(interval.number).toBe(5);
      expect(interval.quality).toBe("diminished");
      expect(interval.semitones).toBe(6);
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
    it("respells E# → F", () => {
      const eSharp = pitchFactory.fromMidiWithSpelling(65, {
        letter: NoteLetter.E,
        accidental: Accidental.Sharp,
      });
      const respelled = pitchArithmetic.respell(eSharp);
      expect(respelled.spelling.letter).toBe(NoteLetter.F);
      expect(respelled.spelling.accidental).toBe(Accidental.Natural);
    });

    it("respells B# → C", () => {
      const bSharp = pitchFactory.fromMidiWithSpelling(60, {
        letter: NoteLetter.B,
        accidental: Accidental.Sharp,
      });
      const respelled = pitchArithmetic.respell(bSharp);
      expect(respelled.spelling.letter).toBe(NoteLetter.C);
      expect(respelled.spelling.accidental).toBe(Accidental.Natural);
    });

    it("respells Cb → B", () => {
      const cFlat = pitchFactory.fromMidiWithSpelling(59, {
        letter: NoteLetter.C,
        accidental: Accidental.Flat,
      });
      const respelled = pitchArithmetic.respell(cFlat);
      expect(respelled.spelling.letter).toBe(NoteLetter.B);
      expect(respelled.spelling.accidental).toBe(Accidental.Natural);
    });

    it("respells Fb → E", () => {
      const fFlat = pitchFactory.fromMidiWithSpelling(64, {
        letter: NoteLetter.F,
        accidental: Accidental.Flat,
      });
      const respelled = pitchArithmetic.respell(fFlat);
      expect(respelled.spelling.letter).toBe(NoteLetter.E);
      expect(respelled.spelling.accidental).toBe(Accidental.Natural);
    });
  });
});
