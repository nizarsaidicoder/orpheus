import { describe, it, expect } from "vitest";
import { inversionAnalyzer } from "../../src/chords/inversion.js";
import { chordFactory } from "../../src/chords/chord-factory.js";
import { pitchFactory } from "../../src/primitives/pitch.js";

const C4 = pitchFactory.fromMidi(60);
const G4 = pitchFactory.fromMidi(67);

const cMajor     = chordFactory.triad(C4, "major");      // [C4, E4, G4]
const cMajorInv1 = chordFactory.invert(cMajor, "first");  // [E4, G4, C5]
const cMajorInv2 = chordFactory.invert(cMajor, "second"); // [G4, C5, E5]
const g7         = chordFactory.seventh(G4, "dominant7"); // [G4, B4, D5, F5]
const g7Inv3     = chordFactory.invert(g7, "third");      // [F5, G5, B5, D6]

describe("InversionAnalyzer.analyze()", () => {
  it("root position → 'root'", () => {
    expect(inversionAnalyzer.analyze(cMajor)).toBe("root");
  });

  it("first inversion → 'first'", () => {
    expect(inversionAnalyzer.analyze(cMajorInv1)).toBe("first");
  });

  it("second inversion → 'second'", () => {
    expect(inversionAnalyzer.analyze(cMajorInv2)).toBe("second");
  });

  it("third inversion → 'third'", () => {
    expect(inversionAnalyzer.analyze(g7Inv3)).toBe("third");
  });

  it("slash chord with non-chord-tone bass → undefined", () => {
    const A3 = pitchFactory.fromMidi(57); // A is not in C major triad
    const cOverA = chordFactory.slash(cMajor, A3);
    expect(inversionAnalyzer.analyze(cOverA)).toBeUndefined();
  });

  it("slash chord with chord-tone bass → recognized inversion", () => {
    const E4 = pitchFactory.fromMidi(64);
    const cOverE = chordFactory.slash(cMajor, E4);
    expect(inversionAnalyzer.analyze(cOverE)).toBe("first");
  });
});

describe("InversionAnalyzer.bassIndex()", () => {
  it("root position → 0", () => {
    expect(inversionAnalyzer.bassIndex(cMajor)).toBe(0);
  });

  it("first inversion → 1", () => {
    expect(inversionAnalyzer.bassIndex(cMajorInv1)).toBe(1);
  });

  it("second inversion → 2", () => {
    expect(inversionAnalyzer.bassIndex(cMajorInv2)).toBe(2);
  });

  it("third inversion → 3", () => {
    expect(inversionAnalyzer.bassIndex(g7Inv3)).toBe(3);
  });
});

describe("InversionAnalyzer.isRootPosition()", () => {
  it("root position chord → true", () => {
    expect(inversionAnalyzer.isRootPosition(cMajor)).toBe(true);
  });

  it("first inversion → false", () => {
    expect(inversionAnalyzer.isRootPosition(cMajorInv1)).toBe(false);
  });

  it("second inversion → false", () => {
    expect(inversionAnalyzer.isRootPosition(cMajorInv2)).toBe(false);
  });

  it("third inversion → false", () => {
    expect(inversionAnalyzer.isRootPosition(g7Inv3)).toBe(false);
  });
});
