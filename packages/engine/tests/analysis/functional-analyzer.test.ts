import { describe, it, expect } from "vitest";
import { functionalAnalyzer } from "../../src/analysis/functional-analyzer.ts";
import { keyFactory } from "../../src/harmony/key.ts";
import { chordFactory } from "../../src/chords/chord-factory.ts";
import { pitchFactory } from "../../src/primitives/pitch.ts";
import { harmonizer } from "../../src/chords/harmonizer.ts";

const CMajor = keyFactory.major(0);

// C major natural scale: C4(60), D4(62), E4(64), F4(65), G4(67), A4(69), B4(71)
const C4 = pitchFactory.fromMidi(60);
const D4 = pitchFactory.fromMidi(62);
const E4 = pitchFactory.fromMidi(64);
const F4 = pitchFactory.fromMidi(65);
const G4 = pitchFactory.fromMidi(67);
const A4 = pitchFactory.fromMidi(69);
const B4 = pitchFactory.fromMidi(71);
const Bb3 = pitchFactory.fromMidi(58); // Bb — bVII of C major

describe("FunctionalAnalyzer.analyze()", () => {
  it("C major in C major → tonic function", () => {
    const c = chordFactory.triad(C4, "major");
    const result = functionalAnalyzer.analyze(c, CMajor);
    expect(result.function).toBe("tonic");
    expect(result.isBorrowed).toBe(false);
  });

  it("E minor in C major → tonic function (tonic-substitute)", () => {
    const em = chordFactory.triad(E4, "minor");
    const result = functionalAnalyzer.analyze(em, CMajor);
    expect(result.function).toBe("tonic");
    expect(result.role).toBe("tonic-substitute");
  });

  it("A minor in C major → tonic function (tonic-substitute)", () => {
    const am = chordFactory.triad(A4, "minor");
    const result = functionalAnalyzer.analyze(am, CMajor);
    expect(result.function).toBe("tonic");
    expect(result.role).toBe("tonic-substitute");
  });

  it("F major in C major → predominant function", () => {
    const fmaj = chordFactory.triad(F4, "major");
    const result = functionalAnalyzer.analyze(fmaj, CMajor);
    expect(result.function).toBe("predominant");
    expect(result.isBorrowed).toBe(false);
  });

  it("D minor in C major → predominant function", () => {
    const dm = chordFactory.triad(D4, "minor");
    const result = functionalAnalyzer.analyze(dm, CMajor);
    expect(result.function).toBe("predominant");
    expect(result.isBorrowed).toBe(false);
  });

  it("G major in C major → dominant function", () => {
    const gmaj = chordFactory.triad(G4, "major");
    const result = functionalAnalyzer.analyze(gmaj, CMajor);
    expect(result.function).toBe("dominant");
    expect(result.isBorrowed).toBe(false);
  });

  it("G7 in C major → dominant function", () => {
    const g7 = chordFactory.seventh(G4, "dominant7");
    const result = functionalAnalyzer.analyze(g7, CMajor);
    expect(result.function).toBe("dominant");
    expect(result.isBorrowed).toBe(false);
  });

  it("B diminished in C major → dominant function (leading-tone role)", () => {
    const bdim = chordFactory.triad(B4, "diminished");
    const result = functionalAnalyzer.analyze(bdim, CMajor);
    expect(result.function).toBe("dominant");
    expect(result.role).toBe("leading-tone");
  });

  it("bVII in C major → ambiguous (borrowed from C minor), isBorrowed: true", () => {
    const bVII = chordFactory.triad(Bb3, "major"); // Bb major = bVII in C major
    const result = functionalAnalyzer.analyze(bVII, CMajor);
    expect(result.isBorrowed).toBe(true);
  });

  it("iv in C major → isBorrowed: true", () => {
    const fMin = chordFactory.triad(F4, "minor"); // F minor = iv (borrowed from C minor)
    const result = functionalAnalyzer.analyze(fMin, CMajor);
    expect(result.isBorrowed).toBe(true);
    expect(result.function).toBe("predominant");
  });

  it("isBorrowed: false for all diatonic chords in C major", () => {
    const degrees = harmonizer.harmonize(CMajor.naturalScale, "triad");
    for (const deg of degrees) {
      const result = functionalAnalyzer.analyze(deg.chord, CMajor);
      expect(result.isBorrowed).toBe(false);
    }
  });

  it("augmented chord on diatonic root, unmatched in parallel → returns main-key function, not borrowed", () => {
    // C augmented: root C is in C major (degree 1), but 'augmented' quality doesn't match
    // either C major degree-1 family ('major') or C minor degree-1 family ('minor')
    // → falls through to line 104: returns main-key function without borrowed flag
    const cAug = chordFactory.triad(C4, "augmented");
    const result = functionalAnalyzer.analyze(cAug, CMajor);
    expect(result.isBorrowed).toBe(false);
    expect(result.function).toBeDefined();
  });

  it("chord with root outside both main and parallel keys → ambiguous, not borrowed", () => {
    // C# (PC 1) is not in C major (0,2,4,5,7,9,11) nor in C minor (0,2,3,5,7,8,10)
    const cSharp4 = pitchFactory.fromMidi(61);
    const cSharpMaj = chordFactory.triad(cSharp4, "major");
    const result = functionalAnalyzer.analyze(cSharpMaj, CMajor);
    expect(result.function).toBe("ambiguous");
    expect(result.isBorrowed).toBe(false);
  });
});
