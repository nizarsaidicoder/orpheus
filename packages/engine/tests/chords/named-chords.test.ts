import { describe, it, expect } from "vitest";
import { chordFactory } from "../../src/chords/chord-factory.ts";
import { pitchFactory } from "../../src/primitives/pitch.ts";

const C4 = pitchFactory.fromMidi(60); // C4 = midi 60
const G4 = pitchFactory.fromMidi(67); // G4 = midi 67

describe("chordFactory.fromName() — throws on unknown", () => {
  it("throws RangeError for unknown name", () => {
    expect(() => chordFactory.fromName("notachord", C4)).toThrow(RangeError);
  });
});

describe("chordFactory.fromName() — direct quality aliases", () => {
  it("min7: [C, Eb, G, Bb]", () => {
    const c = chordFactory.fromName("min7", C4);
    expect(c.pitches.map(p => p.midi)).toEqual([60, 63, 67, 70]);
  });

  it("min: [C, Eb, G]", () => {
    const c = chordFactory.fromName("min", C4);
    expect(c.pitches.map(p => p.midi)).toEqual([60, 63, 67]);
  });

  it("7: [C, E, G, Bb]", () => {
    const c = chordFactory.fromName("7", C4);
    expect(c.pitches.map(p => p.midi)).toEqual([60, 64, 67, 70]);
  });

  it("dim: [C, Eb, Gb]", () => {
    const c = chordFactory.fromName("dim", C4);
    expect(c.pitches.map(p => p.midi)).toEqual([60, 63, 66]);
  });

  it("aug: [C, E, G#]", () => {
    const c = chordFactory.fromName("aug", C4);
    expect(c.pitches.map(p => p.midi)).toEqual([60, 64, 68]);
  });

  it("maj7: [C, E, G, B]", () => {
    const c = chordFactory.fromName("maj7", C4);
    expect(c.pitches.map(p => p.midi)).toEqual([60, 64, 67, 71]);
  });

  it("sus4: [C, F, G]", () => {
    const c = chordFactory.fromName("sus4", C4);
    expect(c.pitches.map(p => p.midi)).toEqual([60, 65, 67]);
  });

  it("sus2: [C, D, G]", () => {
    const c = chordFactory.fromName("sus2", C4);
    expect(c.pitches.map(p => p.midi)).toEqual([60, 62, 67]);
  });

  it("9: [C, E, G, Bb, D]", () => {
    const c = chordFactory.fromName("9", C4);
    expect(c.pitches.map(p => p.midi)).toEqual([60, 64, 67, 70, 74]);
  });

  it("dim7: [C, Eb, Gb, Bb] (half-diminished)", () => {
    const c = chordFactory.fromName("dim7", C4);
    expect(c.pitches.map(p => p.midi)).toEqual([60, 63, 66, 70]);
  });

  it("dimb7: [C, Eb, Gb, Bbb] (fully diminished)", () => {
    const c = chordFactory.fromName("dimb7", C4);
    expect(c.pitches.map(p => p.midi)).toEqual([60, 63, 66, 69]);
  });

  it("minmaj7: [C, Eb, G, B]", () => {
    const c = chordFactory.fromName("minmaj7", C4);
    expect(c.pitches.map(p => p.midi)).toEqual([60, 63, 67, 71]);
  });

  it("augmaj7: [C, E, G#, B]", () => {
    const c = chordFactory.fromName("augmaj7", C4);
    expect(c.pitches.map(p => p.midi)).toEqual([60, 64, 68, 71]);
  });
});

describe("chordFactory.fromName() — add-tone chords", () => {
  it("add9: [C, E, G, D]", () => {
    const c = chordFactory.fromName("add9", C4);
    expect(c.pitches.map(p => p.midi)).toEqual([60, 64, 67, 74]);
  });

  it("add11: [C, E, G, F]", () => {
    const c = chordFactory.fromName("add11", C4);
    expect(c.pitches.map(p => p.midi)).toEqual([60, 64, 67, 77]);
  });

  it("add13: [C, E, G, A] (major 6, close voicing)", () => {
    const c = chordFactory.fromName("add13", C4);
    expect(c.pitches.map(p => p.midi)).toEqual([60, 64, 67, 69]);
  });

  it("minadd9: [C, Eb, G, D]", () => {
    const c = chordFactory.fromName("minadd9", C4);
    expect(c.pitches.map(p => p.midi)).toEqual([60, 63, 67, 74]);
  });

  it("minadd11: [C, Eb, G, F]", () => {
    const c = chordFactory.fromName("minadd11", C4);
    expect(c.pitches.map(p => p.midi)).toEqual([60, 63, 67, 77]);
  });

  it("minadd13: [C, Eb, G, A] (minor 6, close voicing)", () => {
    const c = chordFactory.fromName("minadd13", C4);
    expect(c.pitches.map(p => p.midi)).toEqual([60, 63, 67, 69]);
  });
});

describe("chordFactory.fromName() — sus + 7th/maj7", () => {
  it("7sus4: [C, F, G, Bb]", () => {
    const c = chordFactory.fromName("7sus4", C4);
    expect(c.pitches.map(p => p.midi)).toEqual([60, 65, 67, 70]);
  });

  it("7sus2: [C, D, G, Bb]", () => {
    const c = chordFactory.fromName("7sus2", C4);
    expect(c.pitches.map(p => p.midi)).toEqual([60, 62, 67, 70]);
  });

  it("maj7sus4: [C, F, G, B]", () => {
    const c = chordFactory.fromName("maj7sus4", C4);
    expect(c.pitches.map(p => p.midi)).toEqual([60, 65, 67, 71]);
  });

  it("maj7sus2: [C, D, G, B]", () => {
    const c = chordFactory.fromName("maj7sus2", C4);
    expect(c.pitches.map(p => p.midi)).toEqual([60, 62, 67, 71]);
  });

  it("maj9sus4: [C, F, G, B, D]", () => {
    const c = chordFactory.fromName("maj9sus4", C4);
    expect(c.pitches.map(p => p.midi)).toEqual([60, 65, 67, 71, 74]);
  });
});

describe("chordFactory.fromName() — no-third", () => {
  it("no3d: [C, G] (power chord)", () => {
    const c = chordFactory.fromName("no3d", C4);
    expect(c.pitches.map(p => p.midi)).toEqual([60, 67]);
  });
});

describe("chordFactory.fromName() — augmented extended", () => {
  it("augmaj9: [C, E, G#, B, D]", () => {
    const c = chordFactory.fromName("augmaj9", C4);
    expect(c.pitches.map(p => p.midi)).toEqual([60, 64, 68, 71, 74]);
  });

  it("augmaj11: [C, E, G#, B, D, F#]", () => {
    const c = chordFactory.fromName("augmaj11", C4);
    expect(c.pitches.map(p => p.midi)).toEqual([60, 64, 68, 71, 74, 78]);
  });
});

describe("chordFactory.fromName() — minor-major extended", () => {
  it("minmaj9: [C, Eb, G, B, D]", () => {
    const c = chordFactory.fromName("minmaj9", C4);
    expect(c.pitches.map(p => p.midi)).toEqual([60, 63, 67, 71, 74]);
  });

  it("minmaj11: [C, Eb, G, B, D, F]", () => {
    const c = chordFactory.fromName("minmaj11", C4);
    expect(c.pitches.map(p => p.midi)).toEqual([60, 63, 67, 71, 74, 77]);
  });

  it("minmaj13: [C, Eb, G, B, D, F, A]", () => {
    const c = chordFactory.fromName("minmaj13", C4);
    expect(c.pitches.map(p => p.midi)).toEqual([60, 63, 67, 71, 74, 77, 81]);
  });
});

describe("chordFactory.fromName() — half-diminished extended", () => {
  it("dim9: [C, Eb, Gb, Bb, D] (half-dim 9)", () => {
    const c = chordFactory.fromName("dim9", C4);
    expect(c.pitches.map(p => p.midi)).toEqual([60, 63, 66, 70, 74]);
  });

  it("dim11: [C, Eb, Gb, Bb, D, F] (half-dim 11)", () => {
    const c = chordFactory.fromName("dim11", C4);
    expect(c.pitches.map(p => p.midi)).toEqual([60, 63, 66, 70, 74, 77]);
  });
});

describe("chordFactory.fromName() — diminished add-tone", () => {
  it("dimadd11: [C, Eb, Gb, F]", () => {
    const c = chordFactory.fromName("dimadd11", C4);
    expect(c.pitches.map(p => p.midi)).toEqual([60, 63, 66, 77]);
  });

  it("dimadd13: [C, Eb, Gb, A] (dim + add 6)", () => {
    const c = chordFactory.fromName("dimadd13", C4);
    expect(c.pitches.map(p => p.midi)).toEqual([60, 63, 66, 69]);
  });
});

describe("chordFactory.fromName() — altered dominant variants", () => {
  it("7b9 (G): [G, B, D, F, Ab]", () => {
    const c = chordFactory.fromName("7b9", G4);
    expect(c.pitches.map(p => p.midi)).toEqual([67, 71, 74, 77, 80]);
  });

  it("majs9 (G): [G, B, D, F, A#] (dom7 #9)", () => {
    const c = chordFactory.fromName("majs9", G4);
    expect(c.pitches.map(p => p.midi)).toEqual([67, 71, 74, 77, 82]);
  });

  it("11s (C): [C, E, G, Bb, D, F#] (dom7 #11)", () => {
    const c = chordFactory.fromName("11s", C4);
    expect(c.pitches.map(p => p.midi)).toEqual([60, 64, 67, 70, 74, 78]);
  });

  it("majs911s (C): [C, E, G, Bb, D#, F#] (dom7 #9 #11)", () => {
    const c = chordFactory.fromName("majs911s", C4);
    expect(c.pitches.map(p => p.midi)).toEqual([60, 64, 67, 70, 75, 78]);
  });

  it("13b9 (C): [C, E, G, Bb, Db, F, A]", () => {
    const c = chordFactory.fromName("13b9", C4);
    expect(c.pitches.map(p => p.midi)).toEqual([60, 64, 67, 70, 73, 77, 81]);
  });

  it("11b9 (C): [C, E, G, Bb, Db, F]", () => {
    const c = chordFactory.fromName("11b9", C4);
    expect(c.pitches.map(p => p.midi)).toEqual([60, 64, 67, 70, 73, 77]);
  });

  it("13b (C): [C, E, G, Bb, D, F, Ab] (dom13 b13)", () => {
    const c = chordFactory.fromName("13b", C4);
    expect(c.pitches.map(p => p.midi)).toEqual([60, 64, 67, 70, 74, 77, 80]);
  });
});

describe("chordFactory.fromName() — major with alterations", () => {
  it("maj911s (C): [C, E, G, B, D, F#]", () => {
    const c = chordFactory.fromName("maj911s", C4);
    expect(c.pitches.map(p => p.midi)).toEqual([60, 64, 67, 71, 74, 78]);
  });

  it("maj1311s (C): [C, E, G, B, D, F#, A]", () => {
    const c = chordFactory.fromName("maj1311s", C4);
    expect(c.pitches.map(p => p.midi)).toEqual([60, 64, 67, 71, 74, 78, 81]);
  });
});

describe("chordFactory.fromName() — minor with alterations", () => {
  it("minb9 (C): [C, Eb, G, Bb, Db]", () => {
    const c = chordFactory.fromName("minb9", C4);
    expect(c.pitches.map(p => p.midi)).toEqual([60, 63, 67, 70, 73]);
  });

  it("min1113b (C): [C, Eb, G, Bb, D, F, Ab]", () => {
    const c = chordFactory.fromName("min1113b", C4);
    expect(c.pitches.map(p => p.midi)).toEqual([60, 63, 67, 70, 74, 77, 80]);
  });
});

describe("chordFactory.fromName() — half-diminished with alterations", () => {
  it("dimb9 (C): [C, Eb, Gb, Bb, Db]", () => {
    const c = chordFactory.fromName("dimb9", C4);
    expect(c.pitches.map(p => p.midi)).toEqual([60, 63, 66, 70, 73]);
  });

  it("dim11b9 (C): [C, Eb, Gb, Bb, Db, F]", () => {
    const c = chordFactory.fromName("dim11b9", C4);
    expect(c.pitches.map(p => p.midi)).toEqual([60, 63, 66, 70, 73, 77]);
  });

  it("dim13b9 (C): [C, Eb, Gb, Bb, Db, F, A]", () => {
    const c = chordFactory.fromName("dim13b9", C4);
    expect(c.pitches.map(p => p.midi)).toEqual([60, 63, 66, 70, 73, 77, 81]);
  });
});

describe("chordFactory.fromName() — quality field is set", () => {
  it("min7 quality.kind = 'minor7'", () => {
    const c = chordFactory.fromName("min7", C4);
    expect(c.quality.kind).toBe("minor7");
  });

  it("7b9 quality.kind = 'altered'", () => {
    const c = chordFactory.fromName("7b9", C4);
    expect(c.quality.kind).toBe("altered");
  });

  it("add9 quality.kind = 'add9'", () => {
    const c = chordFactory.fromName("add9", C4);
    expect(c.quality.kind).toBe("add9");
  });
});
