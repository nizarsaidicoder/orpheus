import type { Chord } from "../chords/chord.js";
import type { Key } from "./key.js";
import type { CircleNode } from "./circle-of-fifths.js";

/**
 * The mechanism by which a single modulation step is achieved.
 */
export type ModulationMechanism =
  | "pivot-chord"          // A chord diatonic in both the departing and arriving key
  | "direct"               // Abrupt change with no pivot (common in pop/rock)
  | "secondary-dominant"   // An applied (secondary dominant) chord initiates the modulation
  | "chromatic-mediant"    // Third relationship: root motion by M3 or m3 (e.g. C → E, C → Ab)
  | "enharmonic"           // Exploiting enharmonic respelling (dim7 pivot, German +6 → V)
  | "common-tone";         // A single shared pitch between the two keys anchors the change

/**
 * A single step in a modulation path between two keys.
 */
export interface ModulationStep {
  /** The key that is arrived at after this step. */
  readonly targetKey: Key;

  /** How this step is accomplished. */
  readonly mechanism: ModulationMechanism;

  /**
   * The pivot chord, if applicable.
   * A pivot chord is simultaneously diatonic in the departing and arriving key.
   * Only set when `mechanism === "pivot-chord"`.
   */
  readonly pivotChord?: Chord;

  /**
   * Human-readable description of this step.
   * @example "Pivot chord: iii in C major = i in E minor"
   */
  readonly description: string;
}

/**
 * A complete modulation path from one key to another, possibly through intermediate keys.
 * Lower cost = smoother / more conventional modulation.
 */
export interface ModulationPath {
  readonly from:  Key;
  readonly to:    Key;
  /**
   * Ordered steps from `from` to `to`.
   * A direct modulation has exactly 1 step.
   * A modulation through a pivot key has 2+ steps.
   */
  readonly steps: ReadonlyArray<ModulationStep>;
  /**
   * Aggregate cost score. Lower = smoother.
   * Pivot-chord modulations cost less than direct; chromatic-mediant less than enharmonic.
   */
  readonly cost: number;
}

/**
 * Finds modulation paths between keys using harmonic graph search.
 * The search space is the circle-of-fifths graph augmented with chromatic-third edges.
 */
export interface ModulationFinder {
  /**
   * Find the lowest-cost path from one key to another.
   * Uses Dijkstra-style search over harmonic relationships.
   */
  findPath(from: Key, to: Key): ModulationPath;

  /**
   * Find all paths up to `maxSteps` steps long, sorted by cost ascending.
   * Useful for presenting multiple modulation options.
   *
   * @param maxSteps defaults to 3
   */
  findAllPaths(from: Key, to: Key, maxSteps?: number): ReadonlyArray<ModulationPath>;

  /**
   * Find all chords that are diatonic in both `from` and `to` simultaneously.
   * These are the available pivot chords for a pivot-chord modulation.
   * Returns an empty array if no shared diatonic chords exist (e.g. tritone-related keys).
   */
  pivotChords(from: Key, to: Key): ReadonlyArray<Chord>;
}
