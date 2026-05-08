import { useMemo } from "react";
import { parseKey } from "~/lib/engine.ts";
import type { Key } from "@orpheus/engine";

/** Build and memoize a Key from URL-param strings. */
export function useKey(note: string, modality: string): Key {
  return useMemo(() => parseKey(note, modality), [note, modality]);
}
