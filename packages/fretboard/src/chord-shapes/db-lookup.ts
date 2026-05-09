import type { Chord, ChordQuality } from "@orpheus/engine";
import type { Fretboard } from "../fretboard/fretboard.ts";
import type { FretPosition, ChordVoicing } from "../types/fret-position.ts";
import type { BarreSegment } from "../types/fingering.ts";
import { Accidental } from "@orpheus/engine";
import { CHORD_DB, type VoicingTemplate } from "./chord-db.ts";
import { cagedSystem } from "../caged/caged-system.ts";

// ---------------------------------------------------------------------------
// Root name → DB string
// ---------------------------------------------------------------------------

function rootToDbName(chord: Chord): string | null {
  const { letter, accidental } = chord.root.spelling;
  const LETTERS = ["C", "D", "E", "F", "G", "A", "B"] as const;
  const base = LETTERS[letter]!;
  if (accidental === Accidental.Natural)  return base;
  if (accidental === Accidental.Flat)     return base + "b";
  if (accidental === Accidental.Sharp)    return base + "#";
  return null; // double-flat / double-sharp not in DB
}

// ---------------------------------------------------------------------------
// Quality → DB suffix
// DB suffixes observed (see chord-db.ts keys):
//   "", m, dim, aug, sus2, sus4, 5, 6, 7, 7b5, 7sus4, 7♭9, 7♯9,
//   9, 9b5, 9♯11, 11, 13, maj7, maj7b5, maj7sus2, maj7♯5, maj9, maj11, maj13,
//   m7, m7♭5, m9, m11, m6, m69, dim7, aug7, aug9,
//   mMaj7, mMaj7b5, mMaj9, mMaj11, madd9, add9, add11, alt
// ---------------------------------------------------------------------------

function qualityToDbSuffix(quality: ChordQuality): string | null {
  switch (quality.kind) {
    case "major":              return "";
    case "minor":              return "m";
    case "diminished":         return "dim";
    case "augmented":          return "aug";
    case "sus2":               return "sus2";
    case "sus4":               return "sus4";
    case "no-third":           return "5";

    case "major7":             return "maj7";
    case "dominant7":          return "7";
    case "minor7":             return "m7";
    case "half-diminished7":   return "m7♭5";
    case "diminished7":        return "dim7";
    case "minor-major7":       return "mMaj7";
    case "augmented-major7":   return "maj7♯5"; // root M3 A5 M7 — DB key "maj7#5"

    case "dominant9":          return "9";
    case "major9":             return "maj9";
    case "minor9":             return "m9";

    case "dominant11":         return "11";
    case "major11":            return "maj11";
    case "minor11":            return "m11";

    case "dominant13":         return "13";
    case "major13":            return "maj13";
    case "minor13":            return null; // "m13" absent from DB

    case "add9":               return "add9";
    case "add11":              return "add11";
    case "add13":              return "6";   // add6 = add13 (no 7th)
    case "minor-add9":         return "madd9";
    case "minor-add11":        return null;  // not in DB
    case "minor-add13":        return "m6";  // minor 6 = minor add13

    case "dominant7sus4":      return "7sus4";
    case "dominant7sus2":      return null;  // not in DB
    case "major7sus4":         return null;  // not in DB
    case "major7sus2":         return "maj7sus2";
    case "major9sus4":         return null;  // not in DB

    case "minor-major9":       return "mMaj9";
    case "minor-major11":      return "mMaj11";
    case "minor-major13":      return null;

    case "augmented-major9":   return null;
    case "augmented-major11":  return null;

    case "half-diminished9":   return null;
    case "half-diminished11":  return null;

    case "diminished-add11":   return null;
    case "diminished-add13":   return null;

    case "altered":            return "alt";
  }
}

// ---------------------------------------------------------------------------
// Public: chord → DB key
// ---------------------------------------------------------------------------

export function chordToDbKey(chord: Chord): string | null {
  const root = rootToDbName(chord);
  if (root === null) return null;

  const suffix = qualityToDbSuffix(chord.quality);
  if (suffix === null) return null;

  let key = root + suffix;

  // Slash chord — append "/BassNote"
  if (chord.bassNote) {
    const { letter, accidental } = chord.bassNote.spelling;
    const LETTERS = ["C", "D", "E", "F", "G", "A", "B"] as const;
    const bassBase = LETTERS[letter]!;
    let bassName = bassBase;
    if (accidental === Accidental.Flat)  bassName += "b";
    if (accidental === Accidental.Sharp) bassName += "#";
    key += "/" + bassName;
  }

  return key;
}

// ---------------------------------------------------------------------------
// VoicingTemplate → ChordVoicing
// ---------------------------------------------------------------------------

// DB slot index order: [string-N (low), string-(N-1), …, string-1 (high)]
// ChordVoicing.slots order matches tuning.strings (ascending string number):
//   slots[0] = string 1 (high), slots[n-1] = string N (low)
// Mapping: voicingIdx i ← dbIdx (n-1-i), string = tuning.strings[i]
//
// Fret value encoding:
//   baseFret === 0  →  slotVal is absolute fret (0 = open string)
//   baseFret > 0    →  slotVal is relative: absoluteFret = baseFret + slotVal
//
// Barre values in template.barres[] are always absolute fret numbers.

function templateToVoicing(
  template: VoicingTemplate,
  fretboard: Fretboard,
): ChordVoicing | null {
  const n = fretboard.stringCount;
  if (template.slots.length !== n) return null;

  const voicingSlots: Array<FretPosition | null> = [];

  for (let voicingIdx = 0; voicingIdx < n; voicingIdx++) {
    const dbIdx = n - 1 - voicingIdx;
    const slotVal = template.slots[dbIdx]!;
    const str = fretboard.tuning.strings[voicingIdx]!;

    if (slotVal === null) {
      voicingSlots.push(null);
      continue;
    }

    const fret = template.baseFret === 0
      ? slotVal
      : template.baseFret + slotVal;

    if (fret < 0 || fret > fretboard.fretCount) return null;

    voicingSlots.push({
      string: str.number,
      fret,
      pitch: fretboard.pitchAt(str.number, fret),
    });
  }

  // Build barre from first barre fret (barres[] values are absolute)
  let barre: BarreSegment | undefined;
  if (template.barres && template.barres.length > 0) {
    const barreFret = template.barres[0]!;
    const barreStrings = voicingSlots
      .filter((s): s is FretPosition => s !== null && s.fret === barreFret)
      .map(s => s.string);

    if (barreStrings.length >= 2) {
      barre = {
        fret: barreFret,
        fromString: Math.min(...barreStrings),
        toString: Math.max(...barreStrings),
        finger: 1,
      };
    }
  }

  return barre !== undefined
    ? { slots: voicingSlots, barre }
    : { slots: voicingSlots };
}

// ---------------------------------------------------------------------------
// Validation — all played notes must be in the chord's PC set and root present
// ---------------------------------------------------------------------------

function isValidForChord(voicing: ChordVoicing, chord: Chord): boolean {
  const chordPCs = new Set(chord.pitches.map(p => p.pitchClass as number));
  const rootPC = chord.root.pitchClass as number;

  let hasRoot = false;
  for (const slot of voicing.slots) {
    if (slot === null) continue;
    const pc = slot.pitch.pitchClass as number;
    if (!chordPCs.has(pc)) return false;
    if (pc === rootPC) hasRoot = true;
  }

  return hasRoot;
}

// ---------------------------------------------------------------------------
// Public: look up and convert all DB templates for a chord
// ---------------------------------------------------------------------------

export function dbVoicings(chord: Chord, fretboard: Fretboard): ChordVoicing[] {
  const key = chordToDbKey(chord);
  if (key === null) return [];

  const templates = CHORD_DB[key];
  if (!templates || templates.length === 0) return [];

  const results: ChordVoicing[] = [];

  for (const template of templates) {
    const voicing = templateToVoicing(template, fretboard);
    if (voicing === null) continue;
    if (!isValidForChord(voicing, chord)) continue;

    const shape = cagedSystem.shapeOf(voicing, chord.root);
    results.push({ ...voicing, shape });
  }

  return results;
}
