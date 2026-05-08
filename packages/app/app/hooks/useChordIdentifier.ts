import { useMemo } from "react";
import { positionAnalyzer } from "@orpheus/fretboard";
import { keyDetector } from "@orpheus/engine";
import type { FretPosition } from "@orpheus/fretboard";
import type { Chord, Key } from "@orpheus/engine";
import { chordDisplayName } from "~/lib/engine.ts";

export interface UseChordIdentifierResult {
  chord: Chord | null;
  chordName: string | null;
  /** Best-guess key context from Krumhansl-Schmuckler profile (may be null). */
  suggestedKey: Key | null;
  /** Confidence [0,1] of the suggested key. */
  keyConfidence: number;
}

/**
 * Identify the chord formed by a set of active fret positions.
 * Used in /identifier route. All input is client-side ephemeral state.
 */
export function useChordIdentifier(
  positions: ReadonlyArray<FretPosition>,
): UseChordIdentifierResult {
  const chord = useMemo(
    () => positionAnalyzer.identifyChord(positions),
    // positions is a new array each render — stable via Zustand activePositions Set
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [positions.length, positions.map(p => `${p.string}:${p.fret}`).join(",")],
  );

  const chordName = useMemo(
    () => (chord ? chordDisplayName(chord) : null),
    [chord],
  );

  const keyResult = useMemo(() => {
    if (positions.length < 2) return null;
    return keyDetector.bestGuess(positions.map(p => p.pitch)) ?? null;
  }, [positions]);

  return {
    chord,
    chordName,
    suggestedKey: keyResult?.key ?? null,
    keyConfidence: keyResult?.confidence ?? 0,
  };
}
