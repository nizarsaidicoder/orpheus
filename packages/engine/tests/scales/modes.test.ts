import { describe, it, expect } from "vitest";
import {
  IONIAN_PATTERN, DORIAN_PATTERN, PHRYGIAN_PATTERN, LYDIAN_PATTERN,
  MIXOLYDIAN_PATTERN, AEOLIAN_PATTERN, LOCRIAN_PATTERN, ALL_CHURCH_MODES,
} from "../../src/scales/modes.ts";
import { scaleFactory } from "../../src/scales/scale.ts";
import { MAJOR_PATTERN } from "../../src/scales/diatonic.ts";
import { pitchFactory } from "../../src/primitives/pitch.ts";
import { NoteLetter } from "../../src/primitives/note-name.ts";

describe("Church mode patterns", () => {
  it("all 7 modes are exported and present in ALL_CHURCH_MODES", () => {
    expect(ALL_CHURCH_MODES).toHaveLength(7);
  });

  it("Ionian is identical to major scale intervals", () => {
    expect(IONIAN_PATTERN.intervals).toEqual([0, 2, 4, 5, 7, 9, 11]);
  });

  it("Dorian has raised 6th vs natural minor: [0, 2, 3, 5, 7, 9, 10]", () => {
    expect(DORIAN_PATTERN.intervals).toEqual([0, 2, 3, 5, 7, 9, 10]);
  });

  it("Phrygian has lowered 2nd: [0, 1, 3, 5, 7, 8, 10]", () => {
    expect(PHRYGIAN_PATTERN.intervals).toEqual([0, 1, 3, 5, 7, 8, 10]);
  });

  it("Lydian has raised 4th: [0, 2, 4, 6, 7, 9, 11]", () => {
    expect(LYDIAN_PATTERN.intervals).toEqual([0, 2, 4, 6, 7, 9, 11]);
  });

  it("Mixolydian has lowered 7th: [0, 2, 4, 5, 7, 9, 10]", () => {
    expect(MIXOLYDIAN_PATTERN.intervals).toEqual([0, 2, 4, 5, 7, 9, 10]);
  });

  it("Aeolian equals natural minor: [0, 2, 3, 5, 7, 8, 10]", () => {
    expect(AEOLIAN_PATTERN.intervals).toEqual([0, 2, 3, 5, 7, 8, 10]);
  });

  it("Locrian has b2 and b5: [0, 1, 3, 5, 6, 8, 10]", () => {
    expect(LOCRIAN_PATTERN.intervals).toEqual([0, 1, 3, 5, 6, 8, 10]);
  });

  it("all modes have category 'mode'", () => {
    ALL_CHURCH_MODES.forEach((m) => expect(m.category).toBe("mode"));
  });
});

describe("Scale.mode()", () => {
  const C4 = pitchFactory.fromMidi(60);
  const cMajor = scaleFactory.build(MAJOR_PATTERN, C4);

  it("C major.mode(2) is a Dorian scale rooted on D", () => {
    const dorian = cMajor.mode(2);
    expect(dorian.root.midi).toBe(62);
    expect(dorian.root.spelling.letter).toBe(NoteLetter.D);
    expect(dorian.pattern.intervals).toEqual([0, 2, 3, 5, 7, 9, 10]);
  });

  it("C major.mode(3) is a Phrygian scale rooted on E", () => {
    const phrygian = cMajor.mode(3);
    expect(phrygian.root.midi).toBe(64);
    expect(phrygian.root.spelling.letter).toBe(NoteLetter.E);
    expect(phrygian.pattern.intervals).toEqual([0, 1, 3, 5, 7, 8, 10]);
  });

  it("C major.mode(6) is an Aeolian scale rooted on A", () => {
    const aeolian = cMajor.mode(6);
    expect(aeolian.root.midi).toBe(69);
    expect(aeolian.root.spelling.letter).toBe(NoteLetter.A);
    expect(aeolian.pattern.intervals).toEqual([0, 2, 3, 5, 7, 8, 10]);
  });

  it("throws RangeError for mode(0) or mode(> pattern length)", () => {
    expect(() => cMajor.mode(0)).toThrow(RangeError);
    expect(() => cMajor.mode(8)).toThrow(RangeError);
  });
});
