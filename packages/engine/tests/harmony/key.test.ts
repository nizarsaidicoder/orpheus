import { describe, it, expect } from "vitest";
import { keyFactory } from "../../src/harmony/key.ts";
import { pitchFactory } from "../../src/primitives/pitch.ts";
import { NoteLetter, Accidental } from "../../src/primitives/note-name.ts";

const CMajor = keyFactory.major(0);
const FSharpMajor = keyFactory.major(6);
const CMinor = keyFactory.minor(-3);

describe("keyFactory.major()", () => {
  it("C major (sig 0) tonic pitchClass = 0", () => {
    expect(CMajor.tonic.pitchClass).toBe(0);
    expect(CMajor.modality).toBe("major");
  });

  it("G major (sig +1) tonic pitchClass = 7", () => {
    const GMajor = keyFactory.major(1);
    expect(GMajor.tonic.pitchClass).toBe(7);
  });

  it("throws RangeError for out-of-range signature", () => {
    expect(() => keyFactory.major(8)).toThrow(RangeError);
    expect(() => keyFactory.major(-8)).toThrow(RangeError);
  });
});

describe("keyFactory.minor()", () => {
  it("A minor (sig 0) tonic pitchClass = 9", () => {
    const AMinor = keyFactory.minor(0);
    expect(AMinor.tonic.pitchClass).toBe(9);
    expect(AMinor.modality).toBe("minor");
  });

  it("throws RangeError for out-of-range signature", () => {
    expect(() => keyFactory.minor(8)).toThrow(RangeError);
  });
});

describe("keyFactory.build() — standard spellings", () => {
  it("build(C4, 'major') returns C major", () => {
    const C4 = pitchFactory.fromMidi(60);
    const key = keyFactory.build(C4, "major");
    expect(key.tonic.pitchClass).toBe(0);
    expect(key.modality).toBe("major");
  });

  it("build(A4, 'minor') returns A minor", () => {
    const A4 = pitchFactory.fromMidi(69);
    const key = keyFactory.build(A4, "minor");
    expect(key.tonic.pitchClass).toBe(9);
    expect(key.modality).toBe("minor");
  });
});

describe("keyFactory.build() — non-standard spelling fallback", () => {
  it("build with Dbb spelling hits fallback and returns a key", () => {
    const dbb = pitchFactory.fromSpelling(
      { letter: NoteLetter.D, accidental: Accidental.DoubleFlat },
      4,
    );
    const key = keyFactory.build(dbb, "major");
    expect(key).toBeDefined();
    expect(key.modality).toBe("major");
  });

  it("build with non-standard spelling + minor modality uses minor fallback intervals", () => {
    const dbb = pitchFactory.fromSpelling(
      { letter: NoteLetter.D, accidental: Accidental.DoubleFlat },
      4,
    );
    const key = keyFactory.build(dbb, "minor");
    expect(key).toBeDefined();
    expect(key.modality).toBe("minor");
  });
});

describe("Key.spellPitchClass()", () => {
  it("C major: pitchClass 0 → C natural", () => {
    const spelled = CMajor.spellPitchClass(0);
    expect(spelled.letter).toBe(NoteLetter.C);
    expect(spelled.accidental).toBe(Accidental.Natural);
  });

  it("C major: pitchClass 7 → G natural", () => {
    const spelled = CMajor.spellPitchClass(7);
    expect(spelled.letter).toBe(NoteLetter.G);
    expect(spelled.accidental).toBe(Accidental.Natural);
  });

  it("C major: chromatic pitchClass 1 (C#/Db, not in key) → fallback spelling", () => {
    // PC 1 is not in C major (no sharps/flats), triggers fallback branch
    const spelled = CMajor.spellPitchClass(1);
    expect(spelled).toBeDefined();
    expect(spelled.letter).toBeDefined();
  });

  it("flat key (C minor): chromatic PC uses flat spelling", () => {
    // C minor has flats — chromatic PC 10 (Bb/A#) should prefer flat
    const spelled = CMinor.spellPitchClass(10);
    expect(spelled.accidental).toBe(Accidental.Flat); // Bb preferred in flat key
  });

  it("F# major: chromatic PC uses sharp spelling", () => {
    // F# major has sharps — chromatic note should prefer sharp
    const spelled = FSharpMajor.spellPitchClass(1); // C#/Db
    expect(spelled.accidental).toBe(Accidental.Sharp);
  });

  it("wraps pitchClass > 11 correctly", () => {
    const spelled = CMajor.spellPitchClass(12); // 12 % 12 = 0 → C
    expect(spelled.letter).toBe(NoteLetter.C);
  });

  it("flat key with natural-only PC: CMinor.spellPitchClass(4) → E (options[1] undefined, falls back to options[0])", () => {
    // PC 4 = E natural — only one enharmonic option in the table
    // C minor has signature < 0, so it tries options[1] ?? options[0]
    const spelled = CMinor.spellPitchClass(4);
    expect(spelled.letter).toBe(NoteLetter.E);
    expect(spelled.accidental).toBe(Accidental.Natural);
  });
});

describe("keyFactory.allMajor / allMinor", () => {
  it("allMajor has 15 keys", () => {
    expect(keyFactory.allMajor).toHaveLength(15);
  });

  it("allMinor has 15 keys", () => {
    expect(keyFactory.allMinor).toHaveLength(15);
  });
});
