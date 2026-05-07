import { describe, it, expect } from "vitest";
import { chordAnalyzer } from "../../src/analysis/chord-analyzer.js";
import { pitchFactory } from "../../src/primitives/pitch.js";

const C4 = pitchFactory.fromMidi(60);
const D4 = pitchFactory.fromMidi(62);
const E4 = pitchFactory.fromMidi(64);
const F4 = pitchFactory.fromMidi(65);
const G4 = pitchFactory.fromMidi(67);
const B4 = pitchFactory.fromMidi(71);
const F5 = pitchFactory.fromMidi(77);

describe("ChordAnalyzer.analyze()", () => {
  it("{C, E, G} → C major at confidence 1.0", () => {
    const results = chordAnalyzer.analyze([C4, E4, G4]);
    expect(results.length).toBeGreaterThan(0);
    const best = results[0]!;
    expect(best.chord.root.pitchClass).toBe(0); // C
    expect(best.chord.quality.kind).toBe("major");
    expect(best.confidence).toBeCloseTo(1.0);
  });

  it("{G, B, D, F} → G dominant 7th at confidence 1.0", () => {
    const D5 = pitchFactory.fromMidi(74);
    const results = chordAnalyzer.analyze([G4, B4, D5, F5]);
    expect(results.length).toBeGreaterThan(0);
    const best = results[0]!;
    expect(best.chord.root.pitchClass).toBe(7); // G
    expect(best.chord.quality.kind).toBe("dominant7");
    expect(best.confidence).toBeCloseTo(1.0);
  });

  it("{C, E} → C major as best guess (incomplete chord)", () => {
    const results = chordAnalyzer.analyze([C4, E4]);
    expect(results.length).toBeGreaterThan(0);
    const best = results[0]!;
    expect(best.chord.root.pitchClass).toBe(0); // C
    expect(best.chord.quality.kind).toBe("major");
    expect(best.confidence).toBeLessThan(1.0);
  });

  it("returns results ranked by confidence descending", () => {
    const results = chordAnalyzer.analyze([C4, E4, G4]);
    for (let i = 1; i < results.length; i++) {
      expect(results[i]!.confidence).toBeLessThanOrEqual(results[i - 1]!.confidence);
    }
  });

  it("empty pitch set → empty array", () => {
    expect(chordAnalyzer.analyze([])).toEqual([]);
  });

  it("single pitch → empty or very low confidence", () => {
    const results = chordAnalyzer.analyze([C4]);
    // All results should have low confidence (< 0.5) for a single pitch
    for (const r of results) {
      expect(r.confidence).toBeLessThan(0.5);
    }
  });

  it("identifies first inversion: {E, G, C} → C major, first inversion", () => {
    const C5 = pitchFactory.fromMidi(72);
    const results = chordAnalyzer.analyze([E4, G4, C5]);
    expect(results.length).toBeGreaterThan(0);
    const best = results[0]!;
    expect(best.chord.root.pitchClass).toBe(0); // C
    expect(best.chord.quality.kind).toBe("major");
    expect(best.chord.inversion).toBe("first");
  });
});

describe("ChordAnalyzer.bestFit()", () => {
  it("returns the top interpretation for a complete chord", () => {
    const best = chordAnalyzer.bestFit([C4, E4, G4]);
    expect(best).toBeDefined();
    expect(best!.chord.root.pitchClass).toBe(0);
    expect(best!.chord.quality.kind).toBe("major");
  });

  it("returns undefined for empty pitch set", () => {
    expect(chordAnalyzer.bestFit([])).toBeUndefined();
  });

  it("confidence is highest of all analyze() results", () => {
    const all = chordAnalyzer.analyze([C4, E4, G4]);
    const best = chordAnalyzer.bestFit([C4, E4, G4]);
    expect(best).toBeDefined();
    for (const r of all) {
      expect(best!.confidence).toBeGreaterThanOrEqual(r.confidence);
    }
  });
});
