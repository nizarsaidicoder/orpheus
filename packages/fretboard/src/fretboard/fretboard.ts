import { pitchArithmetic } from "@orpheus/engine";
import type { Pitch, PitchClass } from "@orpheus/engine";
import type { Tuning } from "../types/tuning.ts";
import type { FretPosition } from "../types/fret-position.ts";

export class Fretboard {
  readonly tuning: Tuning;
  readonly fretCount: number;

  constructor(tuning: Tuning, fretCount = 24) {
    this.tuning = tuning;
    this.fretCount = fretCount;
  }

  get stringCount(): number {
    return this.tuning.strings.length;
  }

  pitchAt(stringNumber: number, fret: number): Pitch {
    const str = this.tuning.strings.find(s => s.number === stringNumber);
    if (str === undefined) throw new RangeError(`String ${stringNumber} not in tuning`);
    if (fret < 0 || fret > this.fretCount) throw new RangeError(`Fret ${fret} out of range`);
    return pitchArithmetic.transpose(str.openPitch, fret);
  }

  positionsForString(stringNumber: number): ReadonlyArray<FretPosition> {
    const result: FretPosition[] = [];
    for (let fret = 0; fret <= this.fretCount; fret++) {
      result.push({ string: stringNumber, fret, pitch: this.pitchAt(stringNumber, fret) });
    }
    return result;
  }

  positionsForPitch(pitch: Pitch): ReadonlyArray<FretPosition> {
    return this._allPositions().filter(p => p.pitch.midi === pitch.midi);
  }

  positionsForPitchClass(pc: number): ReadonlyArray<FretPosition> {
    return this._allPositions().filter(p => p.pitch.pitchClass === (pc as PitchClass));
  }

  positionsInRange(fromFret: number, toFret: number): ReadonlyArray<FretPosition> {
    return this._allPositions().filter(p => p.fret >= fromFret && p.fret <= toFret);
  }

  private _allPositions(): ReadonlyArray<FretPosition> {
    const result: FretPosition[] = [];
    for (const str of this.tuning.strings) {
      for (let fret = 0; fret <= this.fretCount; fret++) {
        result.push({
          string: str.number,
          fret,
          pitch: pitchArithmetic.transpose(str.openPitch, fret),
        });
      }
    }
    return result;
  }
}
