// @orpheus/fretboard
// Guitar and string-instrument theory — fret positions, tunings, chord shapes.

// Types
export type { GuitarString, Tuning } from "./types/tuning.js";
export type { FretPosition, ChordVoicing, ScalePosition } from "./types/fret-position.js";
export type { Fingering, FingerAssignment, BarreSegment, FretboardConstraints, Finger } from "./types/fingering.js";
export type { CAGEDShape, CAGEDPosition } from "./caged/caged-system.js";

// Tunings
export { STANDARD_TUNING, DROP_D, OPEN_G, OPEN_E, DADGAD, HALF_STEP_DOWN, WHOLE_STEP_DOWN } from "./tunings/standard-tunings.js";
export { tuningFactory, tuningRegistry } from "./tunings/tuning-factory.js";

// Core
export { Fretboard } from "./fretboard/fretboard.js";
export { fretboardFactory } from "./fretboard/fretboard-factory.js";
export { ScaleMap } from "./scale-map/scale-map.js";
export { scaleMapFactory } from "./scale-map/scale-map-factory.js";

// Chord shapes & fingering
export { shapeFinder } from "./chord-shapes/shape-finder.js";
export { fingeringAnalyzer, handOptimizer } from "./fingering/index.js";

// CAGED + analysis
export { cagedSystem } from "./caged/caged-system.js";
export { positionAnalyzer } from "./analysis/position-analyzer.js";
