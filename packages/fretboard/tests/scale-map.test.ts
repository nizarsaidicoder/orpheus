import { describe, it, expect } from "vitest";
import { pitchFactory, scaleFactory, MAJOR_PATTERN, MINOR_PENTATONIC_PATTERN } from "@orpheus/engine";
import { fretboardFactory } from "../src/fretboard/fretboard-factory.ts";
import { scaleMapFactory } from "../src/scale-map/scale-map-factory.ts";
import { STANDARD_TUNING } from "../src/tunings/standard-tunings.ts";

const fb = fretboardFactory.build(STANDARD_TUNING);
const cMajor = scaleFactory.build(MAJOR_PATTERN, pitchFactory.fromMidi(60)); // C4

describe("ScaleMap", () => {
  const map = scaleMapFactory.build(cMajor, fb);

  describe("positions", () => {
    it("all positions belong to the C major scale", () => {
      for (const pos of map.positions) {
        expect(cMajor.contains(pos.pitch)).toBe(true);
      }
    });

    it("contains positions across all 6 strings", () => {
      const strings = new Set(map.positions.map(p => p.string));
      expect(strings.size).toBe(6);
    });
  });

  describe("positionsForString", () => {
    it("returns only positions on the requested string", () => {
      const str1 = map.positionsForString(1);
      for (const pos of str1) {
        expect(pos.string).toBe(1);
      }
    });

    it("high-e string (1) has E,F,G notes at low frets", () => {
      const str1 = map.positionsForString(1);
      const pcs = str1.filter(p => p.fret <= 7).map(p => p.pitch.pitchClass);
      expect(pcs).toContain(4); // E
      expect(pcs).toContain(5); // F
      expect(pcs).toContain(7); // G
    });
  });

  describe("positionsInFretRange", () => {
    it("returns only positions within range", () => {
      const inRange = map.positionsInFretRange(0, 4);
      for (const pos of inRange) {
        expect(pos.fret).toBeLessThanOrEqual(4);
      }
    });
  });

  describe("positionsForDegree", () => {
    it("degree 1 returns positions with pitch class 0 (C)", () => {
      const degreeOnePositions = map.positionsForDegree(1);
      for (const pos of degreeOnePositions) {
        expect(pos.pitch.pitchClass).toBe(0);
      }
    });

    it("degree 5 in C major = G (pc=7)", () => {
      const deg5 = map.positionsForDegree(5);
      for (const pos of deg5) {
        expect(pos.pitch.pitchClass).toBe(7);
      }
    });
  });

  describe("scalePositions", () => {
    it("returns non-empty array of scale positions", () => {
      const positions = map.scalePositions();
      expect(positions.length).toBeGreaterThan(0);
    });

    it("all positions within a window are in the scale", () => {
      for (const sp of map.scalePositions()) {
        for (const pos of sp.positions) {
          expect(cMajor.contains(pos.pitch)).toBe(true);
        }
      }
    });

    it("fret range spans at most fretSpan frets", () => {
      for (const sp of map.scalePositions(4)) {
        const [from, to] = sp.fretRange;
        expect(to - from).toBeLessThanOrEqual(4);
      }
    });
  });

  describe("pentatonic scale map", () => {
    it("minor pentatonic has 5 pitch classes", () => {
      const aMinorPentatonic = scaleFactory.build(MINOR_PENTATONIC_PATTERN, pitchFactory.fromMidi(57));
      const pentatonicMap = scaleMapFactory.build(aMinorPentatonic, fb);
      const pcs = new Set(pentatonicMap.positions.map(p => p.pitch.pitchClass));
      expect(pcs.size).toBe(5);
    });
  });
});
