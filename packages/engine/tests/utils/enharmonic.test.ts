import { describe, it, expect } from "vitest";
import { ENHARMONIC_TABLE, enharmonicEquivalentOf, spellingToPitchClass } from "../../src/utils/enharmonic.ts";
import { NoteLetter, Accidental } from "../../src/primitives/note-name.ts";

describe("ENHARMONIC_TABLE", () => {
  it("has entries for all 12 pitch classes (0–11)", () => {
    for (let i = 0; i <= 11; i++) {
      expect(ENHARMONIC_TABLE[i]).toBeDefined();
    }
  });

  it("each entry has at least one spelling", () => {
    for (let i = 0; i <= 11; i++) {
      expect(ENHARMONIC_TABLE[i]!.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("black keys (1, 3, 6, 8, 10) have two spellings (sharp and flat)", () => {
    [1, 3, 6, 8, 10].forEach((pc) => {
      expect(ENHARMONIC_TABLE[pc]!.length).toBe(2);
    });
  });
});

describe("spellingToPitchClass()", () => {
  it("C natural → 0", () => {
    expect(spellingToPitchClass({ letter: NoteLetter.C, accidental: Accidental.Natural })).toBe(0);
  });
  it("G# → 8", () => {
    expect(spellingToPitchClass({ letter: NoteLetter.G, accidental: Accidental.Sharp })).toBe(8);
  });
  it("Ab → 8", () => {
    expect(spellingToPitchClass({ letter: NoteLetter.A, accidental: Accidental.Flat })).toBe(8);
  });
  it("F## → 7 (same as G natural)", () => {
    expect(spellingToPitchClass({ letter: NoteLetter.F, accidental: Accidental.DoubleSharp })).toBe(7);
  });
});

describe("enharmonicEquivalentOf()", () => {
  it("G# → Ab", () => {
    const gSharp = { letter: NoteLetter.G, accidental: Accidental.Sharp };
    const result = enharmonicEquivalentOf(gSharp);
    expect(result.letter).toBe(NoteLetter.A);
    expect(result.accidental).toBe(Accidental.Flat);
  });
  it("Ab → G#", () => {
    const aFlat = { letter: NoteLetter.A, accidental: Accidental.Flat };
    const result = enharmonicEquivalentOf(aFlat);
    expect(result.letter).toBe(NoteLetter.G);
    expect(result.accidental).toBe(Accidental.Sharp);
  });
  it("C natural has no enharmonic equivalent → returns self", () => {
    const c = { letter: NoteLetter.C, accidental: Accidental.Natural };
    expect(enharmonicEquivalentOf(c)).toEqual(c);
  });
});
