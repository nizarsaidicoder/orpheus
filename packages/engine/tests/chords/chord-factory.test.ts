import { describe, it, expect } from "vitest";
import { chordFactory } from "../../src/chords/chord-factory.ts";
import { pitchFactory } from "../../src/primitives/pitch.ts";
import { NoteLetter, Accidental } from "../../src/primitives/note-name.ts";

const C4  = pitchFactory.fromMidi(60);
const G4  = pitchFactory.fromMidi(67);
const D4  = pitchFactory.fromMidi(62);
const B3  = pitchFactory.fromMidi(59);

describe("ChordFactory.triad()", () => {
  it("builds C major triad with pitches {C, E, G}", () => {
    const c = chordFactory.triad(C4, "major");
    expect(c.pitches).toHaveLength(3);
    expect(c.pitches[0]!.midi).toBe(60); // C4
    expect(c.pitches[1]!.midi).toBe(64); // E4
    expect(c.pitches[2]!.midi).toBe(67); // G4
  });

  it("builds C minor triad with pitches {C, Eb, G}", () => {
    const c = chordFactory.triad(C4, "minor");
    expect(c.pitches[0]!.midi).toBe(60);
    expect(c.pitches[1]!.midi).toBe(63); // Eb4
    expect(c.pitches[2]!.midi).toBe(67); // G4
  });

  it("builds C diminished triad with pitches {C, Eb, Gb}", () => {
    const c = chordFactory.triad(C4, "diminished");
    expect(c.pitches[0]!.midi).toBe(60);
    expect(c.pitches[1]!.midi).toBe(63); // Eb4
    expect(c.pitches[2]!.midi).toBe(66); // Gb4
  });

  it("builds C augmented triad with pitches {C, E, G#}", () => {
    const c = chordFactory.triad(C4, "augmented");
    expect(c.pitches[0]!.midi).toBe(60);
    expect(c.pitches[1]!.midi).toBe(64); // E4
    expect(c.pitches[2]!.midi).toBe(68); // G#4
  });

  it("builds Csus2 with pitches {C, D, G}", () => {
    const c = chordFactory.triad(C4, "sus2");
    expect(c.pitches[0]!.midi).toBe(60);
    expect(c.pitches[1]!.midi).toBe(62); // D4
    expect(c.pitches[2]!.midi).toBe(67); // G4
  });

  it("builds Csus4 with pitches {C, F, G}", () => {
    const c = chordFactory.triad(C4, "sus4");
    expect(c.pitches[0]!.midi).toBe(60);
    expect(c.pitches[1]!.midi).toBe(65); // F4
    expect(c.pitches[2]!.midi).toBe(67); // G4
  });

  it("returns root inversion by default", () => {
    expect(chordFactory.triad(C4, "major").inversion).toBe("root");
  });

  it("intervalStructure for major triad = [M3, P5]", () => {
    const { intervalStructure: is } = chordFactory.triad(C4, "major");
    expect(is).toHaveLength(2);
    expect(is[0]!.number).toBe(3);
    expect(is[0]!.quality).toBe("major");
    expect(is[1]!.number).toBe(5);
    expect(is[1]!.quality).toBe("perfect");
  });

  it("intervalStructure for minor triad = [m3, P5]", () => {
    const { intervalStructure: is } = chordFactory.triad(C4, "minor");
    expect(is[0]!.quality).toBe("minor");
    expect(is[0]!.number).toBe(3);
    expect(is[1]!.number).toBe(5);
    expect(is[1]!.quality).toBe("perfect");
  });

  it("intervalStructure for dim triad = [m3, d5]", () => {
    const { intervalStructure: is } = chordFactory.triad(C4, "diminished");
    expect(is[0]!.quality).toBe("minor");
    expect(is[1]!.number).toBe(5);
    expect(is[1]!.quality).toBe("diminished");
  });

  it("intervalStructure for aug triad = [M3, A5]", () => {
    const { intervalStructure: is } = chordFactory.triad(C4, "augmented");
    expect(is[0]!.quality).toBe("major");
    expect(is[1]!.number).toBe(5);
    expect(is[1]!.quality).toBe("augmented");
  });
});

describe("ChordFactory.seventh()", () => {
  it("builds G dominant 7th: {G, B, D, F}", () => {
    const g7 = chordFactory.seventh(G4, "dominant7");
    expect(g7.pitches).toHaveLength(4);
    expect(g7.pitches[0]!.midi).toBe(67); // G4
    expect(g7.pitches[1]!.midi).toBe(71); // B4
    expect(g7.pitches[2]!.midi).toBe(74); // D5
    expect(g7.pitches[3]!.midi).toBe(77); // F5
  });

  it("builds C major 7th: {C, E, G, B}", () => {
    const cMaj7 = chordFactory.seventh(C4, "major7");
    expect(cMaj7.pitches[0]!.midi).toBe(60); // C4
    expect(cMaj7.pitches[1]!.midi).toBe(64); // E4
    expect(cMaj7.pitches[2]!.midi).toBe(67); // G4
    expect(cMaj7.pitches[3]!.midi).toBe(71); // B4
  });

  it("builds D minor 7th: {D, F, A, C}", () => {
    const dm7 = chordFactory.seventh(D4, "minor7");
    expect(dm7.pitches[0]!.midi).toBe(62); // D4
    expect(dm7.pitches[1]!.midi).toBe(65); // F4
    expect(dm7.pitches[2]!.midi).toBe(69); // A4
    expect(dm7.pitches[3]!.midi).toBe(72); // C5
  });

  it("builds B half-diminished 7th: {B, D, F, A}", () => {
    const bHalfDim = chordFactory.seventh(B3, "half-diminished7");
    expect(bHalfDim.pitches[0]!.midi).toBe(59); // B3
    expect(bHalfDim.pitches[1]!.midi).toBe(62); // D4
    expect(bHalfDim.pitches[2]!.midi).toBe(65); // F4
    expect(bHalfDim.pitches[3]!.midi).toBe(69); // A4
  });

  it("builds B diminished 7th: {B, D, F, Ab}", () => {
    const bDim7 = chordFactory.seventh(B3, "diminished7");
    expect(bDim7.pitches[0]!.midi).toBe(59); // B3
    expect(bDim7.pitches[1]!.midi).toBe(62); // D4
    expect(bDim7.pitches[2]!.midi).toBe(65); // F4
    expect(bDim7.pitches[3]!.midi).toBe(68); // Ab4/G#4
  });

  it("builds C minor-major 7th: {C, Eb, G, B}", () => {
    const cMm7 = chordFactory.seventh(C4, "minor-major7");
    expect(cMm7.pitches[0]!.midi).toBe(60); // C4
    expect(cMm7.pitches[1]!.midi).toBe(63); // Eb4
    expect(cMm7.pitches[2]!.midi).toBe(67); // G4
    expect(cMm7.pitches[3]!.midi).toBe(71); // B4
  });
  it("C minor 7th is spelled {C, Eb, G, Bb} — not D#, A#", () => {
    const cm7 = chordFactory.seventh(C4, "minor7");
    expect(cm7.pitches[1]!.spelling.letter).toBe(NoteLetter.E);
    expect(cm7.pitches[1]!.spelling.accidental).toBe(Accidental.Flat);
    expect(cm7.pitches[3]!.spelling.letter).toBe(NoteLetter.B);
    expect(cm7.pitches[3]!.spelling.accidental).toBe(Accidental.Flat);
  });

  it("C diminished 7th uses Bbb (double-flat 7th), not A", () => {
    const cDim7 = chordFactory.seventh(C4, "diminished7");
    const names = cDim7.pitches.map(p => `${p.spelling.letter}:${p.spelling.accidental}`);
    expect(names).toEqual(["0:0", "2:-1", "4:-1", "6:-2"]); // C, Eb, Gb, Bbb
  });

  it("B diminished 7th uses Ab (diminished 7th from B)", () => {
    const bDim7 = chordFactory.seventh(B3, "diminished7");
    // B D F Ab — Ab, not G#
    expect(bDim7.pitches[3]!.spelling.letter).toBe(NoteLetter.A);
    expect(bDim7.pitches[3]!.spelling.accidental).toBe(Accidental.Flat);
  });

  it("G dominant 7th uses F natural, not E#", () => {
    const g7 = chordFactory.seventh(G4, "dominant7");
    expect(g7.pitches[3]!.spelling.letter).toBe(NoteLetter.F);
    expect(g7.pitches[3]!.spelling.accidental).toBe(Accidental.Natural);
  });

  it("G# major triad uses B# and D# (not C, Eb)", () => {
    const gSharp = pitchFactory.fromMidiWithSpelling(68, {
      letter: NoteLetter.G,
      accidental: Accidental.Sharp,
    });
    const gSharpMaj = chordFactory.triad(gSharp, "major");
    const names = gSharpMaj.pitches.map(p => `${p.spelling.letter}:${p.spelling.accidental}`);
    expect(names).toEqual(["4:1", "6:1", "1:1"]); // G#, B#, D#
  });

  it("Ab minor triad uses Cb (not B)", () => {
    const aFlat = pitchFactory.fromMidiWithSpelling(68, {
      letter: NoteLetter.A,
      accidental: Accidental.Flat,
    });
    const abMin = chordFactory.triad(aFlat, "minor");
    expect(abMin.pitches[1]!.spelling.letter).toBe(NoteLetter.C);
    expect(abMin.pitches[1]!.spelling.accidental).toBe(Accidental.Flat);
  });

  it("F# half-diminished 7th is spelled F# A C E", () => {
    const fSharp = pitchFactory.fromMidiWithSpelling(66, {
      letter: NoteLetter.F,
      accidental: Accidental.Sharp,
    });
    const chord = chordFactory.seventh(fSharp, "half-diminished7");
    const names = chord.pitches.map(p => `${p.spelling.letter}:${p.spelling.accidental}`);
    expect(names).toEqual(["3:1", "5:0", "0:0", "2:0"]); // F#, A, C, E
  });
});

describe("ChordFactory.build() — alterations", () => {
  it("altered dominant with b9 produces correct pitches", () => {
    const g7b9 = chordFactory.build({
      root: G4,
      quality: { kind: "altered", alterations: [{ degree: 9, direction: "flat" }] },
    });
    expect(g7b9.pitches).toHaveLength(5);
    expect(g7b9.pitches[0]!.midi).toBe(67); // G4
    expect(g7b9.pitches[4]!.midi).toBe(80); // Ab5 (b9 = 13 semitones above G4)
  });

  it("altered dominant with #11 produces correct pitches", () => {
    const g7s11 = chordFactory.build({
      root: G4,
      quality: { kind: "altered", alterations: [{ degree: 11, direction: "sharp" }] },
    });
    expect(g7s11.pitches).toHaveLength(5);
    // #11 = A11 = 18 semitones above G4 = 67 + 18 = 85
    expect(g7s11.pitches[4]!.midi).toBe(85);
  });

  it("omitFifth removes the fifth from pitches", () => {
    const cMaj7noFifth = chordFactory.build({
      root: C4,
      quality: { kind: "major7" },
      omitFifth: true,
    });
    // major7 = [M3, P5, M7] → without P5 = [M3, M7]
    expect(cMaj7noFifth.pitches).toHaveLength(3);
    expect(cMaj7noFifth.pitches[0]!.midi).toBe(60); // C4
    expect(cMaj7noFifth.pitches[1]!.midi).toBe(64); // E4 (M3)
    expect(cMaj7noFifth.pitches[2]!.midi).toBe(71); // B4 (M7)
  });

  it("options.alterations replaces existing interval (if-branch of applyAlterations)", () => {
    // G dominant7 = [M3, P5, m7]; altering degree 5 sharp replaces P5 (7 semitones) with A5 (8)
    const g7sharp5 = chordFactory.build({
      root: G4,
      quality: { kind: "dominant7" },
      alterations: [{ degree: 5, direction: "sharp" }],
    });
    // A5 above G4 = 67 + 8 = 75
    expect(g7sharp5.pitches.some(p => p.midi === 75)).toBe(true);
  });
  it("G altered (7#5b9) spells #5 as D# and b9 as Ab", () => {
    const gAlt = chordFactory.build({
      root: G4,
      quality: {
        kind: "altered", alterations: [
          { degree: 5, direction: "sharp" },
          { degree: 9, direction: "flat" },
        ]
      },
    });
    // #5 = D# (raised 5th from G is D), b9 = Ab (lowered 9th from G is A)
    const names = gAlt.pitches.map(p => `${p.spelling.letter}:${p.spelling.accidental}`);
    // G B D# F Ab
    expect(names).toEqual(["4:0", "6:0", "1:1", "3:0", "5:-1"]);
  });
});

describe("ChordFactory.invert()", () => {
  const cMajor = chordFactory.triad(C4, "major");  // [C4, E4, G4]
  const g7     = chordFactory.seventh(G4, "dominant7"); // [G4, B4, D5, F5]

  it("first inversion places 3rd in bass", () => {
    const inv = chordFactory.invert(cMajor, "first");
    expect(inv.pitches[0]!.midi).toBe(64); // E4 in bass
    expect(inv.pitches[1]!.midi).toBe(67); // G4
    expect(inv.pitches[2]!.midi).toBe(72); // C5
  });

  it("second inversion places 5th in bass", () => {
    const inv = chordFactory.invert(cMajor, "second");
    expect(inv.pitches[0]!.midi).toBe(67); // G4 in bass
    expect(inv.pitches[1]!.midi).toBe(72); // C5
    expect(inv.pitches[2]!.midi).toBe(76); // E5
  });

  it("third inversion places 7th in bass", () => {
    const inv = chordFactory.invert(g7, "third");
    expect(inv.pitches[0]!.midi).toBe(77); // F5 in bass (m7 above G4 = 77)
    expect(inv.pitches[1]!.midi).toBe(79); // G5
    expect(inv.pitches[2]!.midi).toBe(83); // B5
    expect(inv.pitches[3]!.midi).toBe(86); // D6
  });

  it("throws RangeError for third inversion on a triad", () => {
    expect(() => chordFactory.invert(cMajor, "third")).toThrow(RangeError);
  });

  it("inversion property is updated on returned chord", () => {
    expect(chordFactory.invert(cMajor, "first").inversion).toBe("first");
    expect(chordFactory.invert(cMajor, "second").inversion).toBe("second");
    expect(chordFactory.invert(g7, "third").inversion).toBe("third");
  });
});

describe("ChordFactory.slash()", () => {
  const cMajor = chordFactory.triad(C4, "major");
  const E4 = pitchFactory.fromMidi(64);
  const A3 = pitchFactory.fromMidi(57);

  it("sets bassNote override on the chord", () => {
    const cOverE = chordFactory.slash(cMajor, E4);
    expect(cOverE.bassNote).toBeDefined();
    expect(cOverE.bassNote!.midi).toBe(64);
  });

  it("bassNote need not be a chord tone", () => {
    const cOverA = chordFactory.slash(cMajor, A3);
    expect(cOverA.bassNote!.midi).toBe(57); // A3 is not in C major
  });

  it("does not modify the original chord", () => {
    chordFactory.slash(cMajor, E4);
    expect(cMajor.bassNote).toBeUndefined();
  });
});
