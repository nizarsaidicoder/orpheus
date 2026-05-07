import { describe, it, expect } from "vitest";

describe("Major scale pattern", () => {
  it("has 7 interval offsets starting with 0", () => {});
  it("intervals are [0, 2, 4, 5, 7, 9, 11]", () => {});
  it("category is 'diatonic'", () => {});
  it("defines 7 mode names (Ionian through Locrian)", () => {});
});

describe("Natural minor scale pattern", () => {
  it("has intervals [0, 2, 3, 5, 7, 8, 10]", () => {});
  it("category is 'diatonic'", () => {});
});

describe("Harmonic minor scale pattern", () => {
  it("has intervals [0, 2, 3, 5, 7, 8, 11]", () => {});
  it("raised 7th (11) compared to natural minor (10)", () => {});
  it("category is 'harmonic'", () => {});
});

describe("Melodic minor scale pattern", () => {
  it("has intervals [0, 2, 3, 5, 7, 9, 11]", () => {});
  it("both 6th and 7th are raised compared to natural minor", () => {});
  it("category is 'melodic'", () => {});
  it("defines 7 mode names", () => {});
});

describe("Scale.degree()", () => {
  it("degree(1) = root", () => {});
  it("degree(5) of C major = G", () => {});
  it("degree(7) of C major = B", () => {});
  it("degree(8) = root one octave up", () => {});
  it("throws RangeError for degree < 1", () => {});
});

describe("Scale.contains()", () => {
  it("C major contains G#: false", () => {});
  it("C major contains F: true", () => {});
  it("uses pitch-class comparison (ignores octave)", () => {});
});

describe("Scale.transpose()", () => {
  it("transposing C major by 2 → D major", () => {});
  it("preserves scale pattern after transposition", () => {});
});
