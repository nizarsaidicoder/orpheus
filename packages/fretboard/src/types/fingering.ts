import type { FretPosition, ChordVoicing } from "./fret-position.ts";

export type Finger = 0 | 1 | 2 | 3 | 4;

export interface FingerAssignment {
  readonly position: FretPosition;
  readonly finger: Finger;
  readonly isBarre: boolean;
}

export interface BarreSegment {
  readonly fret: number;
  readonly fromString: number;
  readonly toString: number;
  readonly finger: 1;
}

export interface Fingering {
  readonly voicing: ChordVoicing;
  readonly assignments: ReadonlyArray<FingerAssignment>;
  readonly difficulty: number;
}

export interface FretboardConstraints {
  readonly maxFretSpan?: number;
  readonly allowOpenStrings?: boolean;
  readonly requireRootInBass?: boolean;
  readonly minStrings?: number;
  readonly maxStrings?: number;
  readonly fromFret?: number;
  readonly toFret?: number;
}
