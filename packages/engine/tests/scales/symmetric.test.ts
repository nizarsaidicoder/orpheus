import { describe, it, expect } from "vitest";
import {
  WHOLE_TONE_PATTERN, DIMINISHED_HW_PATTERN, DIMINISHED_WH_PATTERN, AUGMENTED_PATTERN,
} from "../../src/scales/symmetric.ts";

describe("Whole-tone scale", () => {
  it("has exactly 6 pitch classes", () => {
    expect(WHOLE_TONE_PATTERN.intervals).toHaveLength(6);
  });

  it("all intervals are 2 semitones (whole steps)", () => {
    const steps = WHOLE_TONE_PATTERN.intervals.slice(1).map((v, i) =>
      v - (WHOLE_TONE_PATTERN.intervals[i] ?? 0)
    );
    expect(steps.every((s) => s === 2)).toBe(true);
  });

  it("category is 'symmetric'", () => {
    expect(WHOLE_TONE_PATTERN.category).toBe("symmetric");
  });
});

describe("Diminished (half-whole) scale", () => {
  it("has exactly 8 pitch classes", () => {
    expect(DIMINISHED_HW_PATTERN.intervals).toHaveLength(8);
  });

  it("alternates H-W: [0, 1, 3, 4, 6, 7, 9, 10]", () => {
    expect(DIMINISHED_HW_PATTERN.intervals).toEqual([0, 1, 3, 4, 6, 7, 9, 10]);
  });
});

describe("Diminished (whole-half) scale", () => {
  it("has exactly 8 pitch classes", () => {
    expect(DIMINISHED_WH_PATTERN.intervals).toHaveLength(8);
  });

  it("alternates W-H: [0, 2, 3, 5, 6, 8, 9, 11]", () => {
    expect(DIMINISHED_WH_PATTERN.intervals).toEqual([0, 2, 3, 5, 6, 8, 9, 11]);
  });
});

describe("Augmented scale", () => {
  it("has exactly 6 pitch classes", () => {
    expect(AUGMENTED_PATTERN.intervals).toHaveLength(6);
  });

  it("alternates m3-H: [0, 3, 4, 7, 8, 11]", () => {
    expect(AUGMENTED_PATTERN.intervals).toEqual([0, 3, 4, 7, 8, 11]);
  });
});
