import { Fretboard } from "./fretboard.ts";
import type { Tuning } from "../types/tuning.ts";

export const fretboardFactory = {
  build(tuning: Tuning, fretCount = 24): Fretboard {
    return new Fretboard(tuning, fretCount);
  },
};
