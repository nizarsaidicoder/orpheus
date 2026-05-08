import { describe, it, expect } from "vitest";
import { romanNumeralAnalyzer } from "../../src/harmony/roman-numeral.ts";
import { keyFactory } from "../../src/harmony/key.ts";
import { chordFactory } from "../../src/chords/chord-factory.ts";
import { pitchFactory } from "../../src/primitives/pitch.ts";

const CMajor = keyFactory.major(0);
const GMajor = keyFactory.major(1);

// Pitches in C major natural scale (tonic C4=60)
const G4 = pitchFactory.fromMidi(67);
const F4 = pitchFactory.fromMidi(65);
const A4 = pitchFactory.fromMidi(69);
const B4 = pitchFactory.fromMidi(71);

describe("RomanNumeralAnalyzer.parse()", () => {
  it("parses 'I' → degree I, major, no modifiers", () => {
    const t = romanNumeralAnalyzer.parse("I");
    expect(t.degree).toBe("I");
    expect(t.isUpperCase).toBe(true);
    expect(t.quality).toBe("major");
    expect(t.modifiers).toEqual([]);
  });

  it("parses 'ii' → degree II, minor (isUpperCase: false)", () => {
    const t = romanNumeralAnalyzer.parse("ii");
    expect(t.degree).toBe("II");
    expect(t.isUpperCase).toBe(false);
    expect(t.quality).toBe("minor");
  });

  it("parses 'V7' → degree V, dominant7", () => {
    const t = romanNumeralAnalyzer.parse("V7");
    expect(t.degree).toBe("V");
    expect(t.isUpperCase).toBe(true);
    expect(t.quality).toBe("dominant7");
    expect(t.modifiers).toEqual([]);
  });

  it("parses 'viiø7' → degree VII, half-diminished7", () => {
    const t = romanNumeralAnalyzer.parse("viiø7");
    expect(t.degree).toBe("VII");
    expect(t.isUpperCase).toBe(false);
    expect(t.quality).toBe("half-diminished7");
  });

  it("parses 'V7/ii' → secondary V7 of degree II", () => {
    const t = romanNumeralAnalyzer.parse("V7/ii");
    expect(t.degree).toBe("V");
    expect(t.quality).toBe("dominant7");
    expect(t.modifiers).toContain("secondary");
    expect(t.secondaryOf).toBe("II");
  });

  it("parses 'bII' → Neapolitan modifier", () => {
    const t = romanNumeralAnalyzer.parse("bII");
    expect(t.degree).toBe("II");
    expect(t.modifiers).toContain("neapolitan");
  });

  it("throws SyntaxError for invalid notation", () => {
    expect(() => romanNumeralAnalyzer.parse("X")).toThrow(SyntaxError);
    expect(() => romanNumeralAnalyzer.parse("")).toThrow(SyntaxError);
  });

  it("unrecognized suffix falls back to major (uppercase) or minor (lowercase)", () => {
    // 'Ixxx' — uppercase I with unknown suffix 'xxx' → quality falls back to 'major'
    const t = romanNumeralAnalyzer.parse("Ixxx");
    expect(t.degree).toBe("I");
    expect(t.quality).toBe("major");
  });
});

describe("RomanNumeralAnalyzer.render()", () => {
  it("renders dominant7 as 'V7'", () => {
    const token = { degree: "V" as const, isUpperCase: true, quality: "dominant7", modifiers: [] as const };
    expect(romanNumeralAnalyzer.render(token)).toBe("V7");
  });

  it("renders secondary dominant V7/ii as 'V7/ii'", () => {
    const token = {
      degree: "V" as const,
      isUpperCase: true,
      quality: "dominant7",
      modifiers: ["secondary"] as const,
      secondaryOf: "II" as const,
    };
    expect(romanNumeralAnalyzer.render(token)).toBe("V7/ii");
  });

  it("round-trips: render(parse(s)) === s for standard notation", () => {
    for (const s of ["I", "ii", "V7", "IV", "vi", "V7/ii", "bII"]) {
      expect(romanNumeralAnalyzer.render(romanNumeralAnalyzer.parse(s))).toBe(s);
    }
  });
});

describe("RomanNumeralAnalyzer.analyze()", () => {
  it("G7 in C major → V7", () => {
    const g7 = chordFactory.seventh(G4, "dominant7");
    const token = romanNumeralAnalyzer.analyze(g7, CMajor);
    expect(token.degree).toBe("V");
    expect(token.quality).toBe("dominant7");
    expect(token.isUpperCase).toBe(true);
  });

  it("F major in C major → IV", () => {
    const fMaj = chordFactory.triad(F4, "major");
    const token = romanNumeralAnalyzer.analyze(fMaj, CMajor);
    expect(token.degree).toBe("IV");
    expect(token.isUpperCase).toBe(true);
  });

  it("A minor in C major → vi", () => {
    const aMin = chordFactory.triad(A4, "minor");
    const token = romanNumeralAnalyzer.analyze(aMin, CMajor);
    expect(token.degree).toBe("VI");
    expect(token.isUpperCase).toBe(false);
  });

  it("B half-diminished in C major → viiø7", () => {
    const bHalfDim = chordFactory.seventh(B4, "half-diminished7");
    const token = romanNumeralAnalyzer.analyze(bHalfDim, CMajor);
    expect(token.degree).toBe("VII");
    expect(token.isUpperCase).toBe(false);
    expect(token.quality).toBe("half-diminished7");
  });
});

describe("RomanNumeralAnalyzer.realize()", () => {
  it("V7 in C major → G7 chord", () => {
    const token = romanNumeralAnalyzer.parse("V7");
    const chord = romanNumeralAnalyzer.realize(token, CMajor);
    expect(chord.root.pitchClass).toBe(7); // G
    expect(chord.quality.kind).toBe("dominant7");
  });

  it("ii in G major → A minor chord", () => {
    const token = romanNumeralAnalyzer.parse("ii");
    const chord = romanNumeralAnalyzer.realize(token, GMajor);
    expect(chord.root.pitchClass).toBe(9); // A
    expect(chord.quality.kind).toBe("minor");
  });

  it("round-trips: analyze(realize(token, key), key) equals same degree", () => {
    const token = romanNumeralAnalyzer.parse("IV");
    const chord = romanNumeralAnalyzer.realize(token, CMajor);
    const back = romanNumeralAnalyzer.analyze(chord, CMajor);
    expect(back.degree).toBe("IV");
    expect(back.isUpperCase).toBe(true);
  });
});
