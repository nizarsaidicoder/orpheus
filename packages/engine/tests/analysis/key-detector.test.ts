import { describe, it, expect } from "vitest";
import { keyDetector } from "../../src/analysis/key-detector.ts";
import { pitchFactory } from "../../src/primitives/pitch.ts";

// C major scale pitches: C D E F G A B
const C_MAJOR_PITCHES = [60, 62, 64, 65, 67, 69, 71].map(m => pitchFactory.fromMidi(m));
// A natural minor pitches: A B C D E F G
const A_MINOR_PITCHES = [57, 59, 60, 62, 64, 65, 67].map(m => pitchFactory.fromMidi(m));
// Chromatic: all 12 pitch classes (ambiguous)
const CHROMATIC_PITCHES = Array.from({ length: 12 }, (_, i) => pitchFactory.fromMidi(60 + i));

describe("keyDetector.detect()", () => {
  it("returns empty array for empty input", () => {
    expect(keyDetector.detect([])).toEqual([]);
  });

  it("returns 24 results for non-empty input (all major + minor keys)", () => {
    const results = keyDetector.detect(C_MAJOR_PITCHES);
    expect(results).toHaveLength(24);
  });

  it("C major pitches → C major ranked first with highest confidence", () => {
    const results = keyDetector.detect(C_MAJOR_PITCHES);
    const top = results[0]!;
    expect(top.key.modality).toBe("major");
    expect(top.key.tonic.pitchClass).toBe(0); // C
    expect(top.confidence).toBeCloseTo(1, 1);
  });

  it("A minor pitches → A minor or C major ranked first (relative keys share pitch classes)", () => {
    const results = keyDetector.detect(A_MINOR_PITCHES);
    const top = results[0]!;
    // A minor and C major are relative keys — either may rank first via KS profiles
    const isAMinor = top.key.modality === "minor" && top.key.tonic.pitchClass === 9;
    const isCMajor = top.key.modality === "major" && top.key.tonic.pitchClass === 0;
    expect(isAMinor || isCMajor).toBe(true);
  });

  it("results are sorted descending by confidence", () => {
    const results = keyDetector.detect(C_MAJOR_PITCHES);
    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i]!.confidence).toBeGreaterThanOrEqual(results[i + 1]!.confidence);
    }
  });

  it("all confidence values are in [0, 1]", () => {
    const results = keyDetector.detect(C_MAJOR_PITCHES);
    for (const r of results) {
      expect(r.confidence).toBeGreaterThanOrEqual(0);
      expect(r.confidence).toBeLessThanOrEqual(1);
    }
  });

  it("chromatic input → low max confidence (ambiguous)", () => {
    const results = keyDetector.detect(CHROMATIC_PITCHES);
    expect(results[0]!.confidence).toBeLessThan(0.5);
  });

  it("single pitch → returns 24 results with top confidence = 1", () => {
    const results = keyDetector.detect([pitchFactory.fromMidi(60)]);
    expect(results).toHaveLength(24);
    expect(results[0]!.confidence).toBe(1);
  });
});

describe("keyDetector.bestGuess()", () => {
  it("returns undefined for empty input", () => {
    expect(keyDetector.bestGuess([])).toBeUndefined();
  });

  it("C major pitches → best guess is C major", () => {
    const result = keyDetector.bestGuess(C_MAJOR_PITCHES);
    expect(result).toBeDefined();
    expect(result!.key.modality).toBe("major");
    expect(result!.key.tonic.pitchClass).toBe(0);
  });

  it("best guess matches first element of detect() by value", () => {
    const all = keyDetector.detect(C_MAJOR_PITCHES);
    const best = keyDetector.bestGuess(C_MAJOR_PITCHES);
    expect(best!.key.tonic.pitchClass).toBe(all[0]!.key.tonic.pitchClass);
    expect(best!.key.modality).toBe(all[0]!.key.modality);
  });
});
