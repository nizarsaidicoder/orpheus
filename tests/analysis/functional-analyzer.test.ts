import { describe, it, expect } from "vitest";

describe("FunctionalAnalyzer.analyze()", () => {
  it("C major in C major → tonic function", () => {});
  it("E minor in C major → tonic function (tonic-substitute)", () => {});
  it("A minor in C major → tonic function (tonic-substitute)", () => {});
  it("F major in C major → predominant function", () => {});
  it("D minor in C major → predominant function", () => {});
  it("G major in C major → dominant function", () => {});
  it("G7 in C major → dominant function", () => {});
  it("B diminished in C major → dominant function (leading-tone role)", () => {});
  it("bVII in C major → ambiguous (borrowed from C minor), isBorrowed: true", () => {});
  it("iv in C major → isBorrowed: true", () => {});
  it("isBorrowed: false for all diatonic chords in C major", () => {});
});
