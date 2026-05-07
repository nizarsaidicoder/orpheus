import { describe, it, expect } from "vitest";

describe("ChordAnalyzer.analyze()", () => {
  it("{C, E, G} → C major at confidence 1.0", () => { });
  it("{G, B, D, F} → G dominant 7th at confidence 1.0", () => { });
  it("{C, E} → C major as best guess (incomplete chord)", () => { });
  it("returns results ranked by confidence descending", () => { });
  it("empty pitch set → empty array", () => { });
  it("single pitch → empty or very low confidence", () => { });
  it("identifies first inversion: {E, G, C} → C major, first inversion", () => { });
});

describe("ChordAnalyzer.bestFit()", () => {
  it("returns the top interpretation for a complete chord", () => { });
  it("returns undefined for empty pitch set", () => { });
  it("confidence is highest of all analyze() results", () => { });
});
