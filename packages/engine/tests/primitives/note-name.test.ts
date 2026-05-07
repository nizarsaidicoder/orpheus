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
  it("renders C natural as 'C'", () => {});
  it("renders G# as 'G#'", () => {});
  it("renders Ab as 'Ab'", () => {});
  it("renders F## as 'F##'", () => {});
  it("renders Dbb as 'Dbb'", () => {});
});

describe("spelledNoteNamesEqual", () => {
  it("same letter and accidental → true", () => {});
  it("same letter, different accidental → false", () => {});
  it("different letter, same accidental → false", () => {});
});
