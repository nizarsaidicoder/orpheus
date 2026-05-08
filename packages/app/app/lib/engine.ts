// ── Engine bridge ────────────────────────────────────────────────────────────
// All @orpheus/engine + @orpheus/fretboard calls go through here.
// Hooks import from this file only — never directly from the packages.
//
// Design contracts (from grill-me session):
//  • Module-level singleton cache for Fretboard (keyed by tuning name)
//  • Module-level cache for voicings (shapeFinder results)
//  • All parse functions clamp invalid input to defaults + warn in DEV
//  • buildHighlights return FretHighlight[] with all 3 label formats precomputed

import {
  pitchFactory,
  scaleFactory,
  chordFactory,
  keyFactory,
  functionalAnalyzer,
  romanNumeralAnalyzer,
  defaultScaleRegistry,
  NoteLetter,
  Accidental,
  spelledNoteNameToString,
} from "@orpheus/engine";
import type {
  Pitch,
  SpelledNoteName,
  Chord,
  Key,
  Modality,
  ChordQuality,
  HarmonizationExtension,
} from "@orpheus/engine";

import {
  fretboardFactory,
  scaleMapFactory,
  shapeFinder,
  tuningRegistry,
  STANDARD_TUNING,
} from "@orpheus/fretboard";
import type { Fretboard, Fingering, FretPosition, ScaleMap } from "@orpheus/fretboard";

import { semitoneToColor } from "./types.ts";
import type { FretHighlight, StringState } from "./types.ts";

// ── Note / tuning option lists (for selectors) ───────────────────────────────

export const NOTE_OPTIONS = [
  "C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B",
] as const;
export type NoteName = (typeof NOTE_OPTIONS)[number];

export const TUNING_OPTIONS = [
  { value: "Standard",        label: "Standard (EADGBe)" },
  { value: "Drop D",          label: "Drop D (DADGBe)" },
  { value: "Open G",          label: "Open G (DGDGBd)" },
  { value: "Open E",          label: "Open E (EBEg#Be)" },
  { value: "DADGAD",          label: "DADGAD" },
  { value: "Half Step Down",  label: "Half Step Down (Eb)" },
  { value: "Whole Step Down", label: "Whole Step Down (D)" },
] as const;
export type TuningName = (typeof TUNING_OPTIONS)[number]["value"];

export const QUALITY_OPTIONS = [
  // Triads
  { value: "major",             label: "Major",           group: "Triads" },
  { value: "minor",             label: "Minor",           group: "Triads" },
  { value: "diminished",        label: "Dim (°)",         group: "Triads" },
  { value: "augmented",         label: "Aug (+)",         group: "Triads" },
  { value: "sus2",              label: "Sus2",            group: "Triads" },
  { value: "sus4",              label: "Sus4",            group: "Triads" },
  // Sevenths
  { value: "major7",            label: "Maj7",            group: "Sevenths" },
  { value: "dominant7",         label: "7 (Dom7)",        group: "Sevenths" },
  { value: "minor7",            label: "m7",              group: "Sevenths" },
  { value: "half-diminished7",  label: "ø7 (Half-Dim)",  group: "Sevenths" },
  { value: "diminished7",       label: "°7 (Dim7)",       group: "Sevenths" },
  { value: "minor-major7",      label: "mMaj7",           group: "Sevenths" },
  { value: "augmented-major7",  label: "+Maj7",           group: "Sevenths" },
  // Ninths
  { value: "dominant9",         label: "9 (Dom9)",        group: "Ninths" },
  { value: "major9",            label: "Maj9",            group: "Ninths" },
  { value: "minor9",            label: "m9",              group: "Ninths" },
  // Add chords
  { value: "add9",              label: "Add9",            group: "Add" },
  { value: "minadd9",           label: "mAdd9",           group: "Add" },
  // Altered
  { value: "7b9",               label: "7b9",             group: "Altered" },
  { value: "11s",               label: "7#11 (Lyd Dom)",  group: "Altered" },
  { value: "majs9",             label: "7#9",             group: "Altered" },
] as const;
export type QualityValue = (typeof QUALITY_OPTIONS)[number]["value"];

export const SCALE_OPTIONS = defaultScaleRegistry.names.map(name => ({
  value: name,
  label: name.charAt(0).toUpperCase() + name.slice(1),
  group: defaultScaleRegistry.get(name)?.category ?? "diatonic",
}));

// ── Label helpers ─────────────────────────────────────────────────────────────

const DEGREE_LABEL_MAP: Record<number, string> = {
  0: "R", 1: "b2", 2: "2", 3: "b3", 4: "3",
  5: "4", 6: "b5", 7: "5", 8: "b6", 9: "6", 10: "b7", 11: "7",
};

const INTERVAL_LABEL_MAP: Record<number, string> = {
  0: "P1", 1: "m2", 2: "M2", 3: "m3", 4: "M3",
  5: "P4", 6: "d5", 7: "P5", 8: "m6", 9: "M6", 10: "m7", 11: "M7",
};

export function degreeLabel(semitones: number): string {
  return DEGREE_LABEL_MAP[((semitones % 12) + 12) % 12] ?? "?";
}

export function intervalLabel(semitones: number): string {
  return INTERVAL_LABEL_MAP[((semitones % 12) + 12) % 12] ?? "?";
}

// ── Display name helpers ──────────────────────────────────────────────────────

const ACC_DISPLAY: Record<Accidental, string> = {
  [Accidental.DoubleFlat]:  "𝄫",
  [Accidental.Flat]:        "♭",
  [Accidental.Natural]:     "",
  [Accidental.Sharp]:       "♯",
  [Accidental.DoubleSharp]: "𝄪",
};

export function spellingToDisplay(spelling: SpelledNoteName): string {
  const letters = ["C", "D", "E", "F", "G", "A", "B"] as const;
  return `${letters[spelling.letter]}${ACC_DISPLAY[spelling.accidental]}`;
}

const QUALITY_DISPLAY: Partial<Record<string, string>> = {
  major: "",            minor: "m",
  diminished: "°",      augmented: "+",
  sus2: "sus2",         sus4: "sus4",
  major7: "maj7",       dominant7: "7",
  minor7: "m7",         "half-diminished7": "ø7",
  diminished7: "°7",    "minor-major7": "mMaj7",
  "augmented-major7": "+Maj7",
  major9: "maj9",       dominant9: "9",       minor9: "m9",
  major11: "maj11",     dominant11: "11",     minor11: "m11",
  major13: "maj13",     dominant13: "13",     minor13: "m13",
  add9: "add9",         "minor-add9": "madd9",
  "dominant7sus4": "7sus4", "dominant7sus2": "7sus2",
};

export function chordDisplayName(chord: Chord): string {
  const root = spellingToDisplay(chord.root.spelling);
  const quality = QUALITY_DISPLAY[chord.quality.kind] ?? chord.quality.kind;
  return `${root}${quality}`;
}

// ── Parse helpers (clamp-on-error) ───────────────────────────────────────────

const LETTER_MAP: Record<string, NoteLetter> = {
  C: NoteLetter.C, D: NoteLetter.D, E: NoteLetter.E,
  F: NoteLetter.F, G: NoteLetter.G, A: NoteLetter.A, B: NoteLetter.B,
};

function parseSpelling(name: string): SpelledNoteName {
  const upper = name.trim();
  const letter = LETTER_MAP[upper[0]?.toUpperCase() ?? "C"] ?? NoteLetter.C;
  const rest = upper.slice(1);
  let accidental = Accidental.Natural;
  if (rest === "#" || rest === "♯") accidental = Accidental.Sharp;
  else if (rest === "b" || rest === "♭") accidental = Accidental.Flat;
  else if (rest === "##" || rest === "x") accidental = Accidental.DoubleSharp;
  else if (rest === "bb") accidental = Accidental.DoubleFlat;
  return { letter, accidental };
}

/** Parse a note name string ("G", "Bb", "F#") into a Pitch at octave 4. */
export function parseRoot(name: string, octave = 4): Pitch {
  try {
    return pitchFactory.fromSpelling(parseSpelling(name), octave);
  } catch {
    if (import.meta.env.DEV) {
      console.warn(`[engine] Invalid root "${name}", falling back to C4`);
    }
    return pitchFactory.fromSpelling({ letter: NoteLetter.C, accidental: Accidental.Natural }, 4);
  }
}

/** Parse note name + modality string into a Key. Falls back to C major. */
export function parseKey(noteName: string, modality: string): Key {
  try {
    const root = parseRoot(noteName);
    const mode: Modality = modality === "minor" ? "minor" : "major";
    return keyFactory.build(root, mode);
  } catch {
    if (import.meta.env.DEV) {
      console.warn(`[engine] Invalid key "${noteName} ${modality}", falling back to C major`);
    }
    return keyFactory.major(0);
  }
}

// ── Fretboard singleton cache ─────────────────────────────────────────────────

const _fretboardCache = new Map<string, Fretboard>();

/** Returns a stable cached Fretboard for the given tuning name. O(1) after first call. */
export function getFretboard(tuningName: string): Fretboard {
  const key = tuningName.toLowerCase();
  if (!_fretboardCache.has(key)) {
    const tuning = tuningRegistry.get(tuningName) ?? STANDARD_TUNING;
    _fretboardCache.set(key, fretboardFactory.build(tuning));
  }
  return _fretboardCache.get(key)!;
}

// ── Chord build + voicing cache ───────────────────────────────────────────────

const TRIAD_QUALITIES = new Set(["major", "minor", "diminished", "augmented", "sus2", "sus4"]);
const SEVENTH_QUALITIES = new Set([
  "major7", "dominant7", "minor7", "half-diminished7",
  "diminished7", "minor-major7", "augmented-major7",
]);

/** Build a Chord from root name + quality string. Falls back to C major triad. */
export function buildChord(rootName: string, quality: string): Chord {
  const root = parseRoot(rootName);
  try {
    if (TRIAD_QUALITIES.has(quality)) {
      return chordFactory.triad(root, quality as Parameters<typeof chordFactory.triad>[1]);
    }
    if (SEVENTH_QUALITIES.has(quality)) {
      return chordFactory.seventh(root, quality as Parameters<typeof chordFactory.seventh>[1]);
    }
    // Extended / altered — try fromName
    return chordFactory.fromName(quality, root);
  } catch {
    if (import.meta.env.DEV) {
      console.warn(`[engine] Unknown quality "${quality}", falling back to major triad`);
    }
    return chordFactory.triad(root, "major");
  }
}

const _voicingCache = new Map<string, ReadonlyArray<Fingering>>();

/** Returns cached fingerings for root+quality+tuning. Runs shapeFinder once per combination. */
export function getVoicings(
  root: string,
  quality: string,
  tuning: string,
): ReadonlyArray<Fingering> {
  const cacheKey = `${root}|${quality}|${tuning.toLowerCase()}`;
  if (!_voicingCache.has(cacheKey)) {
    const chord = buildChord(root, quality);
    const fretboard = getFretboard(tuning);
    _voicingCache.set(cacheKey, shapeFinder.findWithFingering(chord, fretboard));
  }
  return _voicingCache.get(cacheKey)!;
}

// ── Roman numeral helper ──────────────────────────────────────────────────────

/** Returns roman numeral string for chord in key, or "" if chord is non-diatonic. */
export function getRomanNumeral(chord: Chord, key: Key): string {
  try {
    const token = romanNumeralAnalyzer.analyze(chord, key);
    return romanNumeralAnalyzer.render(token);
  } catch {
    return "";
  }
}

// ── Highlight builders ────────────────────────────────────────────────────────

/**
 * Build FretHighlight[] from a Fingering + Chord.
 * Used by useChord for the fretboard + chord diagram display.
 */
export function buildChordHighlights(fingering: Fingering, chord: Chord): FretHighlight[] {
  const rootPc = chord.root.pitchClass as number;
  return fingering.assignments.map(a => {
    const pc = a.position.pitch.pitchClass as number;
    const semitones = ((pc - rootPc) + 12) % 12;
    return {
      string: a.position.string,
      fret: a.position.fret,
      color: semitoneToColor(semitones),
      labels: {
        degree:   degreeLabel(semitones),
        interval: intervalLabel(semitones),
        finger:   a.finger > 0 ? String(a.finger) : "",
      },
      finger: a.finger,
      isRoot: semitones === 0,
    };
  });
}

/**
 * Build FretHighlight[] from scale positions + Scale.
 * Used by useScale and useArpeggios.
 */
export function buildScaleHighlights(
  positions: ReadonlyArray<FretPosition>,
  rootPitchClass: number,
): FretHighlight[] {
  return positions.map(pos => {
    const pc = pos.pitch.pitchClass as number;
    const semitones = ((pc - rootPitchClass) + 12) % 12;
    return {
      string: pos.string,
      fret: pos.fret,
      color: semitoneToColor(semitones),
      labels: {
        degree:   degreeLabel(semitones),
        interval: intervalLabel(semitones),
        finger:   "",
      },
      isRoot: semitones === 0,
    };
  });
}

/**
 * Derive StringState[] (open/muted/played) from a Fingering's slot array.
 * Slots are ordered string-6 → string-1 in fretboard tuning order.
 */
export function getStringStates(fingering: Fingering): StringState[] {
  return fingering.voicing.slots.map(slot => {
    if (slot === null) return "muted";
    if (slot.fret === 0) return "open";
    return "played";
  });
}
