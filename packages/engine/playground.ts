/**
 * @orpheus/engine — Playground — Debug Scales
 */

import {
  pitchFactory,
  scaleFactory,
  defaultScaleRegistry,
  NoteLetter,
  Accidental,
  spelledNoteNameToString,
  SpelledNoteName,
} from "./src/index.ts";

function sep(title: string) {
  const line = "─".repeat(50);
  console.log(`\n${line}`);
  console.log(`  ${title}`);
  console.log(line);
}

function note(letter: NoteLetter, acc: Accidental = Accidental.Natural, octave = 4) {
  return pitchFactory.fromSpelling({ letter, accidental: acc }, octave);
}

const majorPattern = defaultScaleRegistry.get("major")!;

// ── Test 1: Direct toString on raw spellings ──────────────────────────────────

sep("Test 1 — Direct toString");

const rawCb: SpelledNoteName = { letter: NoteLetter.C, accidental: Accidental.Flat };
const rawFb: SpelledNoteName = { letter: NoteLetter.F, accidental: Accidental.Flat };
const rawBb: SpelledNoteName = { letter: NoteLetter.B, accidental: Accidental.Flat };

console.log("Raw Cb:", spelledNoteNameToString(rawCb));
console.log("Raw Fb:", spelledNoteNameToString(rawFb));
console.log("Raw Bb:", spelledNoteNameToString(rawBb));

// ── Test 2: Single pitch from factory ─────────────────────────────────────────

sep("Test 2 — Single pitch from factory");

const CbPitch = note(NoteLetter.C, Accidental.Flat);
console.log("Cb pitch.spelling:", JSON.stringify(CbPitch.spelling));
console.log("Cb toString:", spelledNoteNameToString(CbPitch.spelling));

// ── Test 3: Scale pitches one by one ──────────────────────────────────────────

sep("Test 3 — Scale pitches one by one");

const CbScale = scaleFactory.build(majorPattern, note(NoteLetter.C, Accidental.Flat));

console.log("Cb major scale — inspecting each pitch:");
CbScale.pitches.forEach((p, i) => {
  const s = p.spelling;
  console.log(`  [${i}]`);
  console.log(`      p.spelling exists? ${!!s}`);
  console.log(`      s.letter = ${s.letter} (type: ${typeof s.letter})`);
  console.log(`      s.accidental = ${s.accidental} (type: ${typeof s.accidental})`);
  console.log(`      spelledNoteNameToString(s) = "${spelledNoteNameToString(s)}"`);
});

// ── Test 4: Manual map (same as describeScale) ────────────────────────────────

sep("Test 4 — Manual map");

const notes = CbScale.pitches.map(p => spelledNoteNameToString(p.spelling));
console.log("Mapped array:", notes);
console.log("Joined:", notes.join("  "));

// ── Test 5: Compare with C major scale ────────────────────────────────────────

sep("Test 5 — Compare with C major");

const CScale = scaleFactory.build(majorPattern, note(NoteLetter.C));
const cNotes = CScale.pitches.map(p => spelledNoteNameToString(p.spelling));
console.log("C major joined:", cNotes.join("  "));