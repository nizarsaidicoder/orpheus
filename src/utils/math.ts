import type { PitchClass } from "../primitives/pitch.js";

/** Pure modular arithmetic helpers for pitch-class calculations. */
export interface PitchMath {
  /** True modulo — always non-negative. `mod(-1, 12)` → `11`. */
  mod(n: number, m: number): number;

  /** Reduce any integer to a pitch class in [0, 11]. */
  toPitchClass(n: number): PitchClass;

  /**
   * Shortest semitone distance between two pitch classes (result in [0, 6]).
   * Symmetric: `pitchClassDistance(a, b) === pitchClassDistance(b, a)`.
   */
  pitchClassDistance(a: PitchClass, b: PitchClass): number;

  /**
   * Directed interval from `from` to `to` in the specified direction.
   * "up"   → result in [0, 11]
   * "down" → result in [-11, 0]
   */
  directedInterval(from: PitchClass, to: PitchClass, direction: "up" | "down"): number;
}

/** Concrete implementation — stateless, all pure functions. */
export const pitchMath: PitchMath = {
  mod(n: number, m: number): number {
    return ((n % m) + m) % m;
  },

  toPitchClass(n: number): PitchClass {
    return (((n % 12) + 12) % 12) as PitchClass;
  },

  pitchClassDistance(a: PitchClass, b: PitchClass): number {
    const diff = Math.abs(a - b);
    return Math.min(diff, 12 - diff);
  },

  directedInterval(from: PitchClass, to: PitchClass, direction: "up" | "down"): number {
    if (direction === "up") {
      return (((to - from) % 12) + 12) % 12;
    }
    const up = (((to - from) % 12) + 12) % 12;
    return up === 0 ? 0 : up - 12;
  },
};
