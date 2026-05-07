/**
 * The seven diatonic note letter names.
 * Ordered C=0 through B=6 to enable diatonic interval arithmetic.
 */
export enum NoteLetter {
  C = 0,
  D = 1,
  E = 2,
  F = 3,
  G = 4,
  A = 5,
  B = 6,
}

/**
 * Accidental expressed as a semitone offset from the natural note.
 * Supports double-sharp and double-flat for enharmonic respelling in any key.
 */
export enum Accidental {
  DoubleFlat  = -2,
  Flat        = -1,
  Natural     =  0,
  Sharp       =  1,
  DoubleSharp =  2,
}

/**
 * A fully spelled note name. Immutable value object.
 * Carries both letter and accidental so harmonic context is never lost.
 *
 * @example { letter: NoteLetter.G, accidental: Accidental.Sharp }  // G#
 * @example { letter: NoteLetter.A, accidental: Accidental.Flat }   // Ab
 */
export interface SpelledNoteName {
  readonly letter:     NoteLetter;
  readonly accidental: Accidental;
}

/**
 * Lookup table: pitch class (0–11) → one or more enharmonic spellings.
 * Tuple type ensures at least one spelling always exists per pitch class.
 */
export type PitchClassSpellingTable = Readonly<
  Record<number, readonly [SpelledNoteName, ...SpelledNoteName[]]>
>;

/** Render a SpelledNoteName as a human-readable string, e.g. "G#", "Ab", "C". */
export function spelledNoteNameToString(name: SpelledNoteName): string {
  const letters = ["C", "D", "E", "F", "G", "A", "B"] as const;
  const accidentals: Record<Accidental, string> = {
    [Accidental.DoubleFlat]:  "bb",
    [Accidental.Flat]:        "b",
    [Accidental.Natural]:     "",
    [Accidental.Sharp]:       "#",
    [Accidental.DoubleSharp]: "##",
  };
  return `${letters[name.letter]}${accidentals[name.accidental]}`;
}

/** Returns true if two SpelledNoteNames are identical (same letter AND accidental). */
export function spelledNoteNamesEqual(a: SpelledNoteName, b: SpelledNoteName): boolean {
  return a.letter === b.letter && a.accidental === b.accidental;
}
