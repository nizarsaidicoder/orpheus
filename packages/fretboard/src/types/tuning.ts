import type { Pitch } from "@orpheus/engine";

export interface GuitarString {
  readonly number: number;
  readonly openPitch: Pitch;
}

export interface Tuning {
  readonly name: string;
  readonly strings: ReadonlyArray<GuitarString>;
}
