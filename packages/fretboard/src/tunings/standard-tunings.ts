import { tuningFactory, tuningRegistry } from "./tuning-factory.js";

// Standard 6-string guitar tunings. midis listed low→high (string N→string 1).

export const STANDARD_TUNING = tuningFactory.fromMidiArray("Standard", [40, 45, 50, 55, 59, 64]);
export const DROP_D          = tuningFactory.fromMidiArray("Drop D",    [38, 45, 50, 55, 59, 64]);
export const OPEN_G          = tuningFactory.fromMidiArray("Open G",    [38, 43, 50, 55, 59, 62]);
export const OPEN_E          = tuningFactory.fromMidiArray("Open E",    [40, 47, 52, 56, 59, 64]);
export const DADGAD          = tuningFactory.fromMidiArray("DADGAD",    [38, 45, 50, 55, 57, 62]);
export const HALF_STEP_DOWN  = tuningFactory.fromMidiArray("Half Step Down", [39, 44, 49, 54, 58, 63]);
export const WHOLE_STEP_DOWN = tuningFactory.fromMidiArray("Whole Step Down", [38, 43, 48, 53, 57, 62]);

[STANDARD_TUNING, DROP_D, OPEN_G, OPEN_E, DADGAD, HALF_STEP_DOWN, WHOLE_STEP_DOWN]
  .forEach(t => tuningRegistry.register(t));
