import { describe, it, expect } from "vitest";
import { harmonizer } from "../../src/chords/harmonizer.ts";
import { scaleFactory } from "../../src/scales/scale.ts";
import { MAJOR_PATTERN } from "../../src/scales/diatonic.ts";
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
