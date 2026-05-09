import type { Chord } from "@orpheus/engine";
import type { Fretboard } from "../fretboard/fretboard.ts";
import type { FretPosition, ChordVoicing } from "../types/fret-position.ts";
import type { FretboardConstraints, Fingering } from "../types/fingering.ts";
import { fingeringAnalyzer } from "../fingering/fingering-analyzer.ts";
import { scoreVoicing } from "./shape-scorer.ts";
import { cagedSystem } from "../caged/caged-system.ts";
import { dbVoicings } from "./db-lookup.ts";

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

/** Signature used for deduplication: "x" for muted, "string:fret" for played. */
function sig(voicing: ChordVoicing): string {
  return voicing.slots.map(s => s === null ? "x" : `${s.string}:${s.fret}`).join(",");
}

/**
 * Apply all FretboardConstraints filters to a voicing.
 * Returns false if the voicing should be excluded.
 */
function passesConstraints(
  voicing: ChordVoicing,
  rootPC: number,
  maxFretSpan: number,
  allowOpenStrings: boolean,
  requireRootInBass: boolean,
  minStrings: number,
  maxStrings: number,
  fromFret: number,
  toFret: number,
): boolean {
  const played = voicing.slots.filter((s): s is FretPosition => s !== null);
  if (played.length < minStrings || played.length > maxStrings) return false;
  if (activeSpan(voicing) > maxFretSpan) return false;
  if (!allowOpenStrings && played.some(p => p.fret === 0)) return false;

  const activeFrets = played.map(p => p.fret).filter(f => f > 0);
  if (activeFrets.length > 0) {
    const minF = Math.min(...activeFrets);
    const maxF = Math.max(...activeFrets);
    if (maxF > toFret) return false;
    if (fromFret > 0 && minF < fromFret) return false;
  }

  if (requireRootInBass) {
    const lowestPlayed = played.reduce((a, b) => a.string > b.string ? a : b);
    if ((lowestPlayed.pitch.pitchClass as number) !== rootPC) return false;
  }

  return true;
}

export const shapeFinder = {
  find(chord: Chord, fretboard: Fretboard, constraints: FretboardConstraints = {}): ReadonlyArray<ChordVoicing> {
    const {
      maxFretSpan = 4,
      allowOpenStrings = true,
      requireRootInBass = false,
      maxStrings = 6,
      minStrings = 3,
      fromFret = 0,
      toFret = 12,
      maxVoicings = 50,
      combinatorial = false,
    } = constraints;

    const rootPC = chord.root.pitchClass as number;
    const seen = new Set<string>();

    // ── 1. DB voicings — primary, always first ──────────────────────────────
    const dbResults: ChordVoicing[] = [];

    for (const dv of dbVoicings(chord, fretboard)) {
      if (!passesConstraints(dv, rootPC, maxFretSpan, allowOpenStrings,
          requireRootInBass, minStrings, maxStrings, fromFret, toFret)) continue;

      const s = sig(dv);
      if (seen.has(s)) continue;
      seen.add(s);
      dbResults.push(dv);
    }

    dbResults.sort((a, b) => scoreVoicing(a) - scoreVoicing(b));

    if (!combinatorial || dbResults.length >= maxVoicings) {
      return dbResults.slice(0, maxVoicings);
    }

    // ── 2. Combinatorial generator — supplementary, appended after DB ───────
    const requiredPCs = new Set(chord.pitches.map(p => p.pitchClass as number));
    const stringNumbers = fretboard.tuning.strings.map(s => s.number);
    const perString: Array<Array<FretPosition | null>> = stringNumbers.map(sn => {
      const candidates = fretboard.positionsForString(sn)
        .filter(p => p.fret >= (allowOpenStrings ? 0 : 1) && p.fret <= toFret && p.fret >= fromFret)
        .filter(p => requiredPCs.has(p.pitch.pitchClass as number));
      return [null, ...candidates];
    });

    const algoResults: ChordVoicing[] = [];
    const remaining = maxVoicings - dbResults.length;

    for (const combo of combinations(perString)) {
      const played = combo.filter((s): s is FretPosition => s !== null);
      if (played.length < minStrings || played.length > maxStrings) continue;

      const voicing: ChordVoicing = { slots: combo };
      if (activeSpan(voicing) > maxFretSpan) continue;

      // Must cover all required pitch classes
      const pcs = pitchClassesPresent(voicing);
      let allCovered = true;
      for (const pc of requiredPCs) {
        if (!pcs.has(pc)) { allCovered = false; break; }
      }
      if (!allCovered) continue;

      if (requireRootInBass) {
        const lowestPlayed = played.reduce((a, b) => a.string > b.string ? a : b);
        if (lowestPlayed.pitch.pitchClass !== rootPC) continue;
      }

      const s = sig(voicing);
      if (seen.has(s)) continue;
      seen.add(s);

      const shape = cagedSystem.shapeOf(voicing, chord.root);
      algoResults.push({ ...voicing, shape });

      if (algoResults.length >= remaining) break;
    }

    algoResults.sort((a, b) => scoreVoicing(a) - scoreVoicing(b));

    return [...dbResults, ...algoResults];
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
