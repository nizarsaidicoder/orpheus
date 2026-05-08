// ── Shared UI-bridge types ───────────────────────────────────────────────────
// These sit between hooks (engine data) and SVG components (dumb renderers).
// No runtime logic here — pure shape definitions.

/** Which label format is shown on fret dots. Persisted to localStorage. */
export type LabelFormat = "degree" | "interval" | "finger";

/**
 * A single highlighted dot on the fretboard SVG.
 * All three label formats are precomputed by hooks so FretboardSVG never
 * imports engine types.
 */
export interface FretHighlight {
  /** Guitar string number (1 = high e, 6 = low E). */
  string: number;
  /** Fret number (0 = open string). */
  fret: number;
  /** CSS custom property reference, e.g. "var(--color-dot-root)". */
  color: string;
  /** All label formats precomputed — component picks based on store.labelFormat. */
  labels: {
    /** Degree with accidentals: "R", "b2", "2", "b3", "3", "4", "b5", "5", "b6", "6", "b7", "7" */
    degree: string;
    /** Interval abbreviation: "P1", "m2", "M2", "m3", "M3", "P4", "d5", "P5", "m6", "M6", "m7", "M7" */
    interval: string;
    /** Finger number "1"–"4", or "" for open/no-finger positions. */
    finger: string;
  };
  /** Raw finger assignment (0 = open). Present only for chord voicing highlights. */
  finger?: 0 | 1 | 2 | 3 | 4;
  /** True when this position is the chord/scale root. */
  isRoot?: boolean;
}

/**
 * Per-string state for chord display — controls the ○ / × / (none) indicators
 * shown above the nut in ChordDiagramSVG and FretboardSVG chord mode.
 */
export type StringState = "open" | "muted" | "played";

/** Dot color CSS variables in order by chord-tone degree index. */
export const DOT_COLOR_BY_INDEX: readonly string[] = [
  "var(--color-dot-root)",     // 0 — root
  "var(--color-dot-third)",    // 1 — 3rd (or 2nd for sus)
  "var(--color-dot-fifth)",    // 2 — 5th
  "var(--color-dot-seventh)",  // 3 — 7th
  "var(--color-dot-other)",    // 4+ — extensions
] as const;

/** Resolve a semitone offset (0–11) to the nearest semantic dot color. */
export function semitoneToColor(semitones: number): string {
  const s = ((semitones % 12) + 12) % 12;
  if (s === 0) return "var(--color-dot-root)";
  if (s === 3 || s === 4) return "var(--color-dot-third)";
  if (s === 6 || s === 7 || s === 8) return "var(--color-dot-fifth)";
  if (s === 10 || s === 11) return "var(--color-dot-seventh)";
  return "var(--color-dot-other)";
}
