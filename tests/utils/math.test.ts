import { describe, it, expect } from "vitest";
import { pitchMath } from "../../src/utils/math.js";

describe("pitchMath.mod()", () => {
  it("mod(7, 12) = 7", () => { expect(pitchMath.mod(7, 12)).toBe(7); });
  it("mod(-1, 12) = 11", () => { expect(pitchMath.mod(-1, 12)).toBe(11); });
  it("mod(12, 12) = 0", () => { expect(pitchMath.mod(12, 12)).toBe(0); });
  it("mod(0, 12) = 0", () => { expect(pitchMath.mod(0, 12)).toBe(0); });
  it("mod(-13, 12) = 11", () => { expect(pitchMath.mod(-13, 12)).toBe(11); });
});

describe("pitchMath.toPitchClass()", () => {
  it("toPitchClass(60) = 0 (C4 → C)", () => { expect(pitchMath.toPitchClass(60)).toBe(0); });
  it("toPitchClass(69) = 9 (A4 → A)", () => { expect(pitchMath.toPitchClass(69)).toBe(9); });
  it("toPitchClass(-1) = 11", () => { expect(pitchMath.toPitchClass(-1)).toBe(11); });
  it("result always in [0, 11]", () => {
    for (let i = -24; i <= 24; i++) {
      const pc = pitchMath.toPitchClass(i);
      expect(pc).toBeGreaterThanOrEqual(0);
      expect(pc).toBeLessThanOrEqual(11);
    }
  });
});

describe("pitchMath.pitchClassDistance()", () => {
  it("distance(0, 7) = 5 (C to G, shortest path is 5 downward)", () => {
    expect(pitchMath.pitchClassDistance(0 as any, 7 as any)).toBe(5);
  });
  it("distance(0, 6) = 6 (tritone, maximum)", () => {
    expect(pitchMath.pitchClassDistance(0 as any, 6 as any)).toBe(6);
  });
  it("distance(0, 0) = 0", () => {
    expect(pitchMath.pitchClassDistance(0 as any, 0 as any)).toBe(0);
  });
  it("is symmetric", () => {
    expect(pitchMath.pitchClassDistance(3 as any, 9 as any))
      .toBe(pitchMath.pitchClassDistance(9 as any, 3 as any));
  });
});

describe("pitchMath.directedInterval()", () => {
  it("C up to G = 7", () => {
    expect(pitchMath.directedInterval(0 as any, 7 as any, "up")).toBe(7);
  });
  it("G down to C = -7", () => {
    expect(pitchMath.directedInterval(7 as any, 0 as any, "down")).toBe(-7);
  });
  it("same pitch up = 0", () => {
    expect(pitchMath.directedInterval(5 as any, 5 as any, "up")).toBe(0);
  });
});
