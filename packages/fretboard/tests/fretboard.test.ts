import { describe, it, expect } from "vitest";
import { fretboardFactory } from "../src/fretboard/fretboard-factory.js";
import { STANDARD_TUNING, DROP_D } from "../src/tunings/standard-tunings.js";
import { tuningFactory } from "../src/tunings/tuning-factory.js";

describe("Fretboard", () => {
  const fb = fretboardFactory.build(STANDARD_TUNING);

  describe("pitchAt", () => {
    it("returns open pitch on fret 0", () => {
      // String 6 = low E (MIDI 40), String 1 = high e (MIDI 64)
      expect(fb.pitchAt(6, 0).midi).toBe(40);
      expect(fb.pitchAt(1, 0).midi).toBe(64);
    });

    it("raises by one semitone per fret", () => {
      expect(fb.pitchAt(6, 1).midi).toBe(41);
      expect(fb.pitchAt(6, 12).midi).toBe(52);
    });

    it("returns high-e octave at fret 12 string 1", () => {
      expect(fb.pitchAt(1, 12).midi).toBe(76);
    });

    it("throws on invalid string", () => {
      expect(() => fb.pitchAt(7, 0)).toThrow(RangeError);
    });

    it("throws on negative fret", () => {
      expect(() => fb.pitchAt(1, -1)).toThrow(RangeError);
    });
  });

  describe("positionsForString", () => {
    it("returns fretCount+1 positions per string", () => {
      expect(fb.positionsForString(1).length).toBe(25); // frets 0..24
    });

    it("positions are ascending in midi", () => {
      const positions = fb.positionsForString(6);
      for (let i = 1; i < positions.length; i++) {
        expect(positions[i]!.pitch.midi).toBeGreaterThan(positions[i - 1]!.pitch.midi);
      }
    });
  });

  describe("positionsForPitch", () => {
    it("finds all occurrences of a pitch across strings", () => {
      // E4 (MIDI 64) appears on string 1 fret 0, string 2 fret 5, string 3 fret 9, etc.
      const e4Positions = fb.positionsForPitch({ midi: 64 } as never);
      expect(e4Positions.length).toBeGreaterThan(1);
      for (const pos of e4Positions) {
        expect(pos.pitch.midi).toBe(64);
      }
    });
  });

  describe("positionsForPitchClass", () => {
    it("finds all E pitch class positions (pc=4)", () => {
      const ePositions = fb.positionsForPitchClass(4);
      expect(ePositions.length).toBeGreaterThan(5);
      for (const pos of ePositions) {
        expect(pos.pitch.pitchClass).toBe(4);
      }
    });
  });

  describe("positionsInRange", () => {
    it("filters positions by fret range", () => {
      const inRange = fb.positionsInRange(5, 7);
      for (const pos of inRange) {
        expect(pos.fret).toBeGreaterThanOrEqual(5);
        expect(pos.fret).toBeLessThanOrEqual(7);
      }
    });
  });

  describe("stringCount", () => {
    it("returns 6 for standard tuning", () => {
      expect(fb.stringCount).toBe(6);
    });
  });

  describe("tuning variations", () => {
    it("Drop D lowers string 6 by 2 semitones", () => {
      const dropD = fretboardFactory.build(DROP_D);
      expect(dropD.pitchAt(6, 0).midi).toBe(38); // D2
    });

    it("custom tuning via fromMidiArray", () => {
      const fourString = tuningFactory.fromMidiArray("Test", [43, 48, 53, 57]);
      const fb4 = fretboardFactory.build(fourString);
      expect(fb4.stringCount).toBe(4);
      expect(fb4.pitchAt(4, 0).midi).toBe(43); // lowest string
    });
  });
});
