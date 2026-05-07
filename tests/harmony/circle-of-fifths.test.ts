import { describe, it, expect } from "vitest";

describe("CircleOfFifths structure", () => {
  it("majorKeys contains exactly 12 nodes", () => {});
  it("minorKeys contains exactly 12 nodes", () => {});
  it("C major dominantNeighbor is G major", () => {});
  it("C major subdominantNeighbor is F major", () => {});
  it("G major dominantNeighbor is D major", () => {});
  it("relativeKey of C major node is A minor", () => {});
  it("relativeKey of A minor node is C major", () => {});
  it("fifthsFromC of C major = 0", () => {});
  it("fifthsFromC of G major = 1", () => {});
  it("fifthsFromC of F major = -1", () => {});
  it("fifthsFromC of F# major = 6", () => {});
});

describe("CircleOfFifths.distance()", () => {
  it("distance(C, G) = 1", () => {});
  it("distance(C, F) = 1", () => {});
  it("distance(C, F#) = 6 (maximum)", () => {});
  it("distance(C, C) = 0", () => {});
  it("is symmetric: distance(a, b) === distance(b, a)", () => {});
});

describe("CircleOfFifths.pathBetween()", () => {
  it("C to G returns [C, G]", () => {});
  it("C to D returns [C, G, D]", () => {});
  it("path length = distance + 1", () => {});
  it("first node in path is 'from' key", () => {});
  it("last node in path is 'to' key", () => {});
});
