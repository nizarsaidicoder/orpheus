import { useMemo } from "react";
import {
  buildChord,
  buildChordHighlights,
  getVoicings,
  parseKey,
  chordDisplayName,
  getRomanNumeral,
  getStringStates,
  getFretboard,
} from "~/lib/engine.ts";
import { functionalAnalyzer } from "@orpheus/engine";
import type { Chord, FunctionalAnalysis } from "@orpheus/engine";
import type { Fingering } from "@orpheus/fretboard";
import type { FretHighlight, StringState } from "~/lib/types.ts";

interface UseChordParams {
  root: string;
  quality: string;
  tuning: string;
  voicingIndex: number;
  keyNote: string;
  keyMode: string;
}

export interface UseChordResult {
  chord: Chord;
  chordName: string;
  voicings: ReadonlyArray<Fingering>;
  selectedVoicing: Fingering | null;
  highlights: FretHighlight[];
  /** Per-string state (open/muted/played) for ○/× indicators; index 0 = string 6 (low E). */
  stringStates: StringState[];
  romanNumeral: string;
  analysis: FunctionalAnalysis;
}

export function useChord({
  root,
  quality,
  tuning,
  voicingIndex,
  keyNote,
  keyMode,
}: UseChordParams): UseChordResult {
  const chord = useMemo(() => buildChord(root, quality), [root, quality]);
  const key   = useMemo(() => parseKey(keyNote, keyMode), [keyNote, keyMode]);

  // Voicings from module-level cache (shapeFinder runs once per root/quality/tuning combo)
  const voicings = getVoicings(root, quality, tuning);

  const selectedVoicing = useMemo(() => {
    if (voicings.length === 0) return null;
    const idx = Math.max(0, Math.min(voicingIndex, voicings.length - 1));
    return voicings[idx] ?? null;
  }, [voicings, voicingIndex]);

  const highlights = useMemo(
    () => (selectedVoicing ? buildChordHighlights(selectedVoicing, chord) : []),
    [selectedVoicing, chord],
  );

  const stringStates = useMemo(
    () => (selectedVoicing ? getStringStates(selectedVoicing) : Array<StringState>(6).fill("muted")),
    [selectedVoicing],
  );

  const chordName    = useMemo(() => chordDisplayName(chord), [chord]);
  const romanNumeral = useMemo(() => getRomanNumeral(chord, key), [chord, key]);
  const analysis     = useMemo(() => functionalAnalyzer.analyze(chord, key), [chord, key]);

  return {
    chord,
    chordName,
    voicings,
    selectedVoicing,
    highlights,
    stringStates,
    romanNumeral,
    analysis,
  };
}
