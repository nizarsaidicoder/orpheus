import type { Pitch } from "@orpheus/engine";
import type { BarreSegment } from "./fingering.ts";
import type { CAGEDShape } from "../caged/index.ts";

export interface FretPosition {
  readonly string: number;
  readonly fret: number;
  readonly pitch: Pitch;
}

export interface ChordVoicing {
  readonly slots: ReadonlyArray<FretPosition | null>;
  readonly barre?: BarreSegment;
  readonly shape?: CAGEDShape | null;

}

export interface ScalePosition {
  readonly positions: ReadonlyArray<FretPosition>;
  readonly fretRange: readonly [number, number];
}
