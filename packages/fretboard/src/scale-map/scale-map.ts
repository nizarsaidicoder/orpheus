import type { Scale } from "@orpheus/engine";
import type { Fretboard } from "../fretboard/fretboard.js";
import type { FretPosition, ScalePosition } from "../types/fret-position.js";

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
    const rootPC = this.scale.root.pitchClass;
    const result: ScalePosition[] = [];
    const maxFret = this.fretboard.fretCount;
    const seen = new Set<string>();

    for (let start = 0; start <= maxFret - fretSpan; start++) {
      const end = start + fretSpan;
      const inWindow = this.positionsInFretRange(start, end);
      if (inWindow.length === 0) continue;

      // Deduplicate windows by their pitch-class fingerprint
      const pcKey = [...new Set(inWindow.map(p => p.pitch.pitchClass))].sort().join(",");
      if (seen.has(pcKey)) continue;
      seen.add(pcKey);

      // Tag CAGED shape: look for a root position in the window
      let cagedShape: ScalePosition["cagedShape"];
      const rootPositions = inWindow.filter(p => p.pitch.pitchClass === rootPC);
      if (rootPositions.length > 0) {
        cagedShape = _detectCagedShape(rootPositions[0]!, this.fretboard);
      }

      const sp: ScalePosition = cagedShape !== undefined
        ? { positions: inWindow, fretRange: [start, end], cagedShape }
        : { positions: inWindow, fretRange: [start, end] };
      result.push(sp);
    }

    return result;
  }
}

// Rough CAGED shape detection by root fret position and string
function _detectCagedShape(rootPos: FretPosition, fretboard: Fretboard): ScalePosition["cagedShape"] {
  const stringCount = fretboard.stringCount;
  const isLowString = rootPos.string >= Math.ceil(stringCount / 2);

  if (rootPos.fret === 0 && isLowString) return "E";
  if (rootPos.fret === 0 && !isLowString) return "D";
  if (rootPos.fret <= 2 && isLowString) return "A";
  if (rootPos.fret <= 4) return "G";
  return "C";
}
