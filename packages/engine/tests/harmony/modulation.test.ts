import { describe, it, expect } from "vitest";
import { modulationFinder } from "../../src/harmony/modulation.ts";
import { keyFactory } from "../../src/harmony/key.ts";

const CMajor  = keyFactory.major(0);
const GMajor  = keyFactory.major(1);
const FMajor  = keyFactory.major(-1);
const FSharpMajor = keyFactory.major(6);
const AMinor  = keyFactory.minor(0);

describe("ModulationFinder.findPath()", () => {
  it("C major to G major: 1 step, pivot-chord mechanism", () => {
    const path = modulationFinder.findPath(CMajor, GMajor);
    expect(path.steps).toHaveLength(1);
    expect(path.steps[0]!.mechanism).toBe("pivot-chord");
  });

  it("C major to F major: 1 step, pivot-chord mechanism", () => {
    const path = modulationFinder.findPath(CMajor, FMajor);
    expect(path.steps).toHaveLength(1);
    expect(path.steps[0]!.mechanism).toBe("pivot-chord");
  });

  it("C major to F# major: uses direct modulation (no pivot chords)", () => {
    const path = modulationFinder.findPath(CMajor, FSharpMajor);
    expect(path.steps).toHaveLength(1);
    expect(path.steps[0]!.mechanism).toBe("direct");
  });

  it("same key → 0 steps, cost 0", () => {
    const path = modulationFinder.findPath(CMajor, CMajor);
    expect(path.steps).toHaveLength(0);
    expect(path.cost).toBe(0);
  });

  it("path.from and path.to are correct keys", () => {
    const path = modulationFinder.findPath(CMajor, GMajor);
    expect(path.from.tonic.pitchClass).toBe(0);
    expect(path.to.tonic.pitchClass).toBe(7);
  });
});

describe("ModulationFinder.pivotChords()", () => {
  it("C major to G major share 4 diatonic triads", () => {
    const pivots = modulationFinder.pivotChords(CMajor, GMajor);
    expect(pivots).toHaveLength(4); // C, Em, G, Am
  });

  it("C major to A minor share all 7 diatonic triads (relative keys)", () => {
    const pivots = modulationFinder.pivotChords(CMajor, AMinor);
    expect(pivots).toHaveLength(7);
  });

  it("C major to F# major: no pivot chords (tritone-related keys)", () => {
    const pivots = modulationFinder.pivotChords(CMajor, FSharpMajor);
    expect(pivots).toHaveLength(0);
  });

  it("pivot chords are diatonic in both keys", () => {
    const pivots = modulationFinder.pivotChords(CMajor, GMajor);
    // All pivot chords must have a root PC present in G major scale (PCs: 7,9,11,0,2,4,6)
    const gMajorPCs = new Set([0, 2, 4, 6, 7, 9, 11]);
    for (const chord of pivots) {
      expect(gMajorPCs.has(chord.root.pitchClass)).toBe(true);
    }
  });
});

describe("ModulationFinder.findAllPaths()", () => {
  it("returns paths sorted by cost ascending", () => {
    const paths = modulationFinder.findAllPaths(CMajor, FSharpMajor);
    for (let i = 1; i < paths.length; i++) {
      expect(paths[i]!.cost).toBeGreaterThanOrEqual(paths[i - 1]!.cost);
    }
  });

  it("at least one path is returned even for distant keys", () => {
    const paths = modulationFinder.findAllPaths(CMajor, FSharpMajor, 3);
    expect(paths.length).toBeGreaterThanOrEqual(1);
  });
});
