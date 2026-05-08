import type { Chord } from "../chords/chord.ts";
import type { Key } from "./key.ts";
import { circleOfFifths } from "./circle-of-fifths.ts";
import { harmonizer } from "../chords/harmonizer.ts";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function getDiatonicTriads(key: Key): ReadonlyArray<Chord> {
  return harmonizer.harmonize(key.naturalScale, "triad").map(d => d.chord);
}

function keyLabel(key: Key): string {
  const letter = String(key.tonic.spelling.letter);
  const acc = key.tonic.spelling.accidental;
  const accStr = acc === 1 ? "#" : acc === -1 ? "b" : "";
  return `${letter}${accStr} ${key.modality}`;
}

function sameKey(a: Key, b: Key): boolean {
  return a.tonic.pitchClass === b.tonic.pitchClass && a.modality === b.modality;
}

function makePivotStep(targetKey: Key, pivot: Chord, fromKey: Key): ModulationStep {
  return {
    targetKey,
    mechanism: "pivot-chord",
    pivotChord: pivot,
    description: `Pivot: chord shared by ${keyLabel(fromKey)} and ${keyLabel(targetKey)}`,
  };
}

function makeDirectStep(targetKey: Key): ModulationStep {
  return {
    targetKey,
    mechanism: "direct",
    description: `Direct modulation to ${keyLabel(targetKey)}`,
  };
}

// ---------------------------------------------------------------------------
// Concrete implementation
// ---------------------------------------------------------------------------

export const modulationFinder: ModulationFinder = {
  pivotChords(from: Key, to: Key): ReadonlyArray<Chord> {
    const fromTriads = getDiatonicTriads(from);
    const toTriads = getDiatonicTriads(to);
    const pivots: Chord[] = [];
    for (const fc of fromTriads) {
      for (const tc of toTriads) {
        if (fc.root.pitchClass === tc.root.pitchClass && fc.quality.kind === tc.quality.kind) {
          pivots.push(fc);
          break;
        }
      }
    }
    return pivots;
  },

  findPath(from: Key, to: Key): ModulationPath {
    if (sameKey(from, to)) {
      return { from, to, steps: [], cost: 0 };
    }
    const dist = circleOfFifths.distance(from, to);
    const pivots = modulationFinder.pivotChords(from, to);
    if (pivots.length > 0) {
      const step = makePivotStep(to, pivots[0]!, from);
      return { from, to, steps: [step], cost: dist };
    }
    const step = makeDirectStep(to);
    return { from, to, steps: [step], cost: dist * 2 + 1 };
  },

  findAllPaths(from: Key, to: Key, maxSteps: number = 3): ReadonlyArray<ModulationPath> {
    const paths: ModulationPath[] = [modulationFinder.findPath(from, to)];

    if (maxSteps >= 2) {
      const fromNode = circleOfFifths.nodeFor(from);
      const intermediates: Key[] = [
        fromNode.dominantNeighbor.key,
        fromNode.subdominantNeighbor.key,
        from.relative,
        from.parallel,
      ];
      for (const mid of intermediates) {
        if (sameKey(mid, from) || sameKey(mid, to)) continue;
        const leg1 = modulationFinder.findPath(from, mid);
        const leg2 = modulationFinder.findPath(mid, to);
        const combined = [...leg1.steps, ...leg2.steps];
        if (combined.length <= maxSteps) {
          paths.push({ from, to, steps: combined, cost: leg1.cost + leg2.cost });
        }
      }
    }

    paths.sort((a, b) => a.cost - b.cost);
    return paths;
  },
};

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
