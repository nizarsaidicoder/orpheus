// @orpheus/fretboard — Guitar and string-instrument theory

// Types (re-exported from folder barrel)
export type { GuitarString, Tuning } from "./types/index.ts";
export type { FretPosition, ChordVoicing, ScalePosition } from "./types/index.ts";
export type { Fingering, FingerAssignment, BarreSegment, FretboardConstraints, Finger } from "./types/index.ts";
export type { CAGEDShape, CAGEDPosition } from "./caged/index.ts";

// Tunings
export { STANDARD_TUNING, DROP_D, OPEN_G, OPEN_E, DADGAD, HALF_STEP_DOWN, WHOLE_STEP_DOWN } from "./tunings/index.ts";
export { tuningFactory, tuningRegistry } from "./tunings/index.ts";

// Core
export { Fretboard, fretboardFactory } from "./fretboard/index.ts";
export { ScaleMap, scaleMapFactory } from "./scale-map/index.ts";

// Chord shapes & fingering
export { shapeFinder } from "./chord-shapes/index.ts";
export { fingeringAnalyzer, handOptimizer } from "./fingering/index.ts";

// CAGED + analysis
export { cagedSystem } from "./caged/index.ts";
export { positionAnalyzer } from "./analysis/index.ts";
