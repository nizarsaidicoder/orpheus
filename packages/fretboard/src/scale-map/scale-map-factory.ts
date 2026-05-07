import type { Scale } from "@orpheus/engine";
import type { Fretboard } from "../fretboard/fretboard.js";
import { ScaleMap } from "./scale-map.js";

export const scaleMapFactory = {
  build(scale: Scale, fretboard: Fretboard): ScaleMap {
    return new ScaleMap(scale, fretboard);
  },
};
