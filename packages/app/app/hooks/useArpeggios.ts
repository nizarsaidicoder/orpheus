import { useMemo } from "react";
import {
  buildChord,
  parseKey,
  getFretboard,
  buildScaleHighlights,
  chordDisplayName,
} from "~/lib/engine.ts";
import { cagedSystem } from "@orpheus/fretboard";
import type { Chord } from "@orpheus/engine";
import type { CAGEDPosition } from "@orpheus/fretboard";
import type { FretHighlight } from "~/lib/types.ts";

interface UseArpeggiosParams {
  root: string;
  quality: string;
  tuning: string;
  fromFret: number;
  toFret: number;
  keyNote: string;
  keyMode: string;
}

export interface UseArpeggiosResult {
  chord: Chord;
  chordName: string;
  /** Chord-tone positions (root/3rd/5th/7th) in the [fromFret, toFret] window. */
  highlights: FretHighlight[];
  /** 5 CAGED positions for key context (anchor tabs). */
  cagedPositions: ReadonlyArray<CAGEDPosition>;
}

export function useArpeggios({
  root,
  quality,
  tuning,
  fromFret,
  toFret,
  keyNote,
  keyMode,
}: UseArpeggiosParams): UseArpeggiosResult {
  const fretboard = getFretboard(tuning);
  const chord     = useMemo(() => buildChord(root, quality), [root, quality]);
  const key       = useMemo(() => parseKey(keyNote, keyMode), [keyNote, keyMode]);
  const chordName = useMemo(() => chordDisplayName(chord), [chord]);

  const highlights = useMemo(() => {
    const rootPc   = chord.root.pitchClass as number;
    const chordPCs = new Set(chord.pitches.map(p => p.pitchClass as number));
    const positions = fretboard
      .positionsInRange(fromFret, toFret)
      .filter(p => chordPCs.has(p.pitch.pitchClass as number));
    return buildScaleHighlights(positions, rootPc);
  }, [chord, fretboard, fromFret, toFret]);

  const cagedPositions = useMemo(
    () => cagedSystem.shapesForKey(key, fretboard),
    [key, fretboard],
  );

  return { chord, chordName, highlights, cagedPositions };
}
