import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LabelFormat } from "./types.ts";

interface AppStore {
  // ── Audio ──────────────────────────────────────────────────────────────────
  audioLoaded: boolean;
  setAudioLoaded: (v: boolean) => void;

  // ── Identifier mode — ephemeral, not persisted ─────────────────────────────
  /** Set of "string:fret" keys for toggled positions in /identifier route. */
  activePositions: Set<string>;
  togglePosition: (key: string) => void;
  clearPositions: () => void;

  // ── Hover state — ephemeral ────────────────────────────────────────────────
  /** Scale degree (1–7) currently hovered; null when none. */
  hoveredDegree: number | null;
  setHoveredDegree: (n: number | null) => void;

  // ── Label format preference — persisted to localStorage ───────────────────
  labelFormat: LabelFormat;
  setLabelFormat: (f: LabelFormat) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      // Audio
      audioLoaded: false,
      setAudioLoaded: (v) => set({ audioLoaded: v }),

      // Identifier positions
      activePositions: new Set<string>(),
      togglePosition: (key) =>
        set((state) => {
          const next = new Set(state.activePositions);
          if (next.has(key)) next.delete(key);
          else next.add(key);
          return { activePositions: next };
        }),
      clearPositions: () => set({ activePositions: new Set<string>() }),

      // Hover
      hoveredDegree: null,
      setHoveredDegree: (n) => set({ hoveredDegree: n }),

      // Label format
      labelFormat: "degree",
      setLabelFormat: (f) => set({ labelFormat: f }),
    }),
    {
      name: "orpheus-prefs",
      // Only persist the label format — everything else is ephemeral
      partialize: (state) => ({ labelFormat: state.labelFormat }),
    },
  ),
);
