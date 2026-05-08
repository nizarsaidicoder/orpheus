import type { Pitch } from "../primitives/pitch.ts";
import type { Interval } from "../primitives/interval.ts";
import { pitchArithmetic, pitchFactory } from "../primitives/pitch.ts";
import { intervalFactory } from "../primitives/interval.ts";
import type { Chord, ChordAlteration, ChordQuality } from "./chord.ts";
import { rotatePitchesToBass } from "./inversion.ts";
import { NoteLetter } from "../primitives/note-name.ts";
import type { Accidental } from "../primitives/note-name.ts";
/**
 * Configuration bag for building any chord type.
 * Used by `ChordFactory.build()` for full control.
 */
export interface ChordBuildOptions {
  readonly root:         Pitch;
  readonly quality:      ChordQuality;
  readonly alterations?: ReadonlyArray<ChordAlteration>;
  /** When true, omit the fifth from the voicing (common in jazz extended chords). */
  readonly omitFifth?:   boolean;
}

/**
 * Factory for constructing immutable Chord instances.
 * All methods return new objects; nothing is mutated.
 */
export interface ChordFactory {
  /**
   * Build a root-position triad.
   * @example triad(C4, "major") → C major triad {C, E, G}
   */
  triad(
    root: Pitch,
    quality: "major" | "minor" | "diminished" | "augmented" | "sus2" | "sus4"
  ): Chord;

  /**
   * Build a root-position seventh chord.
   * @example seventh(G4, "dominant7") → G7 {G, B, D, F}
   */
  seventh(
    root: Pitch,
    quality: "major7" | "dominant7" | "minor7" | "half-diminished7" | "diminished7" | "minor-major7" | "augmented-major7"
  ): Chord;

  /**
   * Build any chord from a full ChordBuildOptions descriptor.
   * Supports extensions (9th, 11th, 13th) and alterations (b9, #11, etc.).
   */
  build(options: ChordBuildOptions): Chord;

  /**
   * Return a new Chord in the specified inversion.
   * Rotates `pitches` so the target chord tone is in the bass.
   * Throws RangeError if `position` is "third" but the chord has fewer than 4 pitches.
   */
  invert(chord: Chord, position: "first" | "second" | "third"): Chord;

  /**
   * Return a slash chord: a Chord with an explicit `bassNote` override.
   * The `bassNote` need not be a chord tone (e.g. C major over E bass = C/E).
   * @example slash(cMajor, E4) → C/E
   */
  slash(chord: Chord, bassNote: Pitch): Chord;

  /**
   * Build a chord by short name (e.g. "min7", "7b9", "maj911s").
   * @throws RangeError if name is not in the chord registry
   */
  fromName(name: string, root: Pitch): Chord;
}

// ---------------------------------------------------------------------------
// Pre-built interval constants
// ---------------------------------------------------------------------------

const IV = {
  M2:  intervalFactory.fromNumberAndQuality(2,  "major"),
  m3:  intervalFactory.fromNumberAndQuality(3,  "minor"),
  M3:  intervalFactory.fromNumberAndQuality(3,  "major"),
  P4:  intervalFactory.fromNumberAndQuality(4,  "perfect"),
  d5:  intervalFactory.fromNumberAndQuality(5,  "diminished"),
  P5:  intervalFactory.fromNumberAndQuality(5,  "perfect"),
  A5:  intervalFactory.fromNumberAndQuality(5,  "augmented"),
  d7:  intervalFactory.fromNumberAndQuality(7,  "diminished"),
  m7:  intervalFactory.fromNumberAndQuality(7,  "minor"),
  M7:  intervalFactory.fromNumberAndQuality(7,  "major"),
  m9:  intervalFactory.fromNumberAndQuality(9,  "minor"),
  M9:  intervalFactory.fromNumberAndQuality(9,  "major"),
  A9:  intervalFactory.fromNumberAndQuality(9,  "augmented"),
  d11: intervalFactory.fromNumberAndQuality(11, "diminished"),
  P11: intervalFactory.fromNumberAndQuality(11, "perfect"),
  A11: intervalFactory.fromNumberAndQuality(11, "augmented"),
  m13: intervalFactory.fromNumberAndQuality(13, "minor"),
  M6:  intervalFactory.fromNumberAndQuality(6,  "major"),
  M13: intervalFactory.fromNumberAndQuality(13, "major"),
  A13: intervalFactory.fromNumberAndQuality(13, "augmented"),
} as const;

// ---------------------------------------------------------------------------
// Interval structure per chord quality (intervals from root, root excluded)
// ---------------------------------------------------------------------------

const QUALITY_INTERVALS: Readonly<Record<string, ReadonlyArray<Interval>>> = {
  // Triads
  "major":              [IV.M3, IV.P5],
  "minor":              [IV.m3, IV.P5],
  "diminished":         [IV.m3, IV.d5],
  "augmented":          [IV.M3, IV.A5],
  "sus2":               [IV.M2, IV.P5],
  "sus4":               [IV.P4, IV.P5],
  // Sevenths
  "major7":             [IV.M3, IV.P5, IV.M7],
  "dominant7":          [IV.M3, IV.P5, IV.m7],
  "minor7":             [IV.m3, IV.P5, IV.m7],
  "half-diminished7":   [IV.m3, IV.d5, IV.m7],
  "diminished7":        [IV.m3, IV.d5, IV.d7],
  "minor-major7":       [IV.m3, IV.P5, IV.M7],
  "augmented-major7":   [IV.M3, IV.A5, IV.M7],
  // Ninths
  "dominant9":          [IV.M3, IV.P5, IV.m7, IV.M9],
  "major9":             [IV.M3, IV.P5, IV.M7, IV.M9],
  "minor9":             [IV.m3, IV.P5, IV.m7, IV.M9],
  // Elevenths
  "dominant11":         [IV.M3, IV.P5, IV.m7, IV.M9, IV.P11],
  "major11":            [IV.M3, IV.P5, IV.M7, IV.M9, IV.P11],
  "minor11":            [IV.m3, IV.P5, IV.m7, IV.M9, IV.P11],
  // Thirteenths
  "dominant13":         [IV.M3, IV.P5, IV.m7, IV.M9, IV.P11, IV.M13],
  "major13":            [IV.M3, IV.P5, IV.M7, IV.M9, IV.P11, IV.M13],
  "minor13":            [IV.m3, IV.P5, IV.m7, IV.M9, IV.P11, IV.M13],
  // Add-tone chords (no 7th)
  "add9":               [IV.M3, IV.P5, IV.M9],
  "add11":              [IV.M3, IV.P5, IV.P11],
  "add13":              [IV.M3, IV.P5, IV.M6],
  "minor-add9":         [IV.m3, IV.P5, IV.M9],
  "minor-add11":        [IV.m3, IV.P5, IV.P11],
  "minor-add13":        [IV.m3, IV.P5, IV.M6],
  // Suspended + 7th
  "dominant7sus4":      [IV.P4, IV.P5, IV.m7],
  "dominant7sus2":      [IV.M2, IV.P5, IV.m7],
  "major7sus4":         [IV.P4, IV.P5, IV.M7],
  "major7sus2":         [IV.M2, IV.P5, IV.M7],
  "major9sus4":         [IV.P4, IV.P5, IV.M7, IV.M9],
  // No-third
  "no-third":           [IV.P5],
  // Augmented extended
  "augmented-major9":   [IV.M3, IV.A5, IV.M7, IV.M9],
  "augmented-major11":  [IV.M3, IV.A5, IV.M7, IV.M9, IV.A11],
  // Minor-major extended
  "minor-major9":       [IV.m3, IV.P5, IV.M7, IV.M9],
  "minor-major11":      [IV.m3, IV.P5, IV.M7, IV.M9, IV.P11],
  "minor-major13":      [IV.m3, IV.P5, IV.M7, IV.M9, IV.P11, IV.M13],
  // Half-diminished extended
  "half-diminished9":   [IV.m3, IV.d5, IV.m7, IV.M9],
  "half-diminished11":  [IV.m3, IV.d5, IV.m7, IV.M9, IV.P11],
  // Diminished add-tone
  "diminished-add11":   [IV.m3, IV.d5, IV.P11],
  "diminished-add13":   [IV.m3, IV.d5, IV.M6],
  // Altered dominant — base; alterations applied on top
  "altered":            [IV.M3, IV.P5, IV.m7],
};

// ---------------------------------------------------------------------------
// Alteration lookup: degree + direction → specific Interval
// ---------------------------------------------------------------------------

const ALTERATION_INTERVALS: Readonly<Record<number, Readonly<Record<"flat" | "sharp", Interval>>>> = {
  5:  { flat: IV.d5,  sharp: IV.A5  },
  9:  { flat: IV.m9,  sharp: IV.A9  },
  11: { flat: IV.d11, sharp: IV.A11 },
  13: { flat: IV.m13, sharp: IV.A13 },
};

// Natural semitone reference for each alterable degree (used to find the slot to replace)
const DEGREE_NATURAL_SEMITONES: Readonly<Record<number, number>> = {
  5: 7, 9: 14, 11: 17, 13: 21,
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function applyAlterations(
  base: ReadonlyArray<Interval>,
  alterations: ReadonlyArray<ChordAlteration>
): Interval[] {
  const result: Interval[] = [...base];
  for (const alt of alterations) {
    const target = ALTERATION_INTERVALS[alt.degree]?.[alt.direction];
    if (target === undefined) continue;
    const natural = DEGREE_NATURAL_SEMITONES[alt.degree] ?? target.semitones;
    // Replace any existing interval within 2 semitones of the natural degree value
    const existingIdx = result.findIndex(i => Math.abs(i.semitones - natural) <= 2);
    if (existingIdx >= 0) {
      result[existingIdx] = target;
    } else {
      result.push(target);
    }
  }
  return result.sort((a, b) => a.semitones - b.semitones);
}

function buildPitches(root: Pitch, intervalStructure: ReadonlyArray<Interval>): ReadonlyArray<Pitch> {
  // Build each pitch using its Interval's diatonic number to get the correct letter
  return [root, ...intervalStructure.map(i => {
    // Add diatonic steps to get the target letter
    const targetLetter = addDiatonicSteps(root.spelling.letter, i.number - 1);

    // What's the semitone offset of the natural note at this letter?
    const naturalPc: Record<NoteLetter, number> = {
      [NoteLetter.C]: 0, [NoteLetter.D]: 2, [NoteLetter.E]: 4,
      [NoteLetter.F]: 5, [NoteLetter.G]: 7, [NoteLetter.A]: 9, [NoteLetter.B]: 11
    };
    const targetNaturalPc = naturalPc[targetLetter];

    // Calculate the accidental needed to match the interval's semitones
    const targetMidi = root.midi + i.semitones;
    const targetOctave = root.octave + Math.floor((root.spelling.letter + i.number - 1) / 7);
    const targetNaturalMidi = (targetOctave + 1) * 12 + targetNaturalPc;
    const neededAccidental = targetMidi - targetNaturalMidi;

    return pitchFactory.fromSpelling(
      { letter: targetLetter, accidental: neededAccidental as Accidental },
      targetOctave
    );
  })];
}

/** Add `steps` diatonic steps to a letter (C+2=E, A+2=B, G+1=A) */
function addDiatonicSteps(start: NoteLetter, steps: number): NoteLetter {
  const letters = [NoteLetter.C, NoteLetter.D, NoteLetter.E, NoteLetter.F, NoteLetter.G, NoteLetter.A, NoteLetter.B];
  const idx = letters.indexOf(start);
  return letters[(idx + steps) % 7]!;
}

function applyInversion(pitches: ReadonlyArray<Pitch>, bassIndex: number): ReadonlyArray<Pitch> {
  const rotated = rotatePitchesToBass(pitches, bassIndex) as Pitch[];
  const result: Pitch[] = [rotated[0]!];
  for (let i = 1; i < rotated.length; i++) {
    const prev = result[i - 1]!;
    let p = rotated[i]!;
    while (p.midi <= prev.midi) {
      p = pitchArithmetic.transpose(p, 12);
    }
    result.push(p);
  }
  return result;
}

function buildChord(
  root: Pitch,
  quality: ChordQuality,
  intervalStructure: ReadonlyArray<Interval>
): Chord {
  return {
    root,
    quality,
    pitches: buildPitches(root, intervalStructure),
    inversion: "root",
    intervalStructure,
  };
}

// ---------------------------------------------------------------------------
// Named chord registry
// ---------------------------------------------------------------------------

interface NamedChordEntry {
  readonly quality: ChordQuality;
  readonly intervals: ReadonlyArray<Interval>;
}

const Q = QUALITY_INTERVALS;

const NAMED_CHORD_TABLE: Readonly<Record<string, NamedChordEntry>> = {
  // Standard kinds — intervals taken directly from QUALITY_INTERVALS
  "min7":      { quality: { kind: "minor7" },             intervals: Q["minor7"]! },
  "min":       { quality: { kind: "minor" },              intervals: Q["minor"]! },
  "7":         { quality: { kind: "dominant7" },          intervals: Q["dominant7"]! },
  "dim":       { quality: { kind: "diminished" },         intervals: Q["diminished"]! },
  "aug":       { quality: { kind: "augmented" },          intervals: Q["augmented"]! },
  "maj7":      { quality: { kind: "major7" },             intervals: Q["major7"]! },
  "sus4":      { quality: { kind: "sus4" },               intervals: Q["sus4"]! },
  "sus2":      { quality: { kind: "sus2" },               intervals: Q["sus2"]! },
  "maj9":      { quality: { kind: "major9" },             intervals: Q["major9"]! },
  "min9":      { quality: { kind: "minor9" },             intervals: Q["minor9"]! },
  "min13":     { quality: { kind: "minor13" },            intervals: Q["minor13"]! },
  "maj11":     { quality: { kind: "major11" },            intervals: Q["major11"]! },
  "maj13":     { quality: { kind: "major13" },            intervals: Q["major13"]! },
  "min11":     { quality: { kind: "minor11" },            intervals: Q["minor11"]! },
  "11":        { quality: { kind: "dominant11" },         intervals: Q["dominant11"]! },
  "13":        { quality: { kind: "dominant13" },         intervals: Q["dominant13"]! },
  "9":         { quality: { kind: "dominant9" },          intervals: Q["dominant9"]! },
  "dim7":      { quality: { kind: "half-diminished7" },   intervals: Q["half-diminished7"]! },
  "dimb7":     { quality: { kind: "diminished7" },        intervals: Q["diminished7"]! },
  "augmaj7":   { quality: { kind: "augmented-major7" },   intervals: Q["augmented-major7"]! },
  "minmaj7":   { quality: { kind: "minor-major7" },       intervals: Q["minor-major7"]! },
  "minadd9":   { quality: { kind: "minor-add9" },         intervals: Q["minor-add9"]! },
  "minadd11":  { quality: { kind: "minor-add11" },        intervals: Q["minor-add11"]! },
  "minadd13":  { quality: { kind: "minor-add13" },        intervals: Q["minor-add13"]! },
  "add9":      { quality: { kind: "add9" },               intervals: Q["add9"]! },
  "add11":     { quality: { kind: "add11" },              intervals: Q["add11"]! },
  "add13":     { quality: { kind: "add13" },              intervals: Q["add13"]! },
  "augmaj11":  { quality: { kind: "augmented-major11" },  intervals: Q["augmented-major11"]! },
  "augmaj9":   { quality: { kind: "augmented-major9" },   intervals: Q["augmented-major9"]! },
  "7sus2":     { quality: { kind: "dominant7sus2" },      intervals: Q["dominant7sus2"]! },
  "7sus4":     { quality: { kind: "dominant7sus4" },      intervals: Q["dominant7sus4"]! },
  "minmaj13":  { quality: { kind: "minor-major13" },      intervals: Q["minor-major13"]! },
  "minmaj9":   { quality: { kind: "minor-major9" },       intervals: Q["minor-major9"]! },
  "minmaj11":  { quality: { kind: "minor-major11" },      intervals: Q["minor-major11"]! },
  "maj7sus4":  { quality: { kind: "major7sus4" },         intervals: Q["major7sus4"]! },
  "maj7sus2":  { quality: { kind: "major7sus2" },         intervals: Q["major7sus2"]! },
  "maj9sus4":  { quality: { kind: "major9sus4" },         intervals: Q["major9sus4"]! },
  "no3d":      { quality: { kind: "no-third" },           intervals: Q["no-third"]! },
  "dim9":      { quality: { kind: "half-diminished9" },   intervals: Q["half-diminished9"]! },
  "dim11":     { quality: { kind: "half-diminished11" },  intervals: Q["half-diminished11"]! },
  "dimadd11":  { quality: { kind: "diminished-add11" },   intervals: Q["diminished-add11"]! },
  "dimadd13":  { quality: { kind: "diminished-add13" },   intervals: Q["diminished-add13"]! },
  // Altered dominant variants — pre-computed interval arrays
  "7b9":       { quality: { kind: "altered", alterations: [{ degree: 9,  direction: "flat"  }] }, intervals: [IV.M3, IV.P5, IV.m7, IV.m9] },
  "13b9":      { quality: { kind: "altered", alterations: [{ degree: 9,  direction: "flat"  }] }, intervals: [IV.M3, IV.P5, IV.m7, IV.m9, IV.P11, IV.M13] },
  "majs9":     { quality: { kind: "altered", alterations: [{ degree: 9,  direction: "sharp" }] }, intervals: [IV.M3, IV.P5, IV.m7, IV.A9] },
  "majs911s":  { quality: { kind: "altered", alterations: [{ degree: 9,  direction: "sharp" }, { degree: 11, direction: "sharp" }] }, intervals: [IV.M3, IV.P5, IV.m7, IV.A9, IV.A11] },
  "11s":       { quality: { kind: "altered", alterations: [{ degree: 11, direction: "sharp" }] }, intervals: [IV.M3, IV.P5, IV.m7, IV.M9, IV.A11] },
  "11b9":      { quality: { kind: "altered", alterations: [{ degree: 9,  direction: "flat"  }] }, intervals: [IV.M3, IV.P5, IV.m7, IV.m9, IV.P11] },
  "13b":       { quality: { kind: "altered", alterations: [{ degree: 13, direction: "flat"  }] }, intervals: [IV.M3, IV.P5, IV.m7, IV.M9, IV.P11, IV.m13] },
  // Extended major with alterations
  "maj911s":   { quality: { kind: "major9" },   intervals: [IV.M3, IV.P5, IV.M7, IV.M9, IV.A11] },
  "maj1311s":  { quality: { kind: "major13" },  intervals: [IV.M3, IV.P5, IV.M7, IV.M9, IV.A11, IV.M13] },
  // Minor variants with alterations
  "minb9":     { quality: { kind: "minor7" },   intervals: [IV.m3, IV.P5, IV.m7, IV.m9] },
  "min1113b":  { quality: { kind: "minor11" },  intervals: [IV.m3, IV.P5, IV.m7, IV.M9, IV.P11, IV.m13] },
  // Half-diminished variants with alterations
  "dimb9":     { quality: { kind: "half-diminished7" }, intervals: [IV.m3, IV.d5, IV.m7, IV.m9] },
  "dim11b9":   { quality: { kind: "half-diminished7" }, intervals: [IV.m3, IV.d5, IV.m7, IV.m9, IV.P11] },
  "dim13b9":   { quality: { kind: "half-diminished7" }, intervals: [IV.m3, IV.d5, IV.m7, IV.m9, IV.P11, IV.M13] },
};

// ---------------------------------------------------------------------------
// Concrete implementation
// ---------------------------------------------------------------------------

export const chordFactory: ChordFactory = {
  triad(root, quality) {
    return chordFactory.build({ root, quality: { kind: quality } });
  },

  seventh(root, quality) {
    return chordFactory.build({ root, quality: { kind: quality } });
  },

  build(options) {
    const { root, quality, omitFifth } = options;
    const base = QUALITY_INTERVALS[quality.kind] ?? [];

    // For the `altered` kind, apply its built-in alterations to the dominant7 base
    let intervals: Interval[] =
      quality.kind === "altered"
        ? applyAlterations(base, quality.alterations)
        : [...base];

    // Apply any additional alterations from the options bag
    if (options.alterations !== undefined && options.alterations.length > 0) {
      intervals = applyAlterations(intervals, options.alterations);
    }

    // omitFifth: remove the interval occupying the fifth slot (semitones 5–8)
    if (omitFifth === true) {
      intervals = intervals.filter(i => i.semitones < 5 || i.semitones > 8);
    }

    return buildChord(root, quality, intervals);
  },

  invert(chord, position) {
    const bassIndex = position === "first" ? 1 : position === "second" ? 2 : 3;
    if (bassIndex >= chord.pitches.length) {
      throw new RangeError(
        `Cannot apply "${position}" inversion to a chord with only ${chord.pitches.length} pitches`
      );
    }
    // Rebuild from root so inversion is always relative to root position
    const rootPosPitches = buildPitches(chord.root, chord.intervalStructure);
    const invertedPitches = applyInversion(rootPosPitches, bassIndex);
    return {
      root:              chord.root,
      quality:           chord.quality,
      pitches:           invertedPitches,
      inversion:         position,
      intervalStructure: chord.intervalStructure,
    };
  },

  slash(chord, bassNote) {
    return { ...chord, bassNote };
  },

  fromName(name, root) {
    const entry = NAMED_CHORD_TABLE[name];
    if (entry === undefined) {
      throw new RangeError(`Unknown chord name: "${name}"`);
    }
    return buildChord(root, entry.quality, entry.intervals);
  },
};
