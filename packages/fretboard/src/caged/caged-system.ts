import type { Key, Pitch } from "@orpheus/engine";
import type { ChordVoicing, FretPosition } from "../types/fret-position.js";
import type { Fretboard } from "../fretboard/fretboard.js";

export type CAGEDShape = "C" | "A" | "G" | "E" | "D";

export interface CAGEDPosition {
  readonly shape: CAGEDShape;
  readonly rootFret: number;
  readonly positions: ReadonlyArray<FretPosition>;
}

// Interval sets (semitones from root) that define each open-position CAGED shape
// Matched against a voicing's interval structure from its root note
const CAGED_INTERVAL_SETS: Readonly<Record<CAGEDShape, ReadonlySet<number>>> = {
  C: new Set([0, 4, 7, 12, 16]),    // C shape: root on string 5, open C position
  A: new Set([0, 4, 7, 12, 19]),    // A shape: root on string 5, barre at nut
  G: new Set([0, 4, 7, 11, 16]),    // G shape: root on string 6, open G position
  E: new Set([0, 4, 7, 12, 16, 19]),// E shape: root on string 6, open E position
  D: new Set([0, 4, 7, 14]),        // D shape: root on string 4, open D position
};

// Fret offset of each shape relative to C-shape root position (for C major root = fret 8)
// Order: C → A → G → E → D → C (ascending the neck)
const SHAPE_ORDER: ReadonlyArray<CAGEDShape> = ["C", "A", "G", "E", "D"];
const SHAPE_FRET_OFFSETS: Readonly<Record<CAGEDShape, number>> = {
  C: 0,
  A: 3,
  G: 5,
  E: 7,
  D: 10,
};

export const cagedSystem = {
  shapeOf(voicing: ChordVoicing, root: Pitch): CAGEDShape | null {
    const played = voicing.slots.filter((s): s is FretPosition => s !== null);
    if (played.length === 0) return null;

    const rootMidi = root.midi as number;
    const intervals = new Set(played.map(p => (p.pitch.midi as number) - rootMidi));

    let bestShape: CAGEDShape | null = null;
    let bestOverlap = 0;

    for (const shape of SHAPE_ORDER) {
      const template = CAGED_INTERVAL_SETS[shape];
      let overlap = 0;
      for (const iv of intervals) {
        if (template.has(iv) || template.has(iv + 12) || template.has(iv - 12)) overlap++;
      }
      if (overlap > bestOverlap) {
        bestOverlap = overlap;
        bestShape = shape;
      }
    }

    return bestOverlap >= 2 ? bestShape : null;
  },

  shapesForKey(key: Key, fretboard: Fretboard): ReadonlyArray<CAGEDPosition> {
    const rootPC = key.tonic.pitchClass as number;
    const scale = key.naturalScale;
    const result: CAGEDPosition[] = [];

    // Find C-shape root fret: lowest fret where root appears on string 5 (A string)
    // String 5 = second from lowest; for standard 6-string that's string 2 counting from low
    const stringCount = fretboard.stringCount;
    const aStringNumber = stringCount - 1; // string 2 from bottom (0-indexed from top = stringCount-1)

    // Anchor: find root on A string (string number = stringCount - 1 for standard)
    const rootPositionsOnA = fretboard.positionsForString(aStringNumber)
      .filter(p => p.pitch.pitchClass === rootPC && p.fret <= 12);

    const anchorFret = rootPositionsOnA.length > 0 ? rootPositionsOnA[0]!.fret : 0;

    for (const shape of SHAPE_ORDER) {
      const rootFret = (anchorFret + SHAPE_FRET_OFFSETS[shape]) % 12;
      const windowStart = Math.max(0, rootFret - 1);
      const windowEnd = windowStart + 4;
      const positions = fretboard.positionsInRange(windowStart, windowEnd)
        .filter(p => scale.contains(p.pitch));

      result.push({ shape, rootFret, positions });
    }

    return result;
  },

  nextShape(shape: CAGEDShape): CAGEDShape {
    const idx = SHAPE_ORDER.indexOf(shape);
    return SHAPE_ORDER[(idx + 1) % SHAPE_ORDER.length]!;
  },

  prevShape(shape: CAGEDShape): CAGEDShape {
    const idx = SHAPE_ORDER.indexOf(shape);
    return SHAPE_ORDER[(idx - 1 + SHAPE_ORDER.length) % SHAPE_ORDER.length]!;
  },
};
