import { describe, it, expect } from "vitest";
import { pitchFactory, chordFactory } from "@orpheus/engine";
import { fretboardFactory } from "../src/fretboard/fretboard-factory.ts";
import { shapeFinder } from "../src/chord-shapes/shape-finder.ts";
import { STANDARD_TUNING } from "../src/tunings/standard-tunings.ts";

const fb = fretboardFactory.build(STANDARD_TUNING);
const C4 = pitchFactory.fromMidi(60);
const G2 = pitchFactory.fromMidi(43);
const E4 = pitchFactory.fromMidi(64);

describe("shapeFinder", () => {
  describe("find", () => {
    it("finds voicings for C major triad", () => {
      const cMaj = chordFactory.triad(C4, "major");
      const voicings = shapeFinder.find(cMaj, fb);
      expect(voicings.length).toBeGreaterThan(0);
    });

    it("all voicings cover the required pitch classes", () => {
      const cMaj = chordFactory.triad(C4, "major");
      const requiredPCs = new Set(cMaj.pitches.map(p => p.pitchClass as number));
      const voicings = shapeFinder.find(cMaj, fb);

      for (const voicing of voicings.slice(0, 10)) {
        const pcs = new Set(
          voicing.slots
            .filter((s): s is NonNullable<typeof s> => s !== null)
            .map(p => p.pitch.pitchClass as number),
        );
        for (const pc of requiredPCs) {
          expect(pcs.has(pc)).toBe(true);
        }
      }
    });

    it("voicings are sorted by score (easiest first)", () => {
      const gMaj = chordFactory.triad(G2, "major");
      const voicings = shapeFinder.findWithFingering(gMaj, fb);
      for (let i = 1; i < Math.min(voicings.length, 5); i++) {
        expect(voicings[i]!.difficulty).toBeGreaterThanOrEqual(voicings[i - 1]!.difficulty);
      }
    });

    it("respects maxFretSpan constraint", () => {
      const eMaj = chordFactory.triad(E4, "major");
      const voicings = shapeFinder.find(eMaj, fb, { maxFretSpan: 3 });
      for (const voicing of voicings) {
        const activeFrets = voicing.slots
          .filter((s): s is NonNullable<typeof s> => s !== null)
          .map(p => p.fret)
          .filter(f => f > 0);
        if (activeFrets.length >= 2) {
          const span = Math.max(...activeFrets) - Math.min(...activeFrets);
          expect(span).toBeLessThanOrEqual(3);
        }
      }
    });

    it("respects minStrings constraint", () => {
      const cMaj = chordFactory.triad(C4, "major");
      const voicings = shapeFinder.find(cMaj, fb, { minStrings: 4 });
      for (const voicing of voicings) {
        const playedCount = voicing.slots.filter(s => s !== null).length;
        expect(playedCount).toBeGreaterThanOrEqual(4);
      }
    });
  });

  describe("findWithFingering", () => {
    it("returns fingerings with difficulty scores", () => {
      const cMaj = chordFactory.triad(C4, "major");
      const fingerings = shapeFinder.findWithFingering(cMaj, fb);
      expect(fingerings.length).toBeGreaterThan(0);
      for (const f of fingerings.slice(0, 5)) {
        expect(f.difficulty).toBeGreaterThanOrEqual(0);
        expect(f.assignments.length).toBeGreaterThan(0);
      }
    });

    it("C major is easier than F major (barre)", () => {
      const cMaj = chordFactory.triad(C4, "major");
      const fMaj = chordFactory.triad(pitchFactory.fromMidi(53), "major");
      const cBest = shapeFinder.findWithFingering(cMaj, fb)[0];
      const fBest = shapeFinder.findWithFingering(fMaj, fb)[0];
      expect(cBest).toBeDefined();
      expect(fBest).toBeDefined();
      // C open shape should have lower difficulty than F barre
      expect(cBest!.difficulty).toBeLessThanOrEqual(fBest!.difficulty);
    });
  });
});
