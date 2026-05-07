import type { Key } from "./key.js";

/**
 * A single node in the circle of fifths.
 * Nodes form a doubly-linked ring (12 nodes for major, 12 for minor).
 * All adjacency fields are pre-computed references — O(1) navigation.
 */
export interface CircleNode {
  readonly key: Key;

  /**
   * The key one perfect fifth above (clockwise on the circle, +1 sharp / −1 flat).
   * C major → G major → D major → … → F# major → (wraps) → C major
   */
  readonly dominantNeighbor: CircleNode;

  /**
   * The key one perfect fifth below (counter-clockwise, −1 sharp / +1 flat).
   * C major → F major → Bb major → … → Gb major → (wraps) → C major
   */
  readonly subdominantNeighbor: CircleNode;

  /**
   * The relative minor/major key at this position on the circle.
   * C major node → A minor; A minor node → C major.
   */
  readonly relativeKey: Key;

  /**
   * Signed distance in fifths from C major (major circle) or A minor (minor circle).
   * Positive = sharp direction, negative = flat direction. Range: [−6, +6].
   */
  readonly fifthsFromC: number;
}

/**
 * The full circle of fifths as an immutable navigable data structure.
 *
 * Implemented as two 12-node doubly-linked rings:
 * - Major ring: C → G → D → A → E → B → F# ↔ Gb → Db → Ab → Eb → Bb → F → C
 * - Minor ring: A → E → B → F# → C# → G# ↔ Ab → Eb → Bb → F → C → G → D → A
 *
 * Navigation never mutates state; all methods return existing nodes or arrays.
 */
export interface CircleOfFifths {
  /** Return the node for a given Key. Throws if the key is not in the circle. */
  nodeFor(key: Key): CircleNode;

  /** All 12 major key nodes, starting from C (0 sharps) going clockwise. */
  readonly majorKeys: ReadonlyArray<CircleNode>;

  /** All 12 minor key nodes, starting from A minor going clockwise. */
  readonly minorKeys: ReadonlyArray<CircleNode>;

  /**
   * Shortest path (in fifths) between two keys.
   * Returns an ordered array of CircleNodes from source to destination, inclusive.
   * The array length equals the fifth-distance + 1.
   *
   * @example pathBetween(C, G) → [C node, G node]
   * @example pathBetween(C, F#) → [C, G, D, A, E, B, F#] (clockwise, 6 steps)
   */
  pathBetween(from: Key, to: Key): ReadonlyArray<CircleNode>;

  /**
   * Fifth-distance between two keys (0–6).
   * Used as a heuristic for harmonic relatedness:
   * closer keys share more pitches and modulate more smoothly.
   */
  distance(a: Key, b: Key): number;
}
