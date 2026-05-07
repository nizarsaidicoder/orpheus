import type { Scale } from "@orpheus/engine";
import type { Fretboard } from "../fretboard/fretboard.ts";
import { ScaleMap } from "./scale-map.ts";

export const scaleMapFactory = {
  build(scale: Scale, fretboard: Fretboard): ScaleMap {
    return new ScaleMap(scale, fretboard);
  },
};
