import { useMemo } from "react";
import {
  parseRoot,
  parseKey,
  getFretboard,
  buildScaleHighlights,
} from "~/lib/engine.ts";
import {
  defaultScaleRegistry,
  scaleFactory,
} from "@orpheus/engine";
import { scaleMapFactory, cagedSystem } from "@orpheus/fretboard";
import type { Scale, ScalePattern } from "@orpheus/engine";
import type { ScaleMap, CAGEDPosition } from "@orpheus/fretboard";
import type { FretHighlight } from "~/lib/types.ts";

interface UseScaleParams {
  patternName: string;
  root: string;
  tuning: string;
  fromFret: number;
  toFret: number;
  /** Key tonic — used for CAGED position detection */
  keyNote: string;
  keyMode: string;
}

export interface UseScaleResult {
  pattern: ScalePattern | null;
  scale: Scale | null;
  scaleMap: ScaleMap | null;
  /** Degree-colored highlights within [fromFret, toFret] window */
  highlights: FretHighlight[];
  /** 5 CAGED positions for the key (for tab navigation) */
  cagedPositions: ReadonlyArray<CAGEDPosition>;
  /** All scale positions (sliding 4-fret boxes) across full neck */
  allScalePositions: ReturnType<ScaleMap["scalePositions"]>;
}

export function useScale({
  patternName,
  root,
  tuning,
  fromFret,
  toFret,
  keyNote,
  keyMode,
}: UseScaleParams): UseScaleResult {
  const fretboard = getFretboard(tuning);
  const rootPitch = useMemo(() => parseRoot(root), [root]);
  const key       = useMemo(() => parseKey(keyNote, keyMode), [keyNote, keyMode]);

  const pattern = useMemo(
    () => defaultScaleRegistry.get(patternName) ?? null,
    [patternName],
  );

  const scale = useMemo(
    () => (pattern ? scaleFactory.build(pattern, rootPitch) : null),
    [pattern, rootPitch],
  );

  const scaleMap = useMemo(
    () => (scale ? scaleMapFactory.build(scale, fretboard) : null),
    [scale, fretboard],
  );

  const highlights = useMemo(() => {
    if (!scaleMap || !scale) return [];
    const positions = scaleMap.positionsInFretRange(fromFret, toFret);
    return buildScaleHighlights(positions, scale.root.pitchClass as number);
  }, [scaleMap, scale, fromFret, toFret]);

  const cagedPositions = useMemo(
    () => cagedSystem.shapesForKey(key, fretboard),
    [key, fretboard],
  );

  const allScalePositions = useMemo(
    () => (scaleMap ? scaleMap.scalePositions(5) : []),
    [scaleMap],
  );

  return { pattern, scale, scaleMap, highlights, cagedPositions, allScalePositions };
}
