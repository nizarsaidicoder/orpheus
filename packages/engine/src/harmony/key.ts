import type { Pitch } from "../primitives/pitch.ts";
import type { SpelledNoteName } from "../primitives/note-name.ts";
import type { Scale } from "../scales/scale.ts";
import { NoteLetter, Accidental, spelledNoteNamesEqual } from "../primitives/note-name.ts";
import { pitchFactory } from "../primitives/pitch.ts";
import { scaleFactory } from "../scales/scale.ts";
import { MAJOR_PATTERN, NATURAL_MINOR_PATTERN } from "../scales/diatonic.ts";
import { ENHARMONIC_TABLE, spellingToPitchClass } from "../utils/enharmonic.ts";

/**
 * Modality of a key.
 * Kept separate from ScaleCategory so "key of A minor" is independent
 * of whether harmonic, melodic, or natural minor is used.
 */
export type Modality = "major" | "minor";

/**
 * A musical key: a tonic pitch + modality.
 *
 * The key signature (sharps/flats) is derived from tonic + modality via
 * the circle of fifths. Key values are immutable; navigation properties
 * (relative, parallel, enharmonicEquivalent) return pre-computed Key instances.
 */
export interface Key {
  readonly tonic:    Pitch;
  readonly modality: Modality;

  /**
   * Number of sharps (+) or flats (−) in the key signature.
   * C major = 0, G major = +1, F major = −1, F# major = +6, Gb major = −6.
   */
  readonly signature: number;

  /**
   * The scale most naturally associated with this key.
   * Major → Ionian (major scale). Minor → Aeolian (natural minor).
   */
  naturalScale: Scale;

  /**
   * The relative key: same key signature, different tonic and modality.
   * C major ↔ A minor. G major ↔ E minor.
   */
  readonly relative: Key;

  /**
   * The parallel key: same tonic, opposite modality.
   * C major ↔ C minor. A major ↔ A minor.
   */
  readonly parallel: Key;

  /**
   * The enharmonic respelling of this key (only differs for keys with 5+ accidentals).
   * F# major ↔ Gb major. B major ↔ Cb major. C# major ↔ Db major.
   * Keys with no enharmonic equivalent return themselves.
   */
  readonly enharmonicEquivalent: Key;

  /**
   * Return the correct diatonic spelling for any MIDI pitch class in this key's context.
   * This is the critical method for enharmonic disambiguation:
   *   - In D major, pitch class 6 (F#/Gb) → F#
   *   - In Gb major, pitch class 6 → Gb
   *
   * @param pitchClass integer in [0, 11]
   */
  spellPitchClass(pitchClass: number): SpelledNoteName;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const LETTER_ORDER = [
  NoteLetter.C, NoteLetter.D, NoteLetter.E, NoteLetter.F,
  NoteLetter.G, NoteLetter.A, NoteLetter.B,
] as const;

export const NATURAL_PC: Readonly<Record<NoteLetter, number>> = {
  [NoteLetter.C]: 0, [NoteLetter.D]: 2, [NoteLetter.E]: 4,
  [NoteLetter.F]: 5, [NoteLetter.G]: 7, [NoteLetter.A]: 9, [NoteLetter.B]: 11,
};

function buildKeySpellings(
  tonicSpelling: SpelledNoteName,
  scaleIntervals: ReadonlyArray<number>,
): Record<number, SpelledNoteName> {
  const tonicPC = spellingToPitchClass(tonicSpelling);
  const tonicLetterIdx = LETTER_ORDER.indexOf(tonicSpelling.letter);
  const result: Record<number, SpelledNoteName> = {};
  for (let i = 0; i < scaleIntervals.length; i++) {
    const letterIdx = (tonicLetterIdx + i) % 7;
    const letter = LETTER_ORDER[letterIdx]!;
    /* c8 ignore next */
    const targetPC = (tonicPC + (scaleIntervals[i] ?? 0)) % 12;
    const naturalLetterPC = NATURAL_PC[letter];
    let acc = targetPC - naturalLetterPC;
    if (acc > 6)  acc -= 12;
    if (acc < -6) acc += 12;
    result[targetPC] = { letter, accidental: acc as Accidental };
  }
  return result;
}

// ---------------------------------------------------------------------------
// Concrete Key class — circular refs (relative/parallel/enharmonicEquivalent)
// set in a second pass via the factory.
// ---------------------------------------------------------------------------

class ConcreteKey implements Key {
  readonly tonic:        Pitch;
  readonly modality:     Modality;
  readonly signature: number;
  private readonly _spellings: Record<number, SpelledNoteName>;
  private _naturalScale: Scale | undefined;


  relative!:             Key;
  parallel!:             Key;
  enharmonicEquivalent!: Key;

  constructor(
    tonic: Pitch,
    modality: Modality,
    signature: number,
    spellings: Record<number, SpelledNoteName>,
  ) {
    this.tonic = tonic;
    this.modality = modality;
    this.signature = signature;
    this._spellings = spellings;
  }

  spellPitchClass(pitchClass: number): SpelledNoteName {
    const pc = ((pitchClass % 12) + 12) % 12;
    const spelled = this._spellings[pc];
    if (spelled !== undefined) return spelled;
    const options = ENHARMONIC_TABLE[pc]!;
    return this.signature >= 0 ? options[0]! : (options[1] ?? options[0]!);
  }
  get naturalScale(): Scale {
    if (!this._naturalScale) {
      this._naturalScale = scaleFactory.build(
        this.modality === "major" ? MAJOR_PATTERN : NATURAL_MINOR_PATTERN,
        this.tonic,
      );
    }
    return this._naturalScale;
  }
}

// ---------------------------------------------------------------------------
// Key table: 15 major + 15 minor, indexed by (signature + 7) ∈ [0,14]
// ---------------------------------------------------------------------------

const MAJOR_TONICS: readonly SpelledNoteName[] = [
  { letter: NoteLetter.C, accidental: Accidental.Flat    }, // sig -7: Cb
  { letter: NoteLetter.G, accidental: Accidental.Flat    }, // sig -6: Gb
  { letter: NoteLetter.D, accidental: Accidental.Flat    }, // sig -5: Db
  { letter: NoteLetter.A, accidental: Accidental.Flat    }, // sig -4: Ab
  { letter: NoteLetter.E, accidental: Accidental.Flat    }, // sig -3: Eb
  { letter: NoteLetter.B, accidental: Accidental.Flat    }, // sig -2: Bb
  { letter: NoteLetter.F, accidental: Accidental.Natural }, // sig -1: F
  { letter: NoteLetter.C, accidental: Accidental.Natural }, // sig  0: C
  { letter: NoteLetter.G, accidental: Accidental.Natural }, // sig +1: G
  { letter: NoteLetter.D, accidental: Accidental.Natural }, // sig +2: D
  { letter: NoteLetter.A, accidental: Accidental.Natural }, // sig +3: A
  { letter: NoteLetter.E, accidental: Accidental.Natural }, // sig +4: E
  { letter: NoteLetter.B, accidental: Accidental.Natural }, // sig +5: B
  { letter: NoteLetter.F, accidental: Accidental.Sharp   }, // sig +6: F#
  { letter: NoteLetter.C, accidental: Accidental.Sharp   }, // sig +7: C#
];

const MINOR_TONICS: readonly SpelledNoteName[] = [
  { letter: NoteLetter.A, accidental: Accidental.Flat    }, // sig -7: Ab minor
  { letter: NoteLetter.E, accidental: Accidental.Flat    }, // sig -6: Eb minor
  { letter: NoteLetter.B, accidental: Accidental.Flat    }, // sig -5: Bb minor
  { letter: NoteLetter.F, accidental: Accidental.Natural }, // sig -4: F minor
  { letter: NoteLetter.C, accidental: Accidental.Natural }, // sig -3: C minor
  { letter: NoteLetter.G, accidental: Accidental.Natural }, // sig -2: G minor
  { letter: NoteLetter.D, accidental: Accidental.Natural }, // sig -1: D minor
  { letter: NoteLetter.A, accidental: Accidental.Natural }, // sig  0: A minor
  { letter: NoteLetter.E, accidental: Accidental.Natural }, // sig +1: E minor
  { letter: NoteLetter.B, accidental: Accidental.Natural }, // sig +2: B minor
  { letter: NoteLetter.F, accidental: Accidental.Sharp   }, // sig +3: F# minor
  { letter: NoteLetter.C, accidental: Accidental.Sharp   }, // sig +4: C# minor
  { letter: NoteLetter.G, accidental: Accidental.Sharp   }, // sig +5: G# minor
  { letter: NoteLetter.D, accidental: Accidental.Sharp   }, // sig +6: D# minor
  { letter: NoteLetter.A, accidental: Accidental.Sharp   }, // sig +7: A# minor
];

function sigToIdx(sig: number): number { return sig + 7; }

function makeTonicPitch(spelling: SpelledNoteName): Pitch {
  const midi = 60 + NATURAL_PC[spelling.letter] + spelling.accidental;
  return pitchFactory.fromMidiWithSpelling(midi, spelling);
}

const MAJ: ConcreteKey[] = MAJOR_TONICS.map((s, i) =>
  new ConcreteKey(
    makeTonicPitch(s),
    "major",
    i - 7,
    buildKeySpellings(s, [0, 2, 4, 5, 7, 9, 11]),
  )
);

const MIN: ConcreteKey[] = MINOR_TONICS.map((s, i) =>
  new ConcreteKey(
    makeTonicPitch(s),
    "minor",
    i - 7,
    buildKeySpellings(s, [0, 2, 3, 5, 7, 8, 10]),
  )
);

// Wire relative (major[i] ↔ minor[i], same signature = same key-signature set)
for (let i = 0; i < 15; i++) {
  MAJ[i]!.relative = MIN[i]!;
  MIN[i]!.relative = MAJ[i]!;
}

// Wire parallel (same tonic, opposite modality)
// parallel minor of major[sig] = minor[sig-3]
// parallel major of minor[sig] = major[sig+3]
for (let i = 0; i < 15; i++) {
  const pMinIdx = i - 3;                    // parallel minor index
  const pMajIdx = i + 3;                    // parallel major index
  MAJ[i]!.parallel = (pMinIdx >= 0 && pMinIdx < 15) ? MIN[pMinIdx]! : MAJ[i]!;
  MIN[i]!.parallel = (pMajIdx >= 0 && pMajIdx < 15) ? MAJ[pMajIdx]! : MIN[i]!;
}

// Wire enharmonic equivalents
// B maj(5)↔Cb maj(-7), F# maj(6)↔Gb maj(-6), C# maj(7)↔Db maj(-5)
// G# min(5)↔Ab min(-7), D# min(6)↔Eb min(-6), A# min(7)↔Bb min(-5)
const ENHARMONIC_PAIRS_MAJ: [number, number][] = [[5, -7], [6, -6], [7, -5]];
const ENHARMONIC_PAIRS_MIN: [number, number][] = [[5, -7], [6, -6], [7, -5]];
for (const [a, b] of ENHARMONIC_PAIRS_MAJ) {
  const ka = MAJ[sigToIdx(a)]!, kb = MAJ[sigToIdx(b)]!;
  ka.enharmonicEquivalent = kb; kb.enharmonicEquivalent = ka;
}
for (const [a, b] of ENHARMONIC_PAIRS_MIN) {
  const ka = MIN[sigToIdx(a)]!, kb = MIN[sigToIdx(b)]!;
  ka.enharmonicEquivalent = kb; kb.enharmonicEquivalent = ka;
}
// All others: enharmonicEquivalent = self
for (let i = 0; i < 15; i++) {
  if (!MAJ[i]!.enharmonicEquivalent) MAJ[i]!.enharmonicEquivalent = MAJ[i]!;
  if (!MIN[i]!.enharmonicEquivalent) MIN[i]!.enharmonicEquivalent = MIN[i]!;
}

// ---------------------------------------------------------------------------
// Concrete factory
// ---------------------------------------------------------------------------

export const keyFactory: KeyFactory = {
  build(tonic: Pitch, modality: Modality): Key {
    const arr = modality === "major" ? MAJ : MIN;
    const found = arr.find(k => spelledNoteNamesEqual(k.tonic.spelling, tonic.spelling));
    if (found) return found;
    // Fallback for non-standard spellings
    const sig = 0;
    const spellings = buildKeySpellings(
      tonic.spelling,
      modality === "major" ? [0, 2, 4, 5, 7, 9, 11] : [0, 2, 3, 5, 7, 8, 10],
    );
    const key = new ConcreteKey(tonic, modality, sig, spellings);
    key.relative = key; key.parallel = key; key.enharmonicEquivalent = key;
    return key;
  },

  major(signature: number): Key {
    const k = MAJ[sigToIdx(signature)];
    if (!k) throw new RangeError(`No major key for signature ${signature}`);
    return k;
  },

  minor(signature: number): Key {
    const k = MIN[sigToIdx(signature)];
    if (!k) throw new RangeError(`No minor key for signature ${signature}`);
    return k;
  },

  get allMajor() { return MAJ as ReadonlyArray<Key>; },
  get allMinor() { return MIN as ReadonlyArray<Key>; },
};

// ---------------------------------------------------------------------------
/**
 * Factory for constructing Key instances.
 * Pre-computes and caches all 30 standard keys (15 major + 15 minor)
 * including enharmonic equivalents.
 */
export interface KeyFactory {
  /** Build a key from a tonic pitch and modality. */
  build(tonic: Pitch, modality: Modality): Key;

  /** Retrieve one of the 15 major keys by signature (−7 to +7). */
  major(signature: number): Key;

  /** Retrieve one of the 15 minor keys by signature (−7 to +7). */
  minor(signature: number): Key;

  /** All major keys in circle-of-fifths order (C, G, D, …, F). */
  readonly allMajor: ReadonlyArray<Key>;

  /** All minor keys in circle-of-fifths order (A, E, B, …, D). */
  readonly allMinor: ReadonlyArray<Key>;
}
