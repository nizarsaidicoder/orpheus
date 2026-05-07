import { Fretboard } from "./fretboard.js";
import type { Tuning } from "../types/tuning.js";

export const fretboardFactory = {
  build(tuning: Tuning, fretCount = 24): Fretboard {
    return new Fretboard(tuning, fretCount);
  },
};
