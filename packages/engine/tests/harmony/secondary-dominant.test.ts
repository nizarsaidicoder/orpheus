import { describe, it, expect } from "vitest";
import { secondaryDominantAnalyzer } from "../../src/harmony/secondary-dominant.ts";
import { keyFactory } from "../../src/harmony/key.ts";
import { chordFactory } from "../../src/chords/chord-factory.ts";
import { pitchFactory } from "../../src/primitives/pitch.ts";

const CMajor = keyFactory.major(0); // C major

describe("secondaryDominantAnalyzer.allIn()", () => {
  it("returns 5 secondary dominants for C major (II III IV V VI targets)", () => {
    const all = secondaryDominantAnalyzer.allIn(CMajor);
    expect(all).toHaveLength(5);
  });

  it("all results have dominant7 quality", () => {
    const all = secondaryDominantAnalyzer.allIn(CMajor);
    for (const sd of all) {
      expect(sd.chord.quality.kind).toBe("dominant7");
    }
  });

  it("V/V in C major = D7 (root PC 2)", () => {
    const all = secondaryDominantAnalyzer.allIn(CMajor);
    const vOfV = all.find(sd => sd.tonicizes === "V");
    expect(vOfV).toBeDefined();
    expect(vOfV!.chord.root.pitchClass).toBe(2); // D
    expect(vOfV!.label).toBe("V7/V");
  });

  it("V/ii in C major = A7 (root PC 9)", () => {
    const all = secondaryDominantAnalyzer.allIn(CMajor);
    const vOfii = all.find(sd => sd.tonicizes === "II");
    expect(vOfii).toBeDefined();
    expect(vOfii!.chord.root.pitchClass).toBe(9); // A
    expect(vOfii!.label).toBe("V7/ii");
  });

  it("each secondary dominant has a resolvesTo chord", () => {
    const all = secondaryDominantAnalyzer.allIn(CMajor);
    for (const sd of all) {
      expect(sd.resolvesTo).toBeDefined();
      expect(sd.resolvesTo.pitches).toHaveLength(3); // triad
    }
  });
});

describe("secondaryDominantAnalyzer.of()", () => {
  it("of('V', CMajor) → D7", () => {
    const sd = secondaryDominantAnalyzer.of("V", CMajor);
    expect(sd).toBeDefined();
    expect(sd!.chord.root.pitchClass).toBe(2);
    expect(sd!.tonicizes).toBe("V");
  });

  it("of('IV', CMajor) → C7 (V/IV)", () => {
    const sd = secondaryDominantAnalyzer.of("IV", CMajor);
    expect(sd).toBeDefined();
    expect(sd!.chord.root.pitchClass).toBe(0); // C
    expect(sd!.label).toBe("V7/IV");
  });

  it("of('I', CMajor) → undefined (I is not a valid tonicization target)", () => {
    expect(secondaryDominantAnalyzer.of("I", CMajor)).toBeUndefined();
  });

  it("of('VII', CMajor) → undefined (VII is not a valid tonicization target)", () => {
    expect(secondaryDominantAnalyzer.of("VII", CMajor)).toBeUndefined();
  });
});

describe("secondaryDominantAnalyzer.identify()", () => {
  it("identifies A7 in C major as V7/ii", () => {
    const A4 = pitchFactory.fromMidi(69);
    const a7 = chordFactory.seventh(A4, "dominant7");
    const sd = secondaryDominantAnalyzer.identify(a7, CMajor);
    expect(sd).toBeDefined();
    expect(sd!.tonicizes).toBe("II");
    expect(sd!.label).toBe("V7/ii");
  });

  it("identifies D7 in C major as V7/V", () => {
    const D4 = pitchFactory.fromMidi(62);
    const d7 = chordFactory.seventh(D4, "dominant7");
    const sd = secondaryDominantAnalyzer.identify(d7, CMajor);
    expect(sd).toBeDefined();
    expect(sd!.tonicizes).toBe("V");
  });

  it("returns undefined for non-dominant7 chord", () => {
    const C4 = pitchFactory.fromMidi(60);
    const cMaj = chordFactory.triad(C4, "major");
    expect(secondaryDominantAnalyzer.identify(cMaj, CMajor)).toBeUndefined();
  });

  it("returns undefined for dominant7 that resolves outside scale degrees II-VI", () => {
    // B7 → resolves to E (PC 4 = III of C major) — E is in VALID_TARGETS (III)
    // F7 → resolves to Bb (PC 10) — not a scale degree of C major
    const F4 = pitchFactory.fromMidi(65);
    const f7 = chordFactory.seventh(F4, "dominant7");
    expect(secondaryDominantAnalyzer.identify(f7, CMajor)).toBeUndefined();
  });
});
