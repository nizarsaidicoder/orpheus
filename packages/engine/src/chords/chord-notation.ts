// src/chords/chord-notation.ts

import type { Chord, ChordQuality } from "./chord.ts";
import { spelledNoteNameToString } from "../primitives/note-name.ts";

// ---------------------------------------------------------------------------
// Notation presets
// ---------------------------------------------------------------------------

/**
 * Style presets for chord symbol rendering.
 *
 * - `"classical"` — Roman-numeral-adjacent: C, Cm, C°, C+, Cmaj7, Cø7, C°7
 * - `"jazz"`      — Lead-sheet style: C, C–, C°, C+, CΔ7, Cø7, C°7
 * - `"pop"`       — Explicit text: C, Cmin, Cdim, Caug, Cmaj7, Cmin7(♭5)
 * - `"german"`    — Classical German: C, c, c°, C+, Cj7, Ch7, cv7
 *   (uses case for major/minor, 'H' for B)
 */
export type ChordNotationStyle = "classical" | "jazz" | "pop" | "german";

/**
 * Full configuration for chord symbol rendering.
 * Pass to `chordToString()` to override the default classical style.
 */
export interface ChordNotationOptions {
    readonly style?: ChordNotationStyle;
    /** Character to separate root from quality (e.g. ":" for "C:m7"). Default: "". */
    readonly separator?: string;
    /** Use "m7♭5" instead of "ø7" for half-diminished. Default: varies by style. */
    readonly preferExplicitHalfDim?: boolean;
    /** Use ASCII-only characters (♭→b, ♯→#, °→o, ø→o). Default: false. */
    readonly asciiOnly?: boolean;
}

// ---------------------------------------------------------------------------
// Token tables per style
// ---------------------------------------------------------------------------

interface QualityTokens {
    major: string;
    minor: string;
    diminished: string;
    augmented: string;
    maj7: string;
    dom7: string;
    min7: string;
    halfDim7: string;
    dim7: string;
    minMaj7: string;
    augMaj7: string;
    dom9: string;
    maj9: string;
    min9: string;
    dom11: string;
    maj11: string;
    min11: string;
    dom13: string;
    maj13: string;
    min13: string;
    sus2: string;
    sus4: string;
    add9: string;
    add11: string;
    add13: string;
    minAdd9: string;
    minAdd11: string;
    minAdd13: string;
    dom7sus4: string;
    dom7sus2: string;
    maj7sus4: string;
    maj7sus2: string;
    maj9sus4: string;
    noThird: string;
    augMaj9: string;
    augMaj11: string;
    minMaj9: string;
    minMaj11: string;
    minMaj13: string;
    halfDim9: string;
    halfDim11: string;
    dimAdd11: string;
    dimAdd13: string;
    flat: (deg: number) => string;
    sharp: (deg: number) => string;
}

const CLASSICAL: QualityTokens = {
    major: "",
    minor: "m",
    diminished: "°",
    augmented: "+",
    maj7: "maj7",
    dom7: "7",
    min7: "m7",
    halfDim7: "ø7",
    dim7: "°7",
    minMaj7: "m(maj7)",
    augMaj7: "+maj7",
    dom9: "9",
    maj9: "maj9",
    min9: "m9",
    dom11: "11",
    maj11: "maj11",
    min11: "m11",
    dom13: "13",
    maj13: "maj13",
    min13: "m13",
    sus2: "sus2",
    sus4: "sus4",
    add9: "add9",
    add11: "add11",
    add13: "add13",
    minAdd9: "m(add9)",
    minAdd11: "m(add11)",
    minAdd13: "m(add13)",
    dom7sus4: "7sus4",
    dom7sus2: "7sus2",
    maj7sus4: "maj7sus4",
    maj7sus2: "maj7sus2",
    maj9sus4: "maj9sus4",
    noThird: "5",
    augMaj9: "+maj9",
    augMaj11: "+maj11",
    minMaj9: "m(maj9)",
    minMaj11: "m(maj11)",
    minMaj13: "m(maj13)",
    halfDim9: "ø9",
    halfDim11: "ø11",
    dimAdd11: "°(add11)",
    dimAdd13: "°(add13)",
    flat: (d) => `♭${d}`,
    sharp: (d) => `♯${d}`,
};

const JAZZ: QualityTokens = {
    ...CLASSICAL,
    major: "",
    minor: "–",        // en-dash
    min7: "–7",
    maj7: "Δ7",       // or "maj7" — both common, Δ covers both
    augmented: "+",
    halfDim7: "ø7",
    minAdd9: "–(add9)",
    minAdd11: "–(add11)",
    minAdd13: "–(add13)",
    min9: "–9",
    min11: "–11",
    min13: "–13",
};

const POP: QualityTokens = {
    ...CLASSICAL,
    minor: "min",
    diminished: "dim",
    augmented: "aug",
    maj7: "maj7",
    min7: "min7",
    dom7: "7",
    halfDim7: "m7(♭5)",   // pops default to explicit
    halfDim9: "m9(♭5)",
    halfDim11: "m11(♭5)",
    minAdd9: "min(add9)",
    minAdd11: "min(add11)",
    minAdd13: "min(add13)",
    minMaj7: "min(maj7)",
    minMaj9: "min(maj9)",
    minMaj11: "min(maj11)",
    minMaj13: "min(maj13)",
};

const GERMAN: QualityTokens = {
    ...CLASSICAL,
    major: "",         // uppercase root = major; handled in root rendering
    minor: "",         // lowercase root = minor
    diminished: "°",
    augmented: "+",
    maj7: "j7",       // "Cj7" = C major 7 (j = major in German)
    dom7: "7",
    min7: "7",        // "c7" = C minor 7 (lowercase = minor)
    dim7: "°7",       // "c°7" (diminished on minor not distinguished by case alone)
    halfDim7: "ø7",
    // German uses H for B, B for Bb — handled in root rendering
    flat: (d) => `♭${d}`,
    sharp: (d) => `♯${d}`,
};

const STYLES: Record<ChordNotationStyle, QualityTokens> = {
    classical: CLASSICAL,
    jazz: JAZZ,
    pop: POP,
    german: GERMAN,
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

const defaults: ChordNotationOptions = Object.freeze({ style: "classical" });

/**
 * Render a Chord as a human-readable chord symbol with configurable notation style.
 *
 * @example
 *   chordToString(chord)                           // "Cm7"
 *   chordToString(chord, { style: "jazz" })         // "C–7"
 *   chordToString(chord, { style: "pop" })           // "Cmin7"
 *   chordToString(chord, { asciiOnly: true })        // "Cm7" (ø→o, ♭→b)
 *   chordToString(chord, { style: "german" })        // "c7" (minor), "Cj7" (major)
 */
export function chordToString(chord: Chord, options: ChordNotationOptions = {}): string {
    const opts = { ...defaults, ...options };
    const t = STYLES[opts.style!];

    let rootName = spelledNoteNameToString(chord.root.spelling);

    // German: B → H, Bb → B, minor → lower case
    // In chordToString, german section:
    if (opts.style === "german") {
        rootName = germanizeNoteName(chord.root.spelling.letter, chord.root.spelling.accidental);
        if (isGermanMinor(chord.quality)) {
            rootName = rootName.charAt(0).toLowerCase() + rootName.slice(1);
        }
    }

    const qualityStr = renderQuality(chord.quality, t, opts);
    const sep = opts.separator ?? "";

    let result = `${rootName}${sep}${qualityStr}`;

    if (opts.asciiOnly) {
        result = asciify(result);
    }

    // Bass note
    if (chord.bassNote) {
        let bassName: string;
        if (opts.style === "german") {
            bassName = germanizeNoteName(chord.bassNote.spelling.letter, chord.bassNote.spelling.accidental);
        } else {
            bassName = spelledNoteNameToString(chord.bassNote.spelling);
        }
        if (opts.asciiOnly) bassName = asciify(bassName);
        result += `/${bassName}`;
    }

    return result;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function renderQuality(q: ChordQuality, t: QualityTokens, opts: ChordNotationOptions): string {
    switch (q.kind) {
        case "major": return t.major;
        case "minor": return t.minor;
        case "diminished": return t.diminished;
        case "augmented": return t.augmented;
        case "sus2": return t.sus2;
        case "sus4": return t.sus4;

        case "major7": return t.maj7;
        case "dominant7": return t.dom7;
        case "minor7": return t.min7;
        case "half-diminished7": return opts.preferExplicitHalfDim ? "m7(♭5)" : t.halfDim7;
        case "diminished7": return t.dim7;
        case "minor-major7": return t.minMaj7;
        case "augmented-major7": return t.augMaj7;

        case "dominant9": return t.dom9;
        case "major9": return t.maj9;
        case "minor9": return t.min9;

        case "dominant11": return t.dom11;
        case "major11": return t.maj11;
        case "minor11": return t.min11;

        case "dominant13": return t.dom13;
        case "major13": return t.maj13;
        case "minor13": return t.min13;

        case "add9": return t.add9;
        case "add11": return t.add11;
        case "add13": return t.add13;
        case "minor-add9": return t.minAdd9;
        case "minor-add11": return t.minAdd11;
        case "minor-add13": return t.minAdd13;

        case "dominant7sus4": return t.dom7sus4;
        case "dominant7sus2": return t.dom7sus2;
        case "major7sus4": return t.maj7sus4;
        case "major7sus2": return t.maj7sus2;
        case "major9sus4": return t.maj9sus4;

        case "no-third": return t.noThird;

        case "augmented-major9": return t.augMaj9;
        case "augmented-major11": return t.augMaj11;

        case "minor-major9": return t.minMaj9;
        case "minor-major11": return t.minMaj11;
        case "minor-major13": return t.minMaj13;

        case "half-diminished9": return t.halfDim9;
        case "half-diminished11": return t.halfDim11;

        case "diminished-add11": return t.dimAdd11;
        case "diminished-add13": return t.dimAdd13;

        case "altered": {
            const parts = q.alterations.map(a =>
                a.direction === "flat" ? t.flat(a.degree) : t.sharp(a.degree)
            );
            return `7(${parts.join(",")})`;
        }
    }
}

function isGermanMinor(q: ChordQuality): boolean {
    switch (q.kind) {
        case "minor": case "minor7": case "minor9": case "minor11": case "minor13":
        case "minor-add9": case "minor-add11": case "minor-add13":
        case "half-diminished7": case "half-diminished9": case "half-diminished11":
        case "diminished": case "diminished7":
        case "diminished-add11": case "diminished-add13":
        case "minor-major7": case "minor-major9": case "minor-major11": case "minor-major13":
            return true;
        default:
            return false;
    }
}

function asciify(s: string): string {
    return s
        .replace(/♭/g, "b")
        .replace(/♯/g, "#")
        .replace(/°/g, "o")
        .replace(/ø/g, "o")
        .replace(/Δ/g, "maj")
        .replace(/–/g, "-");
}

function germanizeNoteName(letter: number, accidental: number): string {
    // German: B♮ = H, B♭ = B, A# = B, Eb = Es, Ab = As
    const naturalNames = ["C", "D", "E", "F", "G", "A", "H"];
    const flatNames = ["C", "D", "E", "F", "G", "A", "B"];  // Bb → B

    const isFlat = accidental === -1;
    const base = isFlat ? flatNames[letter]! : naturalNames[letter]!;

    if (accidental === 1) {
        return base + "is";       // C# = Cis, F# = Fis
    }
    if (accidental === -2) {
        return base + "es";       // Dbb = Deses (simplified)
    }
    if (accidental === 2) {
        return base + "isis";
    }

    // Special case: Eb = Es, Ab = As
    if (letter === 2 && accidental === -1) return "Es";   // Eb
    if (letter === 5 && accidental === -1) return "As";   // Ab
    if (letter === 3 && accidental === -1) return "Fes";  // Fb (rare)
    if (letter === 0 && accidental === -1) return "Ces";  // Cb (rare)

    return base;
}