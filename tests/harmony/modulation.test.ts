import { describe, it, expect } from "vitest";

describe("ModulationFinder.findPath()", () => {
  it("C major to G major: 1 step, pivot-chord mechanism", () => {});
  it("C major to F major: 1 step, pivot-chord mechanism", () => {});
  it("C major to F# major: multiple steps (distant key)", () => {});
  it("same key → 0 steps, cost 0", () => {});
  it("path.from and path.to are correct keys", () => {});
});

describe("ModulationFinder.pivotChords()", () => {
  it("C major to G major share 5 diatonic triads", () => {});
  it("C major to A minor share pivot chords", () => {});
  it("C major to F# major: empty or very few pivot chords", () => {});
  it("pivot chords are diatonic in both keys", () => {});
});

describe("ModulationFinder.findAllPaths()", () => {
  it("returns paths sorted by cost ascending", () => {});
  it("number of paths ≤ maxSteps constraint", () => {});
});
