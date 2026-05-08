import type { ScaleCategory, ScalePattern } from "./scale.ts";
import { MAJOR_PATTERN, NATURAL_MINOR_PATTERN, HARMONIC_MINOR_PATTERN, MELODIC_MINOR_PATTERN, HARMONIC_MAJOR_PATTERN, MELODIC_MINOR_DESCENDING } from "./diatonic.ts";
import { IONIAN_PATTERN, DORIAN_PATTERN, PHRYGIAN_PATTERN, LYDIAN_PATTERN, MIXOLYDIAN_PATTERN, AEOLIAN_PATTERN, LOCRIAN_PATTERN } from "./modes.ts";
import { WHOLE_TONE_PATTERN, DIMINISHED_HW_PATTERN, DIMINISHED_WH_PATTERN, AUGMENTED_PATTERN } from "./symmetric.ts";
import {
  MAJOR_PENTATONIC_PATTERN, MINOR_PENTATONIC_PATTERN, BLUES_PATTERN,
  PHRYGIAN_DOMINANT_PATTERN, DOUBLE_HARMONIC_PATTERN, HUNGARIAN_MINOR_PATTERN,
  LYDIAN_DOMINANT_PATTERN, ALTERED_PATTERN,
} from "./exotic.ts";

/**
 * Central registry mapping scale names → canonical patterns.
 * Lookup is case-insensitive. Immutable: `register()` returns a new registry.
 */
export interface ScaleRegistry {
  /** Retrieve a pattern by canonical name (case-insensitive). Returns undefined if not found. */
  get(name: string): ScalePattern | undefined;

  /** All registered scale names in insertion order. */
  readonly names: ReadonlyArray<string>;

  /** Filter patterns by category. */
  byCategory(category: ScaleCategory): ReadonlyArray<ScalePattern>;

  /**
   * Register a custom/synthetic pattern.
   * Returns a new ScaleRegistry containing all existing patterns plus the new one.
   * Throws if a pattern with the same name (case-insensitive) already exists.
   */
  register(pattern: ScalePattern): ScaleRegistry;
}

/** Canonical set of built-in scale patterns registered at startup. */
const BUILT_IN_PATTERNS: ReadonlyArray<ScalePattern> = Object.freeze([
  // Diatonic
  MAJOR_PATTERN, NATURAL_MINOR_PATTERN, HARMONIC_MINOR_PATTERN,
  MELODIC_MINOR_PATTERN, MELODIC_MINOR_DESCENDING, HARMONIC_MAJOR_PATTERN,
  // Church modes
  IONIAN_PATTERN, DORIAN_PATTERN, PHRYGIAN_PATTERN, LYDIAN_PATTERN,
  MIXOLYDIAN_PATTERN, AEOLIAN_PATTERN, LOCRIAN_PATTERN,
  // Symmetric
  WHOLE_TONE_PATTERN, DIMINISHED_HW_PATTERN, DIMINISHED_WH_PATTERN, AUGMENTED_PATTERN,
  // Exotic / synthetic
  MAJOR_PENTATONIC_PATTERN, MINOR_PENTATONIC_PATTERN, BLUES_PATTERN,
  PHRYGIAN_DOMINANT_PATTERN, DOUBLE_HARMONIC_PATTERN, HUNGARIAN_MINOR_PATTERN,
  LYDIAN_DOMINANT_PATTERN, ALTERED_PATTERN,
]);

/**
 * Factory function: create a ScaleRegistry from an array of patterns.
 * Used internally and for testing custom registries.
 */
export function createScaleRegistry(patterns: ReadonlyArray<ScalePattern>): ScaleRegistry {
  const map = new Map<string, ScalePattern>(
    patterns.map((p) => [p.name.toLowerCase(), p])
  );

  const registry: ScaleRegistry = {
    get(name: string): ScalePattern | undefined {
      return map.get(name.toLowerCase());
    },

    get names(): ReadonlyArray<string> {
      return Array.from(map.keys());
    },

    byCategory(category: ScaleCategory): ReadonlyArray<ScalePattern> {
      return Array.from(map.values()).filter((p) => p.category === category);
    },

    register(pattern: ScalePattern): ScaleRegistry {
      if (map.has(pattern.name.toLowerCase())) {
        throw new Error(`Scale "${pattern.name}" is already registered.`);
      }
      return createScaleRegistry([...Array.from(map.values()), pattern]);
    },
  };

  return registry;
}

/** The default registry containing all built-in scale patterns. */
export const defaultScaleRegistry: ScaleRegistry = createScaleRegistry(BUILT_IN_PATTERNS);
