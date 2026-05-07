import { describe, it, expect } from "vitest";

describe("IntervalFactory", () => {
  describe("fromNumberAndQuality", () => {
    it("builds a minor third: { number: 3, quality: minor, semitones: 3 }", () => {});
    it("builds a perfect fifth: { number: 5, quality: perfect, semitones: 7 }", () => {});
    it("builds an augmented fourth (tritone): { number: 4, quality: augmented, semitones: 6 }", () => {});
    it("throws TypeError for perfect third (invalid combination)", () => {});
    it("throws TypeError for major fifth (invalid combination)", () => {});
    it("sets isCompound: true for M9", () => {});
    it("sets isCompound: false for M3", () => {});
  });

  describe("fromSemitones", () => {
    it("3 semitones → minor third by default", () => {});
    it("3 semitones with preferFlat: false → minor third", () => {});
    it("7 semitones → perfect fifth", () => {});
    it("12 semitones → perfect octave", () => {});
    it("14 semitones → major ninth (compound)", () => {});
  });
});

describe("IntervalArithmetic", () => {
  describe("add", () => {
    it("P5 + P4 = P8", () => {});
    it("M3 + m3 = P5", () => {});
    it("result number = a.number + b.number - 1", () => {});
  });

  describe("invert", () => {
    it("invert(M3) → m6", () => {});
    it("invert(P5) → P4", () => {});
    it("invert(A4) → d5", () => {});
    it("invert(m7) → M2", () => {});
    it("invert(P8) → P1 (unison)", () => {});
  });

  describe("complement", () => {
    it("complement(P5) + P5 = P8", () => {});
    it("same as invert for simple intervals", () => {});
  });

  describe("simplify", () => {
    it("simplify(M9) → M2", () => {});
    it("simplify(P8) → P8", () => {});
    it("simplify(m7) → m7 (already simple)", () => {});
  });

  describe("compound", () => {
    it("compound(M3, 1) → M10", () => {});
    it("compound(P5, 0) → P5 (unchanged)", () => {});
  });

  describe("compare", () => {
    it("M3 < P5 (returns negative)", () => {});
    it("P5 === P5 (returns 0)", () => {});
    it("P5 > M3 (returns positive)", () => {});
  });
});
