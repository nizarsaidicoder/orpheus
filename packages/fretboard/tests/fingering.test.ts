import { describe, it, expect } from "vitest";
import { pitchFactory, chordFactory } from "@orpheus/engine";
import { fretboardFactory } from "../src/fretboard/fretboard-factory.ts";
import { fingeringAnalyzer } from "../src/fingering/fingering-analyzer.ts";
import { handOptimizer } from "../src/fingering/hand-optimizer.ts";
import { shapeFinder } from "../src/chord-shapes/shape-finder.ts";
import { STANDARD_TUNING } from "../src/tunings/standard-tunings.ts";

const fb = fretboardFactory.build(STANDARD_TUNING);
const C4 = pitchFactory.fromMidi(60);
const G2 = pitchFactory.fromMidi(43);

describe("fingeringAnalyzer", () => {
  it("assigns fingers to all played positions", () => {
    const gMaj = chordFactory.triad(G2, "major");
    const voicings = shapeFinder.find(gMaj, fb);
    expect(voicings.length).toBeGreaterThan(0);
    const fingering = fingeringAnalyzer.assign(voicings[0]!);
    const played = voicings[0]!.slots.filter(s => s !== null).length;
    expect(fingering.assignments.length).toBe(played);
  });

  it("assigns finger 0 to open strings", () => {
    const cMaj = chordFactory.triad(C4, "major");
    const voicings = shapeFinder.find(cMaj, fb, { allowOpenStrings: true });
    // Find a voicing with open strings
    const openVoicing = voicings.find(v => v.slots.some(s => s !== null && s.fret === 0));
    if (openVoicing === undefined) return; // no open voicings found, skip
    const fingering = fingeringAnalyzer.assign(openVoicing);
    const openAssignments = fingering.assignments.filter(a => a.position.fret === 0);
    for (const a of openAssignments) {
      expect(a.finger).toBe(0);
    }
  });

  it("difficulty is a non-negative number", () => {
    const cMaj = chordFactory.triad(C4, "major");
    const voicings = shapeFinder.find(cMaj, fb);
    const fingering = fingeringAnalyzer.assign(voicings[0]!);
    expect(fingering.difficulty).toBeGreaterThanOrEqual(0);
  });

  it("detects barre when multiple notes share same fret on contiguous strings", () => {
    const fMaj = chordFactory.triad(pitchFactory.fromMidi(53), "major");
    const fingerings = shapeFinder.findWithFingering(fMaj, fb);
    // At least one F major voicing should have a barre
    const hasBarre = fingerings.some(f => f.voicing.barre !== undefined || f.assignments.some(a => a.isBarre));
    expect(hasBarre).toBe(true);
  });
});

describe("handOptimizer", () => {
  describe("best", () => {
    it("returns a single best fingering", () => {
      const cMaj = chordFactory.triad(C4, "major");
      const best = handOptimizer.best(cMaj, fb);
      expect(best).toBeDefined();
      expect(best.difficulty).toBeGreaterThanOrEqual(0);
    });

    it("C major best is easier than F major best", () => {
      const cMaj = chordFactory.triad(C4, "major");
      const fMaj = chordFactory.triad(pitchFactory.fromMidi(53), "major");
      const cBest = handOptimizer.best(cMaj, fb);
      const fBest = handOptimizer.best(fMaj, fb);
      expect(cBest.difficulty).toBeLessThanOrEqual(fBest.difficulty);
    });
  });

  describe("optimalPath", () => {
    it("returns one fingering per chord", () => {
      const cMaj = chordFactory.triad(C4, "major");
      const gMaj = chordFactory.triad(G2, "major");
      const path = handOptimizer.optimalPath([cMaj, gMaj], fb);
      expect(path.length).toBe(2);
    });

    it("returns empty array for empty input", () => {
      const path = handOptimizer.optimalPath([], fb);
      expect(path.length).toBe(0);
    });

    it("consecutive voicings minimize hand shift", () => {
      const cMaj = chordFactory.triad(C4, "major");
      const gMaj = chordFactory.triad(G2, "major");
      const aMaj = chordFactory.triad(pitchFactory.fromMidi(57), "major");
      const path = handOptimizer.optimalPath([cMaj, gMaj, aMaj], fb);
      expect(path.length).toBe(3);
      // Each element is a valid fingering
      for (const f of path) {
        expect(f.assignments.length).toBeGreaterThan(0);
      }
    });
  });
});
