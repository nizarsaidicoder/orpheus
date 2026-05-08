import { describe, it, expect } from "vitest";
import { harmonizer } from "../../src/chords/harmonizer.ts";
import { scaleFactory } from "../../src/scales/scale.ts";
import { MAJOR_PATTERN, HARMONIC_MINOR_PATTERN } from "../../src/scales/diatonic.ts";
import { pitchFactory } from "../../src/primitives/pitch.ts";

const C4 = pitchFactory.fromMidi(60);
const cMajor = scaleFactory.build(MAJOR_PATTERN, C4);

describe("Harmonizer.harmonize() — C major triads", () => {
  const degrees = harmonizer.harmonize(cMajor, "triad");

  it("returns 7 harmonized degrees", () => {
    expect(degrees).toHaveLength(7);
  });

  it("degree 1 = C major (I)", () => {
    expect(degrees[0]!.chord.quality.kind).toBe("major");
    expect(degrees[0]!.chord.root.midi).toBe(60);
    expect(degrees[0]!.romanNumeral).toBe("I");
  });

  it("degree 2 = D minor (ii)", () => {
    expect(degrees[1]!.chord.quality.kind).toBe("minor");
    expect(degrees[1]!.chord.root.midi).toBe(62);
    expect(degrees[1]!.romanNumeral).toBe("ii");
  });

  it("degree 3 = E minor (iii)", () => {
    expect(degrees[2]!.chord.quality.kind).toBe("minor");
    expect(degrees[2]!.chord.root.midi).toBe(64);
    expect(degrees[2]!.romanNumeral).toBe("iii");
  });

  it("degree 4 = F major (IV)", () => {
    expect(degrees[3]!.chord.quality.kind).toBe("major");
    expect(degrees[3]!.chord.root.midi).toBe(65);
    expect(degrees[3]!.romanNumeral).toBe("IV");
  });

  it("degree 5 = G major (V)", () => {
    expect(degrees[4]!.chord.quality.kind).toBe("major");
    expect(degrees[4]!.chord.root.midi).toBe(67);
    expect(degrees[4]!.romanNumeral).toBe("V");
  });

  it("degree 6 = A minor (vi)", () => {
    expect(degrees[5]!.chord.quality.kind).toBe("minor");
    expect(degrees[5]!.chord.root.midi).toBe(69);
    expect(degrees[5]!.romanNumeral).toBe("vi");
  });

  it("degree 7 = B diminished (viidim)", () => {
    expect(degrees[6]!.chord.quality.kind).toBe("diminished");
    expect(degrees[6]!.chord.root.midi).toBe(71);
    expect(degrees[6]!.romanNumeral).toBe("viidim");
  });

  it("roman numeral labels are uppercase for major, lowercase for minor/dim", () => {
    const majors = [0, 3, 4]; // I, IV, V
    const minors = [1, 2, 5]; // ii, iii, vi
    for (const idx of majors) {
      expect(degrees[idx]!.romanNumeral[0]).toBe(degrees[idx]!.romanNumeral[0]!.toUpperCase());
    }
    for (const idx of minors) {
      expect(degrees[idx]!.romanNumeral[0]).toBe(degrees[idx]!.romanNumeral[0]!.toLowerCase());
    }
  });
});

describe("Harmonizer.harmonize() — C major sevenths", () => {
  const degrees = harmonizer.harmonize(cMajor, "seventh");

  it("degree 1 seventh = Cmaj7 (Imaj7)", () => {
    expect(degrees[0]!.chord.quality.kind).toBe("major7");
    expect(degrees[0]!.romanNumeral).toBe("Imaj7");
  });

  it("degree 2 seventh = Dm7 (iim7)", () => {
    expect(degrees[1]!.chord.quality.kind).toBe("minor7");
    expect(degrees[1]!.romanNumeral).toBe("iim7");
  });

  it("degree 5 seventh = G7 (V7)", () => {
    expect(degrees[4]!.chord.quality.kind).toBe("dominant7");
    expect(degrees[4]!.romanNumeral).toBe("V7");
  });

  it("degree 7 seventh = Bø7 (viiø7, half-diminished)", () => {
    expect(degrees[6]!.chord.quality.kind).toBe("half-diminished7");
    expect(degrees[6]!.romanNumeral).toBe("viiø7");
  });
});

describe("Harmonizer.harmonize() — pitch content", () => {
  it("C major triad has pitches [C4, E4, G4]", () => {
    const d = harmonizer.harmonize(cMajor, "triad");
    expect(d[0]!.chord.pitches.map(p => p.midi)).toEqual([60, 64, 67]);
  });

  it("G dominant 7th has pitches [G4, B4, D5, F5]", () => {
    const d = harmonizer.harmonize(cMajor, "seventh");
    expect(d[4]!.chord.pitches.map(p => p.midi)).toEqual([67, 71, 74, 77]);
  });
});

describe("Harmonizer.degreeChord()", () => {
  it("returns the correct chord for a single degree", () => {
    const g = harmonizer.degreeChord(cMajor, 5, "triad");
    expect(g.root.midi).toBe(67);
    expect(g.quality.kind).toBe("major");
    expect(g.pitches.map(p => p.midi)).toEqual([67, 71, 74]);
  });

  it("throws RangeError for degree out of scale range", () => {
    expect(() => harmonizer.degreeChord(cMajor, 0)).toThrow(RangeError);
    expect(() => harmonizer.degreeChord(cMajor, 8)).toThrow(RangeError);
  });
});

describe("Harmonizer.harmonize() — scaleDegree field", () => {
  it("each entry has correct scaleDegree", () => {
    const degrees = harmonizer.harmonize(cMajor, "triad");
    degrees.forEach((d, i) => expect(d.scaleDegree).toBe(i + 1));
  });
});

describe("Harmonizer.harmonize() — enharmonic spelling", () => {
  it("C major triad is spelled C E G (not B# or Fb)", () => {
    const d = harmonizer.harmonize(cMajor, "triad");
    const names = d[0]!.chord.pitches.map(p => `${p.spelling.letter}:${p.spelling.accidental}`);
    expect(names).toEqual(["0:0", "2:0", "4:0"]); // C E G
  });

  it("D minor triad in C major is spelled D F A (not E# or G##)", () => {
    const d = harmonizer.harmonize(cMajor, "triad");
    const names = d[1]!.chord.pitches.map(p => `${p.spelling.letter}:${p.spelling.accidental}`);
    expect(names).toEqual(["1:0", "3:0", "5:0"]); // D F A
  });

  it("B diminished is spelled B D F (not Cb or E#)", () => {
    const d = harmonizer.harmonize(cMajor, "triad");
    const names = d[6]!.chord.pitches.map(p => `${p.spelling.letter}:${p.spelling.accidental}`);
    expect(names).toEqual(["6:0", "1:0", "3:0"]); // B D F
  });

  it("G dominant 7th in C major is spelled G B D F (F natural, not E#)", () => {
    const d = harmonizer.harmonize(cMajor, "seventh");
    const names = d[4]!.chord.pitches.map(p => `${p.spelling.letter}:${p.spelling.accidental}`);
    expect(names).toEqual(["4:0", "6:0", "1:0", "3:0"]); // G B D F
  });
});

describe("Harmonizer memoization", () => {
  it("repeated harmonize() calls return same array reference", () => {
    const a = harmonizer.harmonize(cMajor, "triad");
    const b = harmonizer.harmonize(cMajor, "triad");
    expect(a).toBe(b);
  });

  it("different extensions cached independently", () => {
    const triads   = harmonizer.harmonize(cMajor, "triad");
    const sevenths = harmonizer.harmonize(cMajor, "seventh");
    expect(triads).not.toBe(sevenths);
    expect(harmonizer.harmonize(cMajor, "seventh")).toBe(sevenths);
  });

  it("different scale instances produce independent caches", () => {
    const dMajor = scaleFactory.build(MAJOR_PATTERN, pitchFactory.fromMidi(62));
    const cResult = harmonizer.harmonize(cMajor, "triad");
    const dResult = harmonizer.harmonize(dMajor, "triad");
    expect(cResult).not.toBe(dResult);
    expect(cResult[0]!.chord.root.midi).toBe(60);
    expect(dResult[0]!.chord.root.midi).toBe(62);
  });

  it("degreeChord() result matches harmonize() chord at same degree", () => {
    const d5 = harmonizer.degreeChord(cMajor, 5, "triad");
    const all = harmonizer.harmonize(cMajor, "triad");
    expect(d5).toBe(all[4]!.chord);
  });
});

describe("Harmonizer.harmonize() — ninth extension (roman numeral coverage)", () => {
  const degrees = harmonizer.harmonize(cMajor, "ninth");

  it("degree 1 ninth = Cmaj9 (Imaj9)", () => {
    expect(degrees[0]!.chord.quality.kind).toBe("major9");
    expect(degrees[0]!.romanNumeral).toBe("Imaj9");
  });

  it("degree 5 ninth = G9 (V9, dominant9)", () => {
    expect(degrees[4]!.chord.quality.kind).toBe("dominant9");
    expect(degrees[4]!.romanNumeral).toBe("V9");
  });

  it("degree 2 ninth = Dm9 (iim9)", () => {
    expect(degrees[1]!.chord.quality.kind).toBe("minor9");
    expect(degrees[1]!.romanNumeral).toBe("iim9");
  });

  it("degree 7 ninth = B unknown-signature (falls back to major, uses default roman)", () => {
    // B + diatonic stack: intervals 3,6,10,13 — not in SIGNATURE_QUALITY → "major" fallback
    expect(degrees[6]!.chord.quality.kind).toBe("major");
  });
});

describe("Harmonizer.harmonize() — eleventh extension (roman numeral coverage)", () => {
  const degrees = harmonizer.harmonize(cMajor, "eleventh");

  it("degree 1 eleventh = Cmaj11", () => {
    expect(degrees[0]!.chord.quality.kind).toBe("major11");
    expect(degrees[0]!.romanNumeral).toBe("Imaj11");
  });

  it("degree 5 eleventh = G11 (dominant11)", () => {
    expect(degrees[4]!.chord.quality.kind).toBe("dominant11");
    expect(degrees[4]!.romanNumeral).toBe("V11");
  });

  it("degree 2 eleventh = Dm11 (minor11)", () => {
    expect(degrees[1]!.chord.quality.kind).toBe("minor11");
    expect(degrees[1]!.romanNumeral).toBe("iim11");
  });

  it("degree 7 eleventh falls back to major (diatonic intervals don't match half-dim11)", () => {
    expect(degrees[6]!.chord.quality.kind).toBe("major");
  });
});

describe("Harmonizer.harmonize() — thirteenth extension (roman numeral coverage)", () => {
  const degrees = harmonizer.harmonize(cMajor, "thirteenth");

  it("degree 1 thirteenth = Cmaj13", () => {
    expect(degrees[0]!.chord.quality.kind).toBe("major13");
    expect(degrees[0]!.romanNumeral).toBe("Imaj13");
  });

  it("degree 5 thirteenth = G13 (dominant13)", () => {
    expect(degrees[4]!.chord.quality.kind).toBe("dominant13");
    expect(degrees[4]!.romanNumeral).toBe("V13");
  });

  it("degree 2 thirteenth = Dm13 (minor13)", () => {
    expect(degrees[1]!.chord.quality.kind).toBe("minor13");
    expect(degrees[1]!.romanNumeral).toBe("iim13");
  });
});

describe("Harmonizer.harmonize() — custom scale (half-diminished9 and half-dim11 coverage)", () => {
  // Custom 7-note scale with intervals [0,2,3,5,6,8,10]:
  // Degree 1 ninth  → intervals 3,6,10,14 = half-diminished9
  // Degree 1 eleventh → intervals 3,6,10,14,17 = half-diminished11
  const customPattern = Object.freeze({ name: "custom-test", category: "exotic" as const, intervals: [0, 2, 3, 5, 6, 8, 10] as const });
  const C4 = pitchFactory.fromMidi(60);
  const customScale = scaleFactory.build(customPattern as never, C4);

  it("degree 1 ninth = half-diminished9 (line 87 coverage)", () => {
    const degrees = harmonizer.harmonize(customScale, "ninth");
    expect(degrees[0]!.chord.quality.kind).toBe("half-diminished9");
    expect(degrees[0]!.romanNumeral).toBe("iø9");
  });

  it("degree 1 eleventh = half-diminished11 (line 91 coverage)", () => {
    const degrees = harmonizer.harmonize(customScale, "eleventh");
    expect(degrees[0]!.chord.quality.kind).toBe("half-diminished11");
    expect(degrees[0]!.romanNumeral).toBe("iø11");
  });
});

describe("Harmonizer.harmonize() — harmonic minor (augmented / dim7 / mM7 chords)", () => {
  const C4 = pitchFactory.fromMidi(60);
  const cHarmonicMinor = scaleFactory.build(HARMONIC_MINOR_PATTERN, C4);

  describe("triads", () => {
    const triads = harmonizer.harmonize(cHarmonicMinor, "triad");

    it("degree 3 = augmented triad (IIIaug)", () => {
      expect(triads[2]!.chord.quality.kind).toBe("augmented");
      expect(triads[2]!.romanNumeral).toBe("IIIaug");
    });
  });

  describe("seventh chords", () => {
    const sevenths = harmonizer.harmonize(cHarmonicMinor, "seventh");

    it("degree 1 = minor-major7 (imM7)", () => {
      expect(sevenths[0]!.chord.quality.kind).toBe("minor-major7");
      expect(sevenths[0]!.romanNumeral).toBe("iM7");
    });

    it("degree 3 = augmented-major7 (III+M7)", () => {
      expect(sevenths[2]!.chord.quality.kind).toBe("augmented-major7");
      expect(sevenths[2]!.romanNumeral).toBe("III+M7");
    });

    it("degree 7 = diminished7 (vii°7)", () => {
      expect(sevenths[6]!.chord.quality.kind).toBe("diminished7");
      expect(sevenths[6]!.romanNumeral).toBe("vii°7");
    });
  });
});
