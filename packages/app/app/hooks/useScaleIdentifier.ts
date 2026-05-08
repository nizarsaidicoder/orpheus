import { useMemo } from "react";
import { positionAnalyzer } from "@orpheus/fretboard";
import type { FretPosition } from "@orpheus/fretboard";
import type { Scale } from "@orpheus/engine";
import { parseKey } from "~/lib/engine.ts";

export interface UseScaleIdentifierResult {
  scale: Scale | null;
  scaleName: string | null;
}

/**
 * Identify the scale that best matches active fret positions.
 * An optional key hint improves root detection.
 */
export function useScaleIdentifier(
  positions: ReadonlyArray<FretPosition>,
  keyNote?: string,
  keyMode?: string,
): UseScaleIdentifierResult {
  const key = useMemo(
    () => (keyNote && keyMode ? parseKey(keyNote, keyMode) : undefined),
    [keyNote, keyMode],
  );

  const scale = useMemo(
    () => positionAnalyzer.identifyScale(positions, key),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [positions.length, positions.map(p => `${p.string}:${p.fret}`).join(","), key],
  );

  const scaleName = scale?.pattern.name ?? null;

  return { scale, scaleName };
}
