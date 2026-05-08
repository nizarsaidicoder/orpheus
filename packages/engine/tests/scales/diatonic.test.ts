import { describe, it, expect } from "vitest";
import {
  MAJOR_PATTERN,
  NATURAL_MINOR_PATTERN,
  HARMONIC_MINOR_PATTERN,
  MELODIC_MINOR_PATTERN,
} from "../../src/scales/diatonic.ts";
import { DORIAN_PATTERN } from "../../src/scales/index.ts";
import { scaleFactory } from "../../src/scales/scale.ts";
import { pitchFactory } from "../../src/primitives/pitch.ts";
import { NoteLetter, Accidental, SpelledNoteName } from "../../src/primitives/note-name.ts";


// ── Shared fixtures ───────────────────────────────────────────────────────────

const NATURAL_PC: Record<number, number> = {
  [NoteLetter.C]: 0, [NoteLetter.D]: 2, [NoteLetter.E]: 4,
  [NoteLetter.F]: 5, [NoteLetter.G]: 7, [NoteLetter.A]: 9, [NoteLetter.B]: 11,
};

const ALL_MAJOR_ROOTS: SpelledNoteName[] = [
  { letter: NoteLetter.C, accidental: Accidental.Natural },
  { letter: NoteLetter.G, accidental: Accidental.Natural },
  { letter: NoteLetter.D, accidental: Accidental.Natural },
  { letter: NoteLetter.A, accidental: Accidental.Natural },
  { letter: NoteLetter.E, accidental: Accidental.Natural },
  { letter: NoteLetter.B, accidental: Accidental.Natural },
  { letter: NoteLetter.F, accidental: Accidental.Sharp },
  { letter: NoteLetter.C, accidental: Accidental.Sharp },
  { letter: NoteLetter.F, accidental: Accidental.Natural },
  { letter: NoteLetter.B, accidental: Accidental.Flat },
  { letter: NoteLetter.E, accidental: Accidental.Flat },
  { letter: NoteLetter.A, accidental: Accidental.Flat },
  { letter: NoteLetter.D, accidental: Accidental.Flat },
  { letter: NoteLetter.G, accidental: Accidental.Flat },
  { letter: NoteLetter.C, accidental: Accidental.Flat },
];

function makePitch(root: SpelledNoteName): ReturnType<typeof pitchFactory.fromMidiWithSpelling> {
  return pitchFactory.fromMidiWithSpelling(60 + NATURAL_PC[root.letter]! + root.accidental, root);
}

const C4 = pitchFactory.fromMidi(60);
const cMajor = scaleFactory.build(MAJOR_PATTERN, C4);

// ── Pattern definitions ───────────────────────────────────────────────────────

describe("Major scale pattern", () => {
  it("has intervals [0, 2, 4, 5, 7, 9, 11]", () => {
    expect(MAJOR_PATTERN.intervals).toEqual([0, 2, 4, 5, 7, 9, 11]);
  });

  it("has 7 intervals starting with 0", () => {
    expect(MAJOR_PATTERN.intervals).toHaveLength(7);
    expect(MAJOR_PATTERN.intervals[0]).toBe(0);
  });

  it("category is 'diatonic'", () => {
    expect(MAJOR_PATTERN.category).toBe("diatonic");
  });

  it("defines 7 mode names (Ionian through Locrian)", () => {
    expect(MAJOR_PATTERN.modes).toHaveLength(7);
    expect(MAJOR_PATTERN.modes?.[0]).toBe("Ionian");
    expect(MAJOR_PATTERN.modes?.[6]).toBe("Locrian");
  });
});

describe("Natural minor scale pattern", () => {
  it("has intervals [0, 2, 3, 5, 7, 8, 10]", () => {
    expect(NATURAL_MINOR_PATTERN.intervals).toEqual([0, 2, 3, 5, 7, 8, 10]);
  });

  it("category is 'diatonic'", () => {
    expect(NATURAL_MINOR_PATTERN.category).toBe("diatonic");
  });
});

describe("Harmonic minor scale pattern", () => {
  it("has intervals [0, 2, 3, 5, 7, 8, 11]", () => {
    expect(HARMONIC_MINOR_PATTERN.intervals).toEqual([0, 2, 3, 5, 7, 8, 11]);
  });

  it("raised 7th (11) compared to natural minor (10)", () => {
    expect(HARMONIC_MINOR_PATTERN.intervals[6]).toBe(11);
    expect(NATURAL_MINOR_PATTERN.intervals[6]).toBe(10);
  });

  it("category is 'harmonic'", () => {
    expect(HARMONIC_MINOR_PATTERN.category).toBe("harmonic");
  });
});

describe("Melodic minor scale pattern", () => {
  it("has intervals [0, 2, 3, 5, 7, 9, 11]", () => {
    expect(MELODIC_MINOR_PATTERN.intervals).toEqual([0, 2, 3, 5, 7, 9, 11]);
  });

  it("both 6th and 7th are raised compared to natural minor", () => {
    expect(MELODIC_MINOR_PATTERN.intervals[5]).toBe(9);  // raised 6th (vs 8)
    expect(MELODIC_MINOR_PATTERN.intervals[6]).toBe(11); // raised 7th (vs 10)
  });

  it("category is 'melodic'", () => {
    expect(MELODIC_MINOR_PATTERN.category).toBe("melodic");
  });

  it("defines 7 mode names", () => {
    expect(MELODIC_MINOR_PATTERN.modes).toHaveLength(7);
  });
});

// ── Scale instance: degree, contains, transpose ───────────────────────────────

describe("Scale.degree()", () => {
  it("degree(1) = root", () => {
    expect(cMajor.degree(1).midi).toBe(60);
  });

  it("degree(5) of C major = G", () => {
    const g4 = cMajor.degree(5);
    expect(g4.midi).toBe(67);
    expect(g4.spelling.letter).toBe(NoteLetter.G);
  });

  it("degree(7) of C major = B", () => {
    const b4 = cMajor.degree(7);
    expect(b4.midi).toBe(71);
    expect(b4.spelling.letter).toBe(NoteLetter.B);
  });

  it("throws RangeError for degree < 1", () => {
    expect(() => cMajor.degree(0)).toThrow(RangeError);
    expect(() => cMajor.degree(-1)).toThrow(RangeError);
  });

  it("in-range degree returns same pitch object as pitches array", () => {
    for (let d = 1; d <= 7; d++) {
      expect(cMajor.degree(d)).toBe(cMajor.pitches[d - 1]);
    }
  });
});

describe("Scale.degree() — wrapping beyond octave", () => {
  it("degree(8) = root one octave up", () => {
    expect(cMajor.degree(8).midi).toBe(72);
  });

  it("degree(9) = D above the octave", () => {
    expect(cMajor.degree(9).midi).toBe(74);
  });
});

describe("Scale.contains()", () => {
  it("returns true for diatonic pitches (by pitch class, ignores octave)", () => {
    for (const p of cMajor.pitches) {
      expect(cMajor.contains(p)).toBe(true);
    }
    const g5 = pitchFactory.fromMidi(79);
    expect(cMajor.contains(g5)).toBe(true);
  });

  it("returns false for non-diatonic pitches", () => {
    const fSharp = pitchFactory.fromMidi(66);
    expect(cMajor.contains(fSharp)).toBe(false);

    const gSharp = pitchFactory.fromMidiWithSpelling(68, {
      letter: NoteLetter.G,
      accidental: Accidental.Sharp,
    });
    expect(cMajor.contains(gSharp)).toBe(false);
  });
});

describe("Scale.transpose()", () => {
  it("transposing C major by +2 semitones → root is D", () => {
    const dMajor = cMajor.transpose(2);
    expect(dMajor.root.midi).toBe(62);
    expect(dMajor.root.spelling.letter).toBe(NoteLetter.D);
  });

  it("preserves scale pattern after transposition", () => {
    const dMajor = cMajor.transpose(2);
    expect(dMajor.pattern.intervals).toEqual(MAJOR_PATTERN.intervals);
  });
});

describe("Scale.intervalToDegree()", () => {
  it("degree 8 wraps to octave (12 semitones)", () => {
    expect(cMajor.intervalToDegree(8).semitones).toBe(12);
  });

  it("degree 9 wraps to major ninth (14 semitones)", () => {
    expect(cMajor.intervalToDegree(9).semitones).toBe(14);
  });

  it("throws RangeError for degree < 1", () => {
    expect(() => cMajor.intervalToDegree(0)).toThrow(RangeError);
  });
});

// ── Enharmonic spelling ──────────────────────────────────────────────────────

describe("Scale enharmonic spelling", () => {
  it("C major: all naturals, letters C–B", () => {
    const letters = cMajor.pitches.map(p => p.spelling.letter);
    expect(letters).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(cMajor.pitches.every(p => p.spelling.accidental === Accidental.Natural)).toBe(true);
  });

  it("G major: F# on leading tone", () => {
    const scale = scaleFactory.build(MAJOR_PATTERN, makePitch({ letter: NoteLetter.G, accidental: Accidental.Natural }));
    const names = scale.pitches.map(p => `${p.spelling.letter}:${p.spelling.accidental}`);
    expect(names).toEqual(["4:0", "5:0", "6:0", "0:0", "1:0", "2:0", "3:1"]);
  });

  it("F major: Bb on subdominant", () => {
    const scale = scaleFactory.build(MAJOR_PATTERN, makePitch({ letter: NoteLetter.F, accidental: Accidental.Natural }));
    const names = scale.pitches.map(p => `${p.spelling.letter}:${p.spelling.accidental}`);
    expect(names).toEqual(["3:0", "4:0", "5:0", "6:-1", "0:0", "1:0", "2:0"]);
  });

  it("Bb major: Bb and Eb", () => {
    const scale = scaleFactory.build(MAJOR_PATTERN, makePitch({ letter: NoteLetter.B, accidental: Accidental.Flat }));
    const names = scale.pitches.map(p => `${p.spelling.letter}:${p.spelling.accidental}`);
    expect(names).toEqual(["6:-1", "0:0", "1:0", "2:-1", "3:0", "4:0", "5:0"]);
  });

  it("Eb major: all flats/naturals, no sharps", () => {
    const scale = scaleFactory.build(MAJOR_PATTERN, makePitch({ letter: NoteLetter.E, accidental: Accidental.Flat }));
    expect(scale.pitches.map(p => p.spelling.letter)).toEqual([2, 3, 4, 5, 6, 0, 1]);
    expect(scale.pitches.every(p => p.spelling.accidental <= 0)).toBe(true);
  });

  it("F# major: E# on leading tone", () => {
    const scale = scaleFactory.build(MAJOR_PATTERN, makePitch({ letter: NoteLetter.F, accidental: Accidental.Sharp }));
    const names = scale.pitches.map(p => `${p.spelling.letter}:${p.spelling.accidental}`);
    expect(names).toEqual(["3:1", "4:1", "5:1", "6:0", "0:1", "1:1", "2:1"]);
  });

  it("C# major: E# and B# (not F and C)", () => {
    const scale = scaleFactory.build(MAJOR_PATTERN, makePitch({ letter: NoteLetter.C, accidental: Accidental.Sharp }));
    const names = scale.pitches.map(p => `${p.spelling.letter}:${p.spelling.accidental}`);
    expect(names).toEqual(["0:1", "1:1", "2:1", "3:1", "4:1", "5:1", "6:1"]);
  });

  it("Cb major: Fb and Cb (all flats)", () => {
    const scale = scaleFactory.build(MAJOR_PATTERN, makePitch({ letter: NoteLetter.C, accidental: Accidental.Flat }));
    const names = scale.pitches.map(p => `${p.spelling.letter}:${p.spelling.accidental}`);
    expect(names).toEqual(["0:-1", "1:-1", "2:-1", "3:-1", "4:-1", "5:-1", "6:-1"]);
  });

  it("A harmonic minor: G# on raised 7th", () => {
    const scale = scaleFactory.build(HARMONIC_MINOR_PATTERN, makePitch({ letter: NoteLetter.A, accidental: Accidental.Natural }));
    const names = scale.pitches.map(p => `${p.spelling.letter}:${p.spelling.accidental}`);
    expect(names).toEqual(["5:0", "6:0", "0:0", "1:0", "2:0", "3:0", "4:1"]);
  });

  it("A dorian: F# raised 6th (not Gb)", () => {
    const scale = scaleFactory.build(DORIAN_PATTERN, makePitch({ letter: NoteLetter.A, accidental: Accidental.Natural }));
    const names = scale.pitches.map(p => `${p.spelling.letter}:${p.spelling.accidental}`);
    expect(names).toEqual(["5:0", "6:0", "0:0", "1:0", "2:0", "3:1", "4:0"]);
  });

  it("D dorian: B natural, not Cb", () => {
    const scale = scaleFactory.build(DORIAN_PATTERN, makePitch({ letter: NoteLetter.D, accidental: Accidental.Natural }));
    expect(scale.pitches.map(p => p.spelling.letter)).toEqual([1, 2, 3, 4, 5, 6, 0]);
  });

  it("every major scale has exactly one of each letter A–G", () => {
    for (const root of ALL_MAJOR_ROOTS) {
      const scale = scaleFactory.build(MAJOR_PATTERN, makePitch(root));
      const letters = [...scale.pitches.map(p => p.spelling.letter)].sort();
      expect(letters).toEqual([0, 1, 2, 3, 4, 5, 6]);
    }
  });

  it("degree(8) preserves spelling (octave above root)", () => {
    const scale = scaleFactory.build(MAJOR_PATTERN, makePitch({ letter: NoteLetter.G, accidental: Accidental.Natural }));
    const high = scale.degree(8);
    expect(high.midi).toBe(79);
    expect(high.spelling.letter).toBe(NoteLetter.G);
    expect(high.spelling.accidental).toBe(Accidental.Natural);
  });

  it("degree(9) of C# major is D# one octave up", () => {
    const scale = scaleFactory.build(MAJOR_PATTERN, makePitch({ letter: NoteLetter.C, accidental: Accidental.Sharp }));
    const high = scale.degree(9);
    expect(high.midi).toBe(75);
    expect(high.spelling.letter).toBe(NoteLetter.D);
    expect(high.spelling.accidental).toBe(Accidental.Sharp);
  });

  it("transpose of C# major by +1 semitone gives D major root", () => {
    const scale = scaleFactory.build(MAJOR_PATTERN, makePitch({ letter: NoteLetter.C, accidental: Accidental.Sharp }));
    const transposed = scale.transpose(1);
    expect(transposed.root.midi).toBe(62);
    expect(transposed.root.spelling.letter).toBe(NoteLetter.D);
  });
});

describe("Scale.degreeName()", () => {
  it("C major functional names", () => {
    expect(cMajor.degreeName(1)).toBe("tonic");
    expect(cMajor.degreeName(2)).toBe("supertonic");
    expect(cMajor.degreeName(3)).toBe("mediant");
    expect(cMajor.degreeName(4)).toBe("subdominant");
    expect(cMajor.degreeName(5)).toBe("dominant");
    expect(cMajor.degreeName(6)).toBe("submediant");
    expect(cMajor.degreeName(7)).toBe("leading-tone");
  });

  it("degree(8) wraps to 'tonic'", () => {
    expect(cMajor.degreeName(8)).toBe("tonic");
  });

  it("degree(9) wraps to 'supertonic'", () => {
    expect(cMajor.degreeName(9)).toBe("supertonic");
  });

  it("throws RangeError for degree < 1", () => {
    expect(() => cMajor.degreeName(0)).toThrow(RangeError);
  });

  it("C natural minor degree 7 = subtonic in technical style", () => {
    const cMin = scaleFactory.build(NATURAL_MINOR_PATTERN, C4);
    expect(cMin.degreeName(7, { style: "technical" })).toBe("subtonic");
  });

  it("C major degree 7 = leading-tone in technical style", () => {
    expect(cMajor.degreeName(7, { style: "technical" })).toBe("leading-tone");
  });

  it("solfege style", () => {
    expect(cMajor.degreeName(1, { style: "solfege" })).toBe("do");
    expect(cMajor.degreeName(5, { style: "solfege" })).toBe("sol");
  });

  it("diatonic style", () => {
    expect(cMajor.degreeName(3, { style: "diatonic" })).toBe("3rd");
    expect(cMajor.degreeName(7, { style: "diatonic" })).toBe("7th");
  });
});