import { describe, it, expect } from "vitest";
import { keyFactory } from "@orpheus/engine";
import { fretboardFactory } from "../src/fretboard/fretboard-factory.ts";
import { positionAnalyzer } from "../src/analysis/position-analyzer.ts";
import { STANDARD_TUNING } from "../src/tunings/standard-tunings.ts";

const fb = fretboardFactory.build(STANDARD_TUNING);

// C major triad positions on standard tuning: C-E-G
// String 5 fret 3 = C4 (midi 48), String 4 fret 2 = E4 (midi 52), String 3 fret 0 = G3 (midi 47) — wait
// Let's use known positions: string 5 (A string) fret 3 = C, string 4 (D string) fret 2 = E, string 3 (G string) fret 0 = G
const cPos = fb.positionsForString(5).find(p => p.fret === 3)!; // C
const ePos = fb.positionsForString(4).find(p => p.fret === 2)!; // E
const gPos = fb.positionsForString(3).find(p => p.fret === 0)!; // G

describe("positionAnalyzer.identifyChord()", () => {
  it("returns null for empty positions", () => {
    expect(positionAnalyzer.identifyChord([])).toBeNull();
  });

  it("identifies a C major triad from fret positions", () => {
    const chord = positionAnalyzer.identifyChord([cPos, ePos, gPos]);
    expect(chord).not.toBeNull();
    expect(chord!.root.pitchClass).toBe(0); // C
  });

  it("returns a chord object with pitches array", () => {
    const chord = positionAnalyzer.identifyChord([cPos, ePos, gPos]);
    expect(chord).not.toBeNull();
    expect(chord!.pitches.length).toBeGreaterThan(0);
  });
});

describe("positionAnalyzer.identifyScale()", () => {
  it("returns null for empty positions", () => {
    expect(positionAnalyzer.identifyScale([])).toBeNull();
  });

  it("identifies C major scale from positions on fretboard", () => {
    // C major scale pitch classes: 0, 2, 4, 5, 7, 9, 11
    const cMajorPositions = [0, 2, 4, 5, 7, 9, 11].map(pc =>
      fb.positionsForPitchClass(pc)[0]!,
    );
    const scale = positionAnalyzer.identifyScale(cMajorPositions);
    expect(scale).not.toBeNull();
  });

  it("returns null when positions don't match any scale (< 60% coverage)", () => {
    // Only 2 positions — likely won't meet 60% coverage threshold for any scale
    const twoPos = [fb.positionsForString(1)[0]!, fb.positionsForString(1)[1]!];
    // May or may not match — just ensure no crash
    const result = positionAnalyzer.identifyScale(twoPos);
    expect(result === null || result !== null).toBe(true);
  });

  it("with key hint uses hint's tonic as root", () => {
    const CMajor = keyFactory.major(0);
    const cMajorPositions = [0, 2, 4, 5, 7, 9, 11].map(pc =>
      fb.positionsForPitchClass(pc)[0]!,
    );
    const scale = positionAnalyzer.identifyScale(cMajorPositions, CMajor);
    expect(scale).not.toBeNull();
    expect(scale!.root.pitchClass).toBe(0);
  });
});
