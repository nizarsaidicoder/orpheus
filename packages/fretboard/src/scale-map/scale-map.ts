import type { Scale, DegreeNameOptions } from "@orpheus/engine";
import type { Fretboard } from "../fretboard/fretboard.ts";
import type { FretPosition, ScalePosition } from "../types/fret-position.ts";
export class ScaleMap {
  readonly scale: Scale;
  readonly fretboard: Fretboard;
  readonly positions: ReadonlyArray<FretPosition>;

  constructor(scale: Scale, fretboard: Fretboard) {
    this.scale = scale;
    this.fretboard = fretboard;
    this.positions = fretboard.positionsInRange(0, fretboard.fretCount)
      .filter(p => scale.contains(p.pitch));
  }

  positionsForString(stringNumber: number): ReadonlyArray<FretPosition> {
    return this.positions.filter(p => p.string === stringNumber);
  }

  positionsInFretRange(from: number, to: number): ReadonlyArray<FretPosition> {
    return this.positions.filter(p => p.fret >= from && p.fret <= to);
  }

  positionsForDegree(degree: number): ReadonlyArray<FretPosition> {
    const degPitch = this.scale.degree(degree);
    return this.positions.filter(p => p.pitch.pitchClass === degPitch.pitchClass);
  }

  scalePositions(fretSpan = 4): ReadonlyArray<ScalePosition> {
    const maxFret = this.fretboard.fretCount;
    const seen = new Set<string>();
    const result: ScalePosition[] = [];

    for (let start = 0; start <= maxFret - fretSpan; start++) {
      const end = start + fretSpan;
      const inWindow = this.positionsInFretRange(start, end);
      if (inWindow.length === 0) continue;

      const pcKey = [...new Set(inWindow.map(p => p.pitch.pitchClass))].sort().join(",");
      if (seen.has(pcKey)) continue;
      seen.add(pcKey);

      result.push({ positions: inWindow, fretRange: [start, end] });
    }

    return result;
  }
  degreeName(degree: number, options?: DegreeNameOptions): string {
    return this.scale.degreeName(degree, options);
  }
}

// function _detectCagedShape(rootPos: FretPosition, fretboard: Fretboard): CAGEDShape | undefined {
//   // Build a minimal voicing from the window positions and detect shape
//   const voicing = {
//     slots: [], // not needed — shapeOf works on intervals from root
//   };
//   // Simpler: use the root position's string + fret to look up CAGED shape
//   // C shape: root on string 5 (A string), finger shape covers frets root..root+3
//   // Use the cagedSystem's knowledge directly
//   const rootFret = rootPos.fret;
//   const stringNumber = rootPos.string;
//   const stringCount = fretboard.stringCount;

//   // Heuristic based on which string the root is on
//   if (stringNumber === stringCount || stringNumber === stringCount - 1) {
//     // Root on low E or A string → likely E or A shape
//     return rootFret <= 3 ? "E" : "A";
//   }
//   if (stringNumber === stringCount - 2) return "D";
//   if (stringNumber === stringCount - 3) return "G";
//   if (stringNumber === stringCount - 4) return "C";

//   return undefined;
// }