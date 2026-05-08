import type { Interval } from "../primitives/interval.ts";
import type { Pitch } from "../primitives/pitch.ts";
import { intervalFactory } from "../primitives/interval.ts";
import { pitchArithmetic, pitchFactory } from "../primitives/pitch.ts";
import { Accidental, NATURAL_PC, NoteLetter } from "../index.ts";

// ---------------------------------------------------------------------------
// Scale pattern types (the "recipe" — key-agnostic)
// ---------------------------------------------------------------------------

/**
 * Ordered array of semitone offsets from the root that defines a scale pattern.
 * Always begins with 0 (the root itself). Length = number of distinct pitches.
 *
 * @example [0, 2, 4, 5, 7, 9, 11]  — major scale
 * @example [0, 2, 3, 5, 7, 8, 10]  — natural minor scale
 * @example [0, 2, 4, 6, 8, 10]     — whole-tone scale
 */
export type SemitonePattern = ReadonlyArray<number>;

/**
 * Broad category tag for filtering and organizing scale patterns in the registry.
 * Used as a discriminant for exhaustive switch statements over scale families.
 */
export type ScaleCategory =
  | "diatonic"    // major, natural/harmonic/melodic minor
  | "mode"        // church modes: Dorian, Phrygian, Lydian, Mixolydian, Aeolian, Locrian
  | "symmetric"   // whole-tone, diminished (octatonic), augmented
  | "harmonic"    // harmonic major/minor variants
  | "melodic"     // melodic minor and its modes
  | "pentatonic"  // major/minor pentatonic
  | "blues"       // blues scales
  | "synthetic";  // user-defined or non-standard

/**
 * Metadata describing a scale pattern, independent of any root pitch.
 * Serves as the "recipe" that ScaleFactory materializes into a concrete Scale.
 */
export interface ScalePattern {
  readonly name:      string;
  readonly category:  ScaleCategory;
  /** Semitone offsets from root, starting at 0. Never modified after creation. */
  readonly intervals: SemitonePattern;
  /** Names of each mode, if this pattern defines a modal family. */
  readonly modes?:    ReadonlyArray<string>;
}

// ---------------------------------------------------------------------------
// Scale abstract base class
// ---------------------------------------------------------------------------

/**
 * A materialized scale: a root Pitch + a ScalePattern → ordered pitch set.
 *
 * All operations return new Scale instances. Input is never mutated.
 * Concrete subclasses (DiatonicScale, ModeScale, etc.) provide implementations.
 */
export abstract class Scale {
  /** The root pitch from which all degrees are derived. */
  abstract readonly root: Pitch;

  /** The pattern (interval recipe) this scale was built from. */
  abstract readonly pattern: ScalePattern;

  /**
   * All pitches in ascending order from the root.
   * Length equals `pattern.intervals.length`.
   */
  abstract readonly pitches: ReadonlyArray<Pitch>;

  /**
   * Return the pitch at scale degree `n` (1-based).
   * Degree 1 = root. Supports n > pattern length by wrapping with octave adjustment.
   *
   * @throws RangeError if n < 1
   */
  abstract degree(n: number): Pitch;

  /**
   * Return the interval from the root to scale degree `n`.
   * Degree 1 → Unison, Degree 5 in major → Perfect Fifth.
   *
   * @throws RangeError if n < 1
   */
  abstract intervalToDegree(n: number): Interval;

  /**
   * Return a new Scale with the same pattern but transposed to a new root.
   * @param semitones positive = up, negative = down
   */
  abstract transpose(semitones: number): Scale;

  /**
   * Return the mode of this scale starting on degree `modeRoot`.
   * e.g. C major.mode(2) → D Dorian (same pitches, new root and pattern).
   *
   * @throws RangeError if modeRoot < 1 or > pattern length
   */
  abstract mode(degree: number): Scale;

  /**
   * True if `pitch` is contained in this scale (pitch-class comparison only;
   * enharmonic equivalence applied).
   */
  abstract contains(pitch: Pitch): boolean;
}

// ---------------------------------------------------------------------------
// Factory interface
// ---------------------------------------------------------------------------

/**
 * Builds concrete Scale instances from a pattern + root.
 * Separated from Scale itself to keep the abstract class free of dependencies
 * on PitchFactory or other lower-layer factories.
 */
export interface ScaleFactory {
  build(pattern: ScalePattern, root: Pitch): Scale;
}

// ---------------------------------------------------------------------------
// Concrete implementation
// ---------------------------------------------------------------------------

class ConcreteScale extends Scale {
  readonly root: Pitch;
  readonly pattern: ScalePattern;
  readonly pitches: ReadonlyArray<Pitch>;
  private readonly _pcSet: ReadonlySet<number>;

  constructor(root: Pitch, pattern: ScalePattern) {
    super();
    this.root = root;
    this.pattern = pattern;

    // Build pitches with proper diatonic spelling
    const rootLetter = root.spelling.letter;
    const rootOctave = Math.floor((root.midi - NATURAL_PC[rootLetter] - root.spelling.accidental) / 12) - 1;
    this.pitches = pattern.intervals.map((offset, index) => {
      const targetLetter = this.addDiatonicSteps(rootLetter, index);
      const targetOctave = rootOctave + Math.floor((rootLetter + index) / 7);
      const targetMidi = root.midi + offset;
      const targetNaturalMidi = (targetOctave + 1) * 12 + NATURAL_PC[targetLetter];
      const neededAccidental = targetMidi - targetNaturalMidi;

      return pitchFactory.fromSpelling(
        { letter: targetLetter, accidental: neededAccidental as Accidental },
        targetOctave
      );
    });

    this._pcSet = new Set(this.pitches.map(p => p.pitchClass));
  }

  // Helper: add diatonic steps to a letter
  private addDiatonicSteps(start: NoteLetter, steps: number): NoteLetter {
    const letters = [
      NoteLetter.C, NoteLetter.D, NoteLetter.E,
      NoteLetter.F, NoteLetter.G, NoteLetter.A, NoteLetter.B
    ];
    const idx = letters.indexOf(start);
    return letters[(idx + steps) % 7]!;
  }

  // Helper: get MIDI number of a natural note at a given octave
  private getNaturalMidi(letter: NoteLetter, octave: number): number {
    const naturalPc: Record<NoteLetter, number> = {
      [NoteLetter.C]: 0, [NoteLetter.D]: 2, [NoteLetter.E]: 4,
      [NoteLetter.F]: 5, [NoteLetter.G]: 7, [NoteLetter.A]: 9, [NoteLetter.B]: 11
    };
    return (octave + 1) * 12 + naturalPc[letter];
  }

  degree(n: number): Pitch {
    if (n < 1) throw new RangeError(`Scale degree must be ≥ 1, got ${n}`);
    const len = this.pattern.intervals.length;
    if (n <= len) return this.pitches[n - 1]!;
    const idx = (n - 1) % len;
    const octaveOffset = Math.floor((n - 1) / len);
    /* c8 ignore next */
    const semitones = (this.pattern.intervals[idx] ?? 0) + 12 * octaveOffset;
    return pitchArithmetic.transpose(this.root, semitones);
  }

  intervalToDegree(n: number): Interval {
    if (n < 1) throw new RangeError(`Scale degree must be ≥ 1, got ${n}`);
    const len = this.pattern.intervals.length;
    const idx = (n - 1) % len;
    const octaveOffset = Math.floor((n - 1) / len);
    /* c8 ignore next */
    const semitones = (this.pattern.intervals[idx] ?? 0) + 12 * octaveOffset;
    return intervalFactory.fromSemitones(semitones);
  }

  transpose(semitones: number): Scale {
    return new ConcreteScale(pitchArithmetic.transpose(this.root, semitones), this.pattern);
  }

  mode(degree: number): Scale {
    const len = this.pattern.intervals.length;
    if (degree < 1 || degree > len) {
      throw new RangeError(`Mode degree must be between 1 and ${len}, got ${degree}`);
    }
    const newRoot = this.degree(degree);
    const base = this.pattern.intervals[degree - 1] ?? 0;
    const rotated = [
      ...this.pattern.intervals.slice(degree - 1),
      ...this.pattern.intervals.slice(0, degree - 1),
    ];
    const normalized = rotated.map(v => ((v - base) % 12 + 12) % 12);
    const modeName =
      this.pattern.modes?.[degree - 1] ?? `mode-${degree}-of-${this.pattern.name}`;
    const newPattern: ScalePattern = {
      name: modeName,
      category: "mode",
      intervals: normalized,
    };
    return new ConcreteScale(newRoot, newPattern);
  }

  contains(pitch: Pitch): boolean {
    return this._pcSet.has(pitch.pitchClass);
  }
}

export const scaleFactory: ScaleFactory = {
  build(pattern: ScalePattern, root: Pitch): Scale {
    return new ConcreteScale(root, pattern);
  },
};
