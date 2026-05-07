import { Accidental, NoteLetter } from "../primitives/note-name.ts";
import type { SpelledNoteName } from "../primitives/note-name.ts";

/**
 * Maps each pitch class (0–11) to its preferred spellings.
 * Index 0 = sharp/natural spelling, Index 1 = flat spelling (where both exist).
 *
 * Used by PitchFactory.fromMidi (default sharp preference) and
 * Key.spellPitchClass (context-aware selection).
 */
export const ENHARMONIC_TABLE: Readonly<Record<number, readonly SpelledNoteName[]>> = Object.freeze({
  0:  [{ letter: NoteLetter.C, accidental: Accidental.Natural }],
  1:  [
        { letter: NoteLetter.C, accidental: Accidental.Sharp },
        { letter: NoteLetter.D, accidental: Accidental.Flat },
      ],
  2:  [{ letter: NoteLetter.D, accidental: Accidental.Natural }],
  3:  [
        { letter: NoteLetter.D, accidental: Accidental.Sharp },
        { letter: NoteLetter.E, accidental: Accidental.Flat },
      ],
  4:  [{ letter: NoteLetter.E, accidental: Accidental.Natural }],
  5:  [{ letter: NoteLetter.F, accidental: Accidental.Natural }],
  6:  [
        { letter: NoteLetter.F, accidental: Accidental.Sharp },
        { letter: NoteLetter.G, accidental: Accidental.Flat },
      ],
  7:  [{ letter: NoteLetter.G, accidental: Accidental.Natural }],
  8:  [
        { letter: NoteLetter.G, accidental: Accidental.Sharp },
        { letter: NoteLetter.A, accidental: Accidental.Flat },
      ],
  9:  [{ letter: NoteLetter.A, accidental: Accidental.Natural }],
  10: [
        { letter: NoteLetter.A, accidental: Accidental.Sharp },
        { letter: NoteLetter.B, accidental: Accidental.Flat },
      ],
  11: [{ letter: NoteLetter.B, accidental: Accidental.Natural }],
});

/**
 * Given a SpelledNoteName, return its enharmonic equivalent.
 * If no standard enharmonic equivalent exists (e.g. C natural), returns the same spelling.
 */
export function enharmonicEquivalentOf(spelling: SpelledNoteName): SpelledNoteName {
  const pc = spellingToPitchClass(spelling);
  const options = ENHARMONIC_TABLE[pc];
  if (options === undefined || options.length < 2) return spelling;
  const other = options.find(
    (s) => s.letter !== spelling.letter || s.accidental !== spelling.accidental
  );
  return other ?? spelling;
}

/** Convert a SpelledNoteName to its chromatic pitch class (0–11), ignoring octave. */
export function spellingToPitchClass(spelling: SpelledNoteName): number {
  const naturalPc: Record<NoteLetter, number> = {
    [NoteLetter.C]: 0,
    [NoteLetter.D]: 2,
    [NoteLetter.E]: 4,
    [NoteLetter.F]: 5,
    [NoteLetter.G]: 7,
    [NoteLetter.A]: 9,
    [NoteLetter.B]: 11,
  };
  return ((naturalPc[spelling.letter] + spelling.accidental) % 12 + 12) % 12;
}
