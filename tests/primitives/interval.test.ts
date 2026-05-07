import { describe, it, expect } from "vitest";
import { intervalFactory, intervalArithmetic } from "../../src/primitives/interval.js";

describe("IntervalFactory", () => {
  describe("fromNumberAndQuality", () => {
    it("builds a minor third: { number: 3, quality: minor, semitones: 3 }", () => {
      const i = intervalFactory.fromNumberAndQuality(3, "minor");
      expect(i.number).toBe(3);
      expect(i.quality).toBe("minor");
      expect(i.semitones).toBe(3);
    });

    it("builds a perfect fifth: { number: 5, quality: perfect, semitones: 7 }", () => {
      const i = intervalFactory.fromNumberAndQuality(5, "perfect");
      expect(i.number).toBe(5);
      expect(i.quality).toBe("perfect");
      expect(i.semitones).toBe(7);
    });

    it("builds an augmented fourth (tritone): { number: 4, quality: augmented, semitones: 6 }", () => {
      const i = intervalFactory.fromNumberAndQuality(4, "augmented");
      expect(i.number).toBe(4);
      expect(i.quality).toBe("augmented");
      expect(i.semitones).toBe(6);
    });

    it("throws TypeError for perfect third (invalid combination)", () => {
      expect(() => intervalFactory.fromNumberAndQuality(3, "perfect")).toThrow(TypeError);
    });

    it("throws TypeError for major fifth (invalid combination)", () => {
      expect(() => intervalFactory.fromNumberAndQuality(5, "major")).toThrow(TypeError);
    });

    it("sets isCompound: true for M9", () => {
      const i = intervalFactory.fromNumberAndQuality(9, "major");
      expect(i.isCompound).toBe(true);
    });

    it("sets isCompound: false for M3", () => {
      const i = intervalFactory.fromNumberAndQuality(3, "major");
      expect(i.isCompound).toBe(false);
    });
  });

  describe("fromSemitones", () => {
    it("3 semitones → minor third by default", () => {
      const i = intervalFactory.fromSemitones(3);
      expect(i.number).toBe(3);
      expect(i.quality).toBe("minor");
    });

    it("3 semitones with preferFlat: false → minor third", () => {
      const i = intervalFactory.fromSemitones(3, false);
      expect(i.number).toBe(3);
      expect(i.quality).toBe("minor");
    });

    it("7 semitones → perfect fifth", () => {
      const i = intervalFactory.fromSemitones(7);
      expect(i.number).toBe(5);
      expect(i.quality).toBe("perfect");
    });

    it("12 semitones → perfect octave", () => {
      const i = intervalFactory.fromSemitones(12);
      expect(i.number).toBe(8);
      expect(i.quality).toBe("perfect");
    });

    it("14 semitones → major ninth (compound)", () => {
      const i = intervalFactory.fromSemitones(14);
      expect(i.number).toBe(9);
      expect(i.quality).toBe("major");
      expect(i.isCompound).toBe(true);
    });
  });
});

describe("IntervalArithmetic", () => {
  const P4 = intervalFactory.fromNumberAndQuality(4, "perfect");
  const P5 = intervalFactory.fromNumberAndQuality(5, "perfect");
  const M3 = intervalFactory.fromNumberAndQuality(3, "major");
  const m3 = intervalFactory.fromNumberAndQuality(3, "minor");
  const A4 = intervalFactory.fromNumberAndQuality(4, "augmented");
  const m7 = intervalFactory.fromNumberAndQuality(7, "minor");
  const P8 = intervalFactory.fromNumberAndQuality(8, "perfect");
  const M9 = intervalFactory.fromNumberAndQuality(9, "major");

  describe("add", () => {
    it("P5 + P4 = P8", () => {
      const result = intervalArithmetic.add(P5, P4);
      expect(result.number).toBe(8);
      expect(result.quality).toBe("perfect");
      expect(result.semitones).toBe(12);
    });

    it("M3 + m3 = P5", () => {
      const result = intervalArithmetic.add(M3, m3);
      expect(result.number).toBe(5);
      expect(result.quality).toBe("perfect");
      expect(result.semitones).toBe(7);
    });

    it("result number = a.number + b.number - 1", () => {
      const result = intervalArithmetic.add(P5, P4);
      expect(result.number).toBe(P5.number + P4.number - 1);
    });
  });

  describe("invert", () => {
    it("invert(M3) → m6", () => {
      const result = intervalArithmetic.invert(M3);
      expect(result.number).toBe(6);
      expect(result.quality).toBe("minor");
      expect(result.semitones).toBe(8);
    });

    it("invert(P5) → P4", () => {
      const result = intervalArithmetic.invert(P5);
      expect(result.number).toBe(4);
      expect(result.quality).toBe("perfect");
      expect(result.semitones).toBe(5);
    });

    it("invert(A4) → d5", () => {
      const result = intervalArithmetic.invert(A4);
      expect(result.number).toBe(5);
      expect(result.quality).toBe("diminished");
      expect(result.semitones).toBe(6);
    });

    it("invert(m7) → M2", () => {
      const result = intervalArithmetic.invert(m7);
      expect(result.number).toBe(2);
      expect(result.quality).toBe("major");
      expect(result.semitones).toBe(2);
    });

    it("invert(P8) → P1 (unison)", () => {
      const result = intervalArithmetic.invert(P8);
      expect(result.number).toBe(1);
      expect(result.quality).toBe("perfect");
      expect(result.semitones).toBe(0);
    });
  });

  describe("complement", () => {
    it("complement(P5) + P5 = P8", () => {
      const comp = intervalArithmetic.complement(P5);
      const sum = intervalArithmetic.add(comp, P5);
      expect(sum.number).toBe(8);
      expect(sum.quality).toBe("perfect");
    });

    it("same as invert for simple intervals", () => {
      const inverted = intervalArithmetic.invert(M3);
      const complemented = intervalArithmetic.complement(M3);
      expect(complemented.number).toBe(inverted.number);
      expect(complemented.quality).toBe(inverted.quality);
      expect(complemented.semitones).toBe(inverted.semitones);
    });
  });

  describe("simplify", () => {
    it("simplify(M9) → M2", () => {
      const result = intervalArithmetic.simplify(M9);
      expect(result.number).toBe(2);
      expect(result.quality).toBe("major");
      expect(result.semitones).toBe(2);
      expect(result.isCompound).toBe(false);
    });

    it("simplify(P8) → P8", () => {
      const result = intervalArithmetic.simplify(P8);
      expect(result.number).toBe(8);
      expect(result.quality).toBe("perfect");
    });

    it("simplify(m7) → m7 (already simple)", () => {
      const result = intervalArithmetic.simplify(m7);
      expect(result.number).toBe(7);
      expect(result.quality).toBe("minor");
    });
  });

  describe("compound", () => {
    it("compound(M3, 1) → M10", () => {
      const result = intervalArithmetic.compound(M3, 1);
      expect(result.number).toBe(10);
      expect(result.quality).toBe("major");
      expect(result.semitones).toBe(16);
      expect(result.isCompound).toBe(true);
    });

    it("compound(P5, 0) → P5 (unchanged)", () => {
      const result = intervalArithmetic.compound(P5, 0);
      expect(result.number).toBe(5);
      expect(result.quality).toBe("perfect");
      expect(result.semitones).toBe(7);
    });
  });

  describe("compare", () => {
    it("M3 < P5 (returns negative)", () => {
      expect(intervalArithmetic.compare(M3, P5)).toBeLessThan(0);
    });

    it("P5 === P5 (returns 0)", () => {
      expect(intervalArithmetic.compare(P5, P5)).toBe(0);
    });

    it("P5 > M3 (returns positive)", () => {
      expect(intervalArithmetic.compare(P5, M3)).toBeGreaterThan(0);
    });
  });
});
