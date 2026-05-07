import { describe, it, expect } from "vitest";
import {
  MAJOR_PATTERN,
  NATURAL_MINOR_PATTERN,
  HARMONIC_MINOR_PATTERN,
  MELODIC_MINOR_PATTERN,
} from "../../src/scales/diatonic.js";
import { scaleFactory } from "../../src/scales/scale.js";
import { pitchFactory } from "../../src/primitives/pitch.js";
import { NoteLetter, Accidental } from "../../src/primitives/note-name.js";

describe("Major scale pattern", () => {
  it("has 7 interval offsets starting with 0", () => {
    expect(MAJOR_PATTERN.intervals).toHaveLength(7);
    expect(MAJOR_PATTERN.intervals[0]).toBe(0);
  });

  it("intervals are [0, 2, 4, 5, 7, 9, 11]", () => {
    expect(MAJOR_PATTERN.intervals).toEqual([0, 2, 4, 5, 7, 9, 11]);
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

// ---------------------------------------------------------------------------
// Scale instance tests (requires scaleFactory + pitchFactory)
// ---------------------------------------------------------------------------

const C4 = pitchFactory.fromMidi(60);
const cMajor = scaleFactory.build(MAJOR_PATTERN, C4);

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

  it("degree(8) = root one octave up", () => {
    expect(cMajor.degree(8).midi).toBe(72);
  });

  it("throws RangeError for degree < 1", () => {
    expect(() => cMajor.degree(0)).toThrow(RangeError);
    expect(() => cMajor.degree(-1)).toThrow(RangeError);
  });
});

describe("Scale.contains()", () => {
  it("C major contains G#: false", () => {
    const gSharp = pitchFactory.fromMidiWithSpelling(68, {
      letter: NoteLetter.G,
      accidental: Accidental.Sharp,
    });
    expect(cMajor.contains(gSharp)).toBe(false);
  });

  it("C major contains F: true", () => {
    const f4 = pitchFactory.fromMidi(65);
    expect(cMajor.contains(f4)).toBe(true);
  });

  it("uses pitch-class comparison (ignores octave)", () => {
    const g5 = pitchFactory.fromMidi(79); // G5, different octave from G4
    expect(cMajor.contains(g5)).toBe(true);
  });
});

describe("Scale.transpose()", () => {
  it("transposing C major by 2 → D major", () => {
    const dMajor = cMajor.transpose(2);
    expect(dMajor.root.midi).toBe(62);
    expect(dMajor.root.spelling.letter).toBe(NoteLetter.D);
  });

  it("preserves scale pattern after transposition", () => {
    const dMajor = cMajor.transpose(2);
    expect(dMajor.pattern.intervals).toEqual(MAJOR_PATTERN.intervals);
  });
});
