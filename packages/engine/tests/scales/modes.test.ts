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

  // ── Basic mode derivation ─────────────────────────────────────────────────

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

  // ── Pitch identity ───────────────────────────────────────────────────────

  it("mode pitches match parent scale pitches by value, octave-adjusted", () => {
    const dorian = cMajor.mode(2);
    // D dorian: D4 E4 F4 G4 A4 B4 C5 — C is octave-displaced from C major's C4
    expect(dorian.pitches[0]!.midi).toBe(62);  // D4
    expect(dorian.pitches[6]!.midi).toBe(72);  // C5 (octave above because it wraps)
    // Pitch classes match C major degrees
    expect(dorian.pitches.map(p => p.pitchClass)).toEqual(
      cMajor.pitches.slice(1).concat(cMajor.pitches[0]!).map(p => p.pitchClass)
    );
  });

  // ── Enharmonic spelling preservation ─────────────────────────────────────

  it("D dorian from C major preserves diatonic spelling (all naturals)", () => {
    const dorian = cMajor.mode(2);
    const names = dorian.pitches.map(p => `${p.spelling.letter}:${p.spelling.accidental}`);
    expect(names).toEqual(["1:0", "2:0", "3:0", "4:0", "5:0", "6:0", "0:0"]);
  });

  it("E phrygian from C major: E F G A B C D", () => {
    const phrygian = cMajor.mode(3);
    expect(phrygian.pitches.map(p => p.spelling.letter)).toEqual([2, 3, 4, 5, 6, 0, 1]);
  });

  it("B locrian from C major has B natural root, not Cb", () => {
    const locrian = cMajor.mode(7);
    expect(locrian.root.spelling.letter).toBe(NoteLetter.B);
    expect(locrian.root.spelling.accidental).toBe(0);
  });

  it("mode derived from sharp key (G major → A dorian) preserves F#", () => {
    const gMajor = scaleFactory.build(
      MAJOR_PATTERN,
      pitchFactory.fromMidiWithSpelling(67, { letter: NoteLetter.G, accidental: 0 }),
    );
    const aDorian = gMajor.mode(2);
    const names = aDorian.pitches.map(p => `${p.spelling.letter}:${p.spelling.accidental}`);
    expect(names).toEqual(["5:0", "6:0", "0:0", "1:0", "2:0", "3:1", "4:0"]);
  });

  it("mode from flat key (F major → G dorian) preserves Bb", () => {
    const fMajor = scaleFactory.build(
      MAJOR_PATTERN,
      pitchFactory.fromMidiWithSpelling(65, { letter: NoteLetter.F, accidental: 0 }),
    );
    const gDorian = fMajor.mode(2);
    const names = gDorian.pitches.map(p => `${p.spelling.letter}:${p.spelling.accidental}`);
    expect(names).toEqual(["4:0", "5:0", "6:-1", "0:0", "1:0", "2:0", "3:0"]);
  });

  // ── Fallback for scales without mode names ───────────────────────────────

  it("mode() on scale without modes property uses fallback name", () => {
    const customPattern = Object.freeze({
      name: "my-exotic",
      category: "exotic" as const,
      intervals: [0, 2, 4, 5, 7, 9, 11] as const,
    });
    const custom = scaleFactory.build(customPattern as never, C4);
    const modeScale = custom.mode(2);
    expect(modeScale.pattern.name).toBe("mode-2-of-my-exotic");
  });

  it("mode() fallback preserves original pattern name and sets category to 'mode'", () => {
    const customPattern = Object.freeze({
      name: "double-harmonic",
      category: "synthetic" as const,
      intervals: [0, 1, 4, 5, 7, 8, 11] as const,
      modes: undefined,
    });
    const custom = scaleFactory.build(customPattern as never, C4);
    const mode2 = custom.mode(2);
    expect(mode2.pattern.name).toBe("mode-2-of-double-harmonic");
    expect(mode2.pattern.category).toBe("mode");
  });
});