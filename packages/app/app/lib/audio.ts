// ── Audio layer — Tone.js Sampler singleton ───────────────────────────────────
// Lazy-init on first call (satisfies browser autoplay policy).
// Uses Salamander acoustic guitar samples hosted on nbrosowsky's CDN.
//
// Sample URLs: https://nbrosowsky.github.io/tonejs-instruments/samples/guitar-acoustic/

import * as Tone from "tone";
import type { Pitch } from "@orpheus/engine";

// ── Sampler config ────────────────────────────────────────────────────────────

const SAMPLE_BASE_URL =
  "https://nbrosowsky.github.io/tonejs-instruments/samples/guitar-acoustic/";

const SAMPLE_URLS: Record<string, string> = {
  E2: "E2.mp3",
  A2: "A2.mp3",
  D3: "D3.mp3",
  G3: "G3.mp3",
  B3: "B3.mp3",
  E4: "E4.mp3",
};

// ── Singleton state ───────────────────────────────────────────────────────────

let sampler: Tone.Sampler | null = null;
let isLoaded   = false;
let isLoading  = false;

// ── Init (lazy) ───────────────────────────────────────────────────────────────

async function ensureLoaded(): Promise<void> {
  if (isLoaded) return;
  if (isLoading) {
    // Wait for in-flight load
    await new Promise<void>((resolve) => {
      const check = setInterval(() => {
        if (isLoaded) { clearInterval(check); resolve(); }
      }, 50);
    });
    return;
  }

  isLoading = true;
  await Tone.start(); // unlock AudioContext on first user gesture

  sampler = new Tone.Sampler({
    urls: SAMPLE_URLS,
    baseUrl: SAMPLE_BASE_URL,
    onload: () => {
      isLoaded  = true;
      isLoading = false;
    },
  }).toDestination();
}

// ── Pitch → Tone.js note name ─────────────────────────────────────────────────

function pitchToTone(pitch: Pitch): string {
  // Tone.js uses "C4", "Bb3", "F#5" format
  const NOTE_NAMES = ["C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
  const pc = (pitch.pitchClass as number) % 12;
  const octave = pitch.octave as number;
  return `${NOTE_NAMES[pc]}${octave}`;
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Play a single note. Duration in seconds (default 1.5s). */
export async function playNote(pitch: Pitch, duration = 1.5): Promise<void> {
  try {
    await ensureLoaded();
    sampler?.triggerAttackRelease(pitchToTone(pitch), duration);
  } catch (err) {
    if (import.meta.env.DEV) console.warn("[audio] playNote error", err);
  }
}

/**
 * Play a chord.
 * @param strum  If true, notes are offset 30ms low→high for a strumming effect.
 */
export async function playChord(pitches: Pitch[], strum = false): Promise<void> {
  if (pitches.length === 0) return;
  try {
    await ensureLoaded();
    const now = Tone.now();
    const sorted = [...pitches].sort(
      (a, b) => (a.midi as number) - (b.midi as number),
    );
    sorted.forEach((p, i) => {
      const offset = strum ? i * 0.03 : 0;
      sampler?.triggerAttackRelease(pitchToTone(p), 2, now + offset);
    });
  } catch (err) {
    if (import.meta.env.DEV) console.warn("[audio] playChord error", err);
  }
}

/**
 * Play a progression: one chord per bar at the given BPM.
 * Each chord's pitches should be pre-resolved from the Chord object.
 */
export async function playProgression(
  chordPitches: Pitch[][],
  bpm = 80,
): Promise<void> {
  if (chordPitches.length === 0) return;
  try {
    await ensureLoaded();
    const secondsPerBeat = 60 / bpm;
    const now = Tone.now();
    chordPitches.forEach((pitches, barIdx) => {
      const barOffset = barIdx * secondsPerBeat * 4; // 4/4 time, 1 bar per chord
      const sorted = [...pitches].sort(
        (a, b) => (a.midi as number) - (b.midi as number),
      );
      sorted.forEach((p, noteIdx) => {
        const strumOffset = noteIdx * 0.03;
        sampler?.triggerAttackRelease(
          pitchToTone(p),
          secondsPerBeat * 3.5, // hold for 3.5 beats
          now + barOffset + strumOffset,
        );
      });
    });
  } catch (err) {
    if (import.meta.env.DEV) console.warn("[audio] playProgression error", err);
  }
}

/** Whether the sampler has finished loading samples. */
export function audioReady(): boolean {
  return isLoaded;
}
