import { useCallback } from "react";
import { useSearchParams } from "react-router";
import type { NoteName, TuningName, QualityValue } from "./engine.ts";

/**
 * Generic typed search-param hook.
 * Reads from URL, writes with replace:true (no history bloat).
 *
 * @param key      URL search param key
 * @param fallback Default value when param is absent
 * @param parse    Optional coercer (raw string → T); defaults to identity cast
 */
export function useSearchParam<T extends string>(
  key: string,
  fallback: T,
  parse?: (raw: string) => T,
): [T, (value: string) => void] {
  const [params, setParams] = useSearchParams();
  const raw = params.get(key);
  const value: T = raw !== null ? (parse ? parse(raw) : (raw as T)) : fallback;

  const setValue = useCallback(
    (newValue: string) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set(key, newValue);
          return next;
        },
        { replace: true },
      );
    },
    [key, setParams],
  );

  return [value, setValue];
}

// ── Typed param hooks ─────────────────────────────────────────────────────────

/** Global key tonic: "C" | "Db" | "D" | … */
export function useKeyParam(): [NoteName, (v: NoteName) => void] {
  return useSearchParam<NoteName>("key", "C");
}

/** Global modality: "major" | "minor" */
export function useModeParam(): ["major" | "minor", (v: "major" | "minor") => void] {
  return useSearchParam<"major" | "minor">("mode", "major", (r) =>
    r === "minor" ? "minor" : "major",
  );
}

/** Global tuning name */
export function useTuningParam(): [TuningName, (v: TuningName) => void] {
  return useSearchParam<TuningName>("tuning", "Standard");
}

/** Chord root note (may differ from key tonic) */
export function useRootParam(): [NoteName, (v: NoteName) => void] {
  return useSearchParam<NoteName>("root", "C");
}

/** Chord quality */
export function useQualityParam(): [QualityValue, (v: QualityValue) => void] {
  return useSearchParam<QualityValue>("quality", "major");
}

/** Selected voicing index (0-based) */
export function useVoicingParam(): [number, (v: number) => void] {
  const [raw, set] = useSearchParam("voicing", "0", (r) => {
    const n = parseInt(r, 10);
    return isNaN(n) ? "0" : String(Math.max(0, n));
  });
  return [parseInt(raw, 10) || 0, (v) => set(String(v))];
}

/** Scale pattern name (e.g. "major", "dorian") */
export function useScaleParam(): [string, (v: string) => void] {
  return useSearchParam("scale", "major");
}

/** Fret window anchor (for scale / arpeggio sliding window) */
export function useFretParam(): [number, (v: number) => void] {
  const [raw, set] = useSearchParam("fret", "0", (r) => {
    const n = parseInt(r, 10);
    return isNaN(n) ? "0" : String(Math.max(0, n));
  });
  return [parseInt(raw, 10) || 0, (v) => set(String(v))];
}

/** Chord progression: comma-separated degree numbers "1,4,5,1" */
export function useProgressionParam(): [number[], (v: number[]) => void] {
  const [raw, set] = useSearchParam("progression", "1,4,5,1");
  const value = raw
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n) && n >= 1 && n <= 7);
  const setValue = useCallback(
    (degrees: number[]) => set(degrees.join(",")),
    [set],
  );
  return [value.length > 0 ? value : [1, 4, 5, 1], setValue];
}
