import type { Chord } from "@orpheus/engine";
import type { Fretboard } from "../fretboard/fretboard.js";
import type { FretPosition, ChordVoicing } from "../types/fret-position.js";
import type { FretboardConstraints, Fingering } from "../types/fingering.js";
import { fingeringAnalyzer } from "../fingering/fingering-analyzer.js";
import { scoreVoicing } from "./shape-scorer.js";

function activeSpan(voicing: ChordVoicing): number {
  const active = voicing.slots
    .filter((s): s is NonNullable<typeof s> => s !== null)
    .map(p => p.fret)
    .filter(f => f > 0);
  if (active.length < 2) return 0;
  return Math.max(...active) - Math.min(...active);
}

function pitchClassesPresent(voicing: ChordVoicing): Set<number> {
  const pcs = new Set<number>();
  for (const slot of voicing.slots) {
    if (slot !== null) pcs.add(slot.pitch.pitchClass as number);
  }
  return pcs;
}

// Generate all combinations from per-string candidate lists (one slot per string).
// Each string contributes one of its candidates OR null (muted).
function* combinations(
  perString: ReadonlyArray<ReadonlyArray<FretPosition | null>>,
): Generator<ReadonlyArray<FretPosition | null>> {
  const n = perString.length;
  const indices = new Array<number>(n).fill(0);

  while (true) {
    yield indices.map((idx, i) => perString[i]![idx]!);

    let carry = n - 1;
    while (carry >= 0 && indices[carry]! + 1 >= perString[carry]!.length) carry--;
    if (carry < 0) break;
    indices[carry]!++;
    for (let j = carry + 1; j < n; j++) indices[j] = 0;
  }
}

export const shapeFinder = {
  find(chord: Chord, fretboard: Fretboard, constraints: FretboardConstraints = {}): ReadonlyArray<ChordVoicing> {
    const {
      maxFretSpan = 4,
      allowOpenStrings = true,
      requireRootInBass = false,
      minStrings = 3,
      fromFret = 0,
      toFret = 12,
    } = constraints;

    const requiredPCs = new Set(chord.pitches.map(p => p.pitchClass as number));
    const rootPC = chord.root.pitchClass as number;

    // Per-string candidates: positions with a required pitch class, plus null (mute)
    const stringNumbers = fretboard.tuning.strings.map(s => s.number);
    const perString: Array<Array<FretPosition | null>> = stringNumbers.map(sn => {
      const candidates = fretboard.positionsForString(sn)
        .filter(p => p.fret >= (allowOpenStrings ? 0 : 1) && p.fret <= toFret && p.fret >= fromFret)
        .filter(p => requiredPCs.has(p.pitch.pitchClass as number));
      return [null, ...candidates]; // null = muted
    });

    const results: ChordVoicing[] = [];
    const seen = new Set<string>();

    for (const combo of combinations(perString)) {
      const played = combo.filter((s): s is FretPosition => s !== null);
      if (played.length < minStrings) continue;

      // Check fret span
      const voicing: ChordVoicing = { slots: combo };
      if (activeSpan(voicing) > maxFretSpan) continue;

      // Must cover all required pitch classes
      const pcs = pitchClassesPresent(voicing);
      let allCovered = true;
      for (const pc of requiredPCs) {
        if (!pcs.has(pc)) { allCovered = false; break; }
      }
      if (!allCovered) continue;

      // Root-in-bass constraint
      if (requireRootInBass) {
        const lowestPlayed = played.reduce((a, b) => a.string > b.string ? a : b); // highest string number = lowest pitch
        if (lowestPlayed.pitch.pitchClass !== rootPC) continue;
      }

      // Deduplicate by (string, fret) signature
      const sig = combo.map(s => s === null ? "x" : `${s.string}:${s.fret}`).join(",");
      if (seen.has(sig)) continue;
      seen.add(sig);

      results.push(voicing);
    }

    results.sort((a, b) => scoreVoicing(a) - scoreVoicing(b));
    return results;
  },

  findWithFingering(chord: Chord, fretboard: Fretboard, constraints: FretboardConstraints = {}): ReadonlyArray<Fingering> {
    const voicings = shapeFinder.find(chord, fretboard, constraints);
    const fingerings: Fingering[] = [];

    for (const voicing of voicings) {
      try {
        fingerings.push(fingeringAnalyzer.assign(voicing));
      } catch {
        // Skip voicings that exceed 4-finger limit
      }
    }

    fingerings.sort((a, b) => a.difficulty - b.difficulty);
    return fingerings;
  },
};
