import { useMemo } from "react";
import { parseKey } from "~/lib/engine.ts";
import { harmonizer } from "@orpheus/engine";
import type { HarmonizedDegree, HarmonizationExtension } from "@orpheus/engine";

export interface UseHarmonizationResult {
  degrees: ReadonlyArray<HarmonizedDegree>;
}

/**
 * Harmonize the natural scale of a key at the given extension level.
 * Results are stable references (harmonizer has its own WeakMap cache).
 */
export function useHarmonization(
  keyNote: string,
  keyMode: string,
  extension: HarmonizationExtension = "triad",
): UseHarmonizationResult {
  const key = useMemo(() => parseKey(keyNote, keyMode), [keyNote, keyMode]);

  const degrees = useMemo(
    () => harmonizer.harmonize(key.naturalScale, extension),
    [key, extension],
  );

  return { degrees };
}
