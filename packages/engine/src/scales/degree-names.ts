// src/scales/degree-names.ts

/**
 * Style for scale degree naming.
 *
 * - `"functional"`  — tonic, supertonic, mediant, subdominant, dominant, submediant, leading-tone
 * - `"technical"`   — tonic, supertonic, mediant, subdominant, dominant, submediant, subtonic/leading-tone
 *                     (distinguishes b7 as "subtonic" vs natural 7 as "leading-tone")
 * - `"diatonic"`    — 1st, 2nd, 3rd, 4th, 5th, 6th, 7th
 * - `"solfege"`     — do, re, mi, fa, sol, la, ti (movable-do)
 * - `"solfege-fixed"` — do, re, mi, fa, sol, la, si (fixed-do, C=do)
 * - `"indian"`      — Sa, Re, Ga, Ma, Pa, Dha, Ni
 * - `"german"`      — Grundton, Sekunde, Terz, Quarte, Quinte, Sexte, Septime
 */
export type DegreeNameStyle =
    | "functional"
    | "technical"
    | "diatonic"
    | "solfege"
    | "solfege-fixed"
    | "indian"
    | "german";

export interface DegreeNameOptions {
    readonly style?: DegreeNameStyle;
}

// ---------------------------------------------------------------------------
// Name tables
// ---------------------------------------------------------------------------

const FUNCTIONAL_NAMES = [
    "tonic",
    "supertonic",
    "mediant",
    "subdominant",
    "dominant",
    "submediant",
    "leading-tone",
] as const;


const SOLFEGE = ["do", "re", "mi", "fa", "sol", "la", "ti"] as const;
const SOLFEGE_FIXED = ["do", "re", "mi", "fa", "sol", "la", "si"] as const;

const INDIAN = ["Sa", "Re", "Ga", "Ma", "Pa", "Dha", "Ni"] as const;

const GERMAN = [
    "Grundton",
    "Sekunde",
    "Terz",
    "Quarte",
    "Quinte",
    "Sexte",
    "Septime",
] as const;

// ---------------------------------------------------------------------------
// Name resolution
// ---------------------------------------------------------------------------

/**
 * Return the name for a scale degree given its index (0-based) and
 * interval relationship to the tonic.
 *
 * @param idx        0-based index in the scale (0 = tonic, 1 = 2nd, …)
 * @param semitones   semitones from tonic to this degree (from the pattern)
 * @param prevSemitones semitones from tonic to the previous degree (for context)
 * @param options     style options
 */
export function scaleDegreeName(
    idx: number,
    semitones: number,
    prevSemitones: number,
    options?: DegreeNameOptions,
): string {
    const style = options?.style ?? "functional";
    const normalizedIdx = idx % 7;

    switch (style) {
        case "functional":
            return FUNCTIONAL_NAMES[normalizedIdx]!;

        case "technical": {
            // For degree 7: "leading-tone" if 1 semitone below octave (11 semitones),
            // "subtonic" if whole step below octave (10 semitones)
            if (normalizedIdx === 6) {
                return semitones === 11 ? "leading-tone" : "subtonic";
            }
            // For degree 6: could distinguish "submediant" vs "superdominant" but usually same
            return [
                "tonic", "supertonic", "mediant", "subdominant",
                "dominant", "submediant", "subtonic",
            ][normalizedIdx]!;
        }

        case "diatonic":
            return ordinal(normalizedIdx + 1);

        case "solfege":
            return SOLFEGE[normalizedIdx]!;

        case "solfege-fixed":
            return SOLFEGE_FIXED[normalizedIdx]!;

        case "indian":
            return INDIAN[normalizedIdx]!;

        case "german":
            return GERMAN[normalizedIdx]!;
    }
}

// ---------------------------------------------------------------------------
// Extended: all 12 chromatic degrees
// ---------------------------------------------------------------------------

/**
 * Names for all 12 chromatic scale degrees relative to a key.
 * Used when a pitch is outside the diatonic scale.
 */
export function chromaticDegreeName(
    pitchClass: number,
    tonicPitchClass: number,
    style: DegreeNameStyle = "functional",
): string {
    const interval = ((pitchClass - tonicPitchClass) % 12 + 12) % 12;
    const base = [
        "tonic", "flat-supertonic", "supertonic", "flat-mediant",
        "mediant", "subdominant", "augmented-subdominant",
        "dominant", "flat-submediant", "submediant",
        "flat-subtonic", "leading-tone",
    ] as const;

    if (style === "diatonic") {
        const ordinals = [
            "1st", "♭2nd", "2nd", "♭3rd", "3rd", "4th",
            "♯4th", "5th", "♭6th", "6th", "♭7th", "7th",
        ] as const;
        return ordinals[interval]!;
    }

    return base[interval]!;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function ordinal(n: number): string {
    const s = String(n);
    if (s.endsWith("1") && n !== 11) return `${n}st`;
    if (s.endsWith("2") && n !== 12) return `${n}nd`;
    if (s.endsWith("3") && n !== 13) return `${n}rd`;
    return `${n}th`;
}