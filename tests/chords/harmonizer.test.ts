import { describe, it, expect } from "vitest";

describe("Harmonizer.harmonize() — C major triads", () => {
  it("returns 7 harmonized degrees", () => {});
  it("degree 1 = C major (I)", () => {});
  it("degree 2 = D minor (ii)", () => {});
  it("degree 3 = E minor (iii)", () => {});
  it("degree 4 = F major (IV)", () => {});
  it("degree 5 = G major (V)", () => {});
  it("degree 6 = A minor (vi)", () => {});
  it("degree 7 = B diminished (viidim)", () => {});
  it("roman numeral labels are uppercase for major, lowercase for minor/dim", () => {});
});

describe("Harmonizer.harmonize() — C major sevenths", () => {
  it("degree 1 seventh = Cmaj7 (Imaj7)", () => {});
  it("degree 2 seventh = Dm7 (iim7)", () => {});
  it("degree 5 seventh = G7 (V7)", () => {});
  it("degree 7 seventh = Bø7 (viiø7, half-diminished)", () => {});
});

describe("Harmonizer.degreeChord()", () => {
  it("returns the correct chord for a single degree", () => {});
  it("throws RangeError for degree out of scale range", () => {});
});
