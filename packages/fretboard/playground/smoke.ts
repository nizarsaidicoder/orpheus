import { pitchFactory, chordFactory } from "@orpheus/engine";
import { STANDARD_TUNING } from "../src/tunings/standard-tunings.ts";
import { Fretboard } from "../src/fretboard/fretboard.ts";
import { shapeFinder } from "../src/chord-shapes/shape-finder.ts";

const fb = new Fretboard(STANDARD_TUNING, 24);
const C4 = pitchFactory.fromMidi(60);
const cMaj = chordFactory.triad(C4, "major");

const dbOnly = shapeFinder.find(cMaj, fb);
const withCombo = shapeFinder.find(cMaj, fb, { combinatorial: true });

console.log("DB-only:", dbOnly.length, "voicings");
console.log("  first:", dbOnly[0]?.slots.map(s => s === null ? "x" : s.fret).join(","));
console.log("  second:", dbOnly[1]?.slots.map(s => s === null ? "x" : s.fret).join(","));
console.log("With combo:", withCombo.length, "voicings");

// DB voicings should appear first in combined set
const sigOf = (v: typeof dbOnly[0]) =>
  v!.slots.map(s => s === null ? "x" : `${s.string}:${s.fret}`).join(",");

const match = dbOnly.every((v, i) => sigOf(v) === sigOf(withCombo[i]!));
console.log("DB voicings = first N of combined:", match);

// Test chord with no DB entry falls back gracefully
const unknownChord = chordFactory.seventh(C4, "minor-major7");
const fallback = shapeFinder.find(unknownChord, fb, { combinatorial: true });
const fallbackDbOnly = shapeFinder.find(unknownChord, fb);
console.log("\nmMinMaj7 DB-only:", fallbackDbOnly.length, "(expect >0 if in DB, 0 if not)");
console.log("mMinMaj7 with combo:", fallback.length);
