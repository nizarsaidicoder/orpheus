import { describe, it, expect } from "vitest";
import { NoteLetter, Accidental, spelledNoteNameToString, spelledNoteNamesEqual } from "../../src/primitives/note-name.ts";

describe("NoteLetter enum", () => {
  it("C = 0, D = 1, …, B = 6", () => {
    expect(NoteLetter.C).toBe(0);
    expect(NoteLetter.D).toBe(1);
    expect(NoteLetter.B).toBe(6);
  });
});

describe("Accidental enum", () => {
  it("DoubleFlat = -2, Natural = 0, DoubleSharp = 2", () => {
    expect(Accidental.DoubleFlat).toBe(-2);
    expect(Accidental.Natural).toBe(0);
    expect(Accidental.DoubleSharp).toBe(2);
  });
});

describe("spelledNoteNameToString", () => {
  it("renders C natural as 'C'", () => {
    expect(spelledNoteNameToString({ letter: NoteLetter.C, accidental: Accidental.Natural })).toBe("C");
  });

  it("renders G# as 'G#'", () => {
    expect(spelledNoteNameToString({ letter: NoteLetter.G, accidental: Accidental.Sharp })).toBe("G#");
  });

  it("renders Ab as 'Ab'", () => {
    expect(spelledNoteNameToString({ letter: NoteLetter.A, accidental: Accidental.Flat })).toBe("Ab");
  });

  it("renders F## as 'F##'", () => {
    expect(spelledNoteNameToString({ letter: NoteLetter.F, accidental: Accidental.DoubleSharp })).toBe("F##");
  });

  it("renders Dbb as 'Dbb'", () => {
    expect(spelledNoteNameToString({ letter: NoteLetter.D, accidental: Accidental.DoubleFlat })).toBe("Dbb");
  });
});

describe("spelledNoteNamesEqual", () => {
  it("same letter and accidental → true", () => {
    expect(spelledNoteNamesEqual(
      { letter: NoteLetter.C, accidental: Accidental.Natural },
      { letter: NoteLetter.C, accidental: Accidental.Natural },
    )).toBe(true);
  });

  it("same letter, different accidental → false", () => {
    expect(spelledNoteNamesEqual(
      { letter: NoteLetter.C, accidental: Accidental.Natural },
      { letter: NoteLetter.C, accidental: Accidental.Sharp },
    )).toBe(false);
  });

  it("different letter, same accidental → false", () => {
    expect(spelledNoteNamesEqual(
      { letter: NoteLetter.C, accidental: Accidental.Natural },
      { letter: NoteLetter.D, accidental: Accidental.Natural },
    )).toBe(false);
  });
});
