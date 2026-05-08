import { describe, it, expect } from "vitest";
import { chordToString } from "../../src/chords/chord-notation.ts";
import { chordFactory } from "../../src/chords/chord-factory.ts";
import { pitchFactory } from "../../src/primitives/pitch.ts";
import { NoteLetter, Accidental } from "../../src/primitives/note-name.ts";

function note(letter: NoteLetter, acc: Accidental = Accidental.Natural, octave = 4) {
    return pitchFactory.fromSpelling({ letter, accidental: acc }, octave);
}

const C4 = note(NoteLetter.C);
const G4 = note(NoteLetter.G);

// ── Classical (default) ───────────────────────────────────────────────────────

describe("chordToString — classical style", () => {
    it("C major → 'C'", () => {
        expect(chordToString(chordFactory.triad(C4, "major"))).toBe("C");
    });
    it("C minor → 'Cm'", () => {
        expect(chordToString(chordFactory.triad(C4, "minor"))).toBe("Cm");
    });
    it("C diminished → 'C°'", () => {
        expect(chordToString(chordFactory.triad(C4, "diminished"))).toBe("C°");
    });
    it("C augmented → 'C+'", () => {
        expect(chordToString(chordFactory.triad(C4, "augmented"))).toBe("C+");
    });
    it("C sus2 → 'Csus2'", () => {
        expect(chordToString(chordFactory.triad(C4, "sus2"))).toBe("Csus2");
    });
    it("C sus4 → 'Csus4'", () => {
        expect(chordToString(chordFactory.triad(C4, "sus4"))).toBe("Csus4");
    });

    it("C major7 → 'Cmaj7'", () => {
        expect(chordToString(chordFactory.seventh(C4, "major7"))).toBe("Cmaj7");
    });
    it("C dominant7 → 'C7'", () => {
        expect(chordToString(chordFactory.seventh(C4, "dominant7"))).toBe("C7");
    });
    it("C minor7 → 'Cm7'", () => {
        expect(chordToString(chordFactory.seventh(C4, "minor7"))).toBe("Cm7");
    });
    it("C half-diminished7 → 'Cø7'", () => {
        expect(chordToString(chordFactory.seventh(C4, "half-diminished7"))).toBe("Cø7");
    });
    it("C diminished7 → 'C°7'", () => {
        expect(chordToString(chordFactory.seventh(C4, "diminished7"))).toBe("C°7");
    });
    it("C minor-major7 → 'Cm(maj7)'", () => {
        expect(chordToString(chordFactory.seventh(C4, "minor-major7"))).toBe("Cm(maj7)");
    });
    it("C augmented-major7 → 'C+maj7'", () => {
        expect(chordToString(chordFactory.seventh(C4, "augmented-major7"))).toBe("C+maj7");
    });

    it("C dominant9 → 'C9'", () => {
        expect(chordToString(chordFactory.fromName("9", C4))).toBe("C9");
    });
    it("C major9 → 'Cmaj9'", () => {
        expect(chordToString(chordFactory.fromName("maj9", C4))).toBe("Cmaj9");
    });
    it("C add9 → 'Cadd9'", () => {
        expect(chordToString(chordFactory.fromName("add9", C4))).toBe("Cadd9");
    });

    it("C7sus4 → 'C7sus4'", () => {
        expect(chordToString(chordFactory.fromName("7sus4", C4))).toBe("C7sus4");
    });

    it("C no-third → 'C5'", () => {
        expect(chordToString(chordFactory.fromName("no3d", C4))).toBe("C5");
    });
});

// ── Jazz style ────────────────────────────────────────────────────────────────

describe("chordToString — jazz style", () => {
    const opts = { style: "jazz" as const };

    it("C minor → 'C–'", () => {
        expect(chordToString(chordFactory.triad(C4, "minor"), opts)).toBe("C–");
    });
    it("C major7 → 'CΔ7'", () => {
        expect(chordToString(chordFactory.seventh(C4, "major7"), opts)).toBe("CΔ7");
    });
    it("C minor7 → 'C–7'", () => {
        expect(chordToString(chordFactory.seventh(C4, "minor7"), opts)).toBe("C–7");
    });
    it("C minor9 → 'C–9'", () => {
        expect(chordToString(chordFactory.fromName("min9", C4), opts)).toBe("C–9");
    });
});

// ── Pop style ─────────────────────────────────────────────────────────────────

describe("chordToString — pop style", () => {
    const opts = { style: "pop" as const };

    it("C minor → 'Cmin'", () => {
        expect(chordToString(chordFactory.triad(C4, "minor"), opts)).toBe("Cmin");
    });
    it("C diminished → 'Cdim'", () => {
        expect(chordToString(chordFactory.triad(C4, "diminished"), opts)).toBe("Cdim");
    });
    it("C augmented → 'Caug'", () => {
        expect(chordToString(chordFactory.triad(C4, "augmented"), opts)).toBe("Caug");
    });
    it("C half-diminished7 → 'Cm7(♭5)'", () => {
        expect(chordToString(chordFactory.seventh(C4, "half-diminished7"), opts)).toBe("Cm7(♭5)");
    });
    it("C minor7 → 'Cmin7'", () => {
        expect(chordToString(chordFactory.seventh(C4, "minor7"), opts)).toBe("Cmin7");
    });
});

// ── German style ──────────────────────────────────────────────────────────────

describe("chordToString — german style", () => {
    const opts = { style: "german" as const };

    it("C major → 'C'", () => {
        expect(chordToString(chordFactory.triad(C4, "major"), opts)).toBe("C");
    });
    it("C minor → 'c'", () => {
        expect(chordToString(chordFactory.triad(C4, "minor"), opts)).toBe("c");
    });
    it("B major → 'H'", () => {
        const bMaj = chordFactory.triad(note(NoteLetter.B), "major");
        expect(chordToString(bMaj, opts)).toBe("H");
    });
    it("Bb major → 'B'", () => {
        const bbMaj = chordFactory.triad(note(NoteLetter.B, Accidental.Flat), "major");
        expect(chordToString(bbMaj, opts)).toBe("B");
    });
    it("B minor → 'h'", () => {
        const bMin = chordFactory.triad(note(NoteLetter.B), "minor");
        expect(chordToString(bMin, opts)).toBe("h");
    });
    it("C major7 → 'Cj7'", () => {
        expect(chordToString(chordFactory.seventh(C4, "major7"), opts)).toBe("Cj7");
    });
    it("C minor7 → 'c7'", () => {
        expect(chordToString(chordFactory.seventh(C4, "minor7"), opts)).toBe("c7");
    });
});

// ── ASCII-only ────────────────────────────────────────────────────────────────

describe("chordToString — asciiOnly", () => {
    const opts = { asciiOnly: true as const };

    it("C diminished → 'Co'", () => {
        expect(chordToString(chordFactory.triad(C4, "diminished"), opts)).toBe("Co");
    });
    it("C half-diminished7 → 'Co7'", () => {
        expect(chordToString(chordFactory.seventh(C4, "half-diminished7"), opts)).toBe("Co7");
    });
    it("C7♭9 → 'C7(b9)'", () => {
        const c = chordFactory.fromName("7b9", C4);
        expect(chordToString(c, opts)).toBe("C7(b9)");
    });
});

// ── Explicit half-diminished ──────────────────────────────────────────────────

describe("chordToString — preferExplicitHalfDim", () => {
    const opts = { preferExplicitHalfDim: true as const };

    it("C half-diminished7 → 'Cm7(♭5)' even in classical style", () => {
        expect(chordToString(chordFactory.seventh(C4, "half-diminished7"), opts)).toBe("Cm7(♭5)");
    });
});

// ── Altered dominants ─────────────────────────────────────────────────────────

describe("chordToString — altered dominants", () => {
    it("G7♭9 → 'G7(♭9)'", () => {
        const c = chordFactory.fromName("7b9", G4);
        expect(chordToString(c)).toBe("G7(♭9)");
    });

    it("G7♯9 → 'G7(♯9)'", () => {
        const c = chordFactory.fromName("majs9", G4);
        expect(chordToString(c)).toBe("G7(♯9)");
    });

    it("C7♯11 → 'C7(♯11)'", () => {
        const c = chordFactory.fromName("11s", C4);
        expect(chordToString(c)).toBe("C7(♯11)");
    });
});

// ── Slash chords ──────────────────────────────────────────────────────────────

describe("chordToString — slash chords", () => {
    it("C/E → 'C/E'", () => {
        const c = chordFactory.triad(C4, "major");
        const e = note(NoteLetter.E);
        expect(chordToString(chordFactory.slash(c, e))).toBe("C/E");
    });

    it("G7/F → 'G7/F'", () => {
        const g7 = chordFactory.seventh(G4, "dominant7");
        const f = note(NoteLetter.F);
        expect(chordToString(chordFactory.slash(g7, f))).toBe("G7/F");
    });
});

// ── Separator ─────────────────────────────────────────────────────────────────

describe("chordToString — separator option", () => {
    it("Cm with separator ':' → 'C:m'", () => {
        expect(chordToString(chordFactory.triad(C4, "minor"), { separator: ":" })).toBe("C:m");
    });
});