import type { Key } from "./key.ts";
import { keyFactory } from "./key.ts";

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

// ---------------------------------------------------------------------------
// Concrete implementation
// ---------------------------------------------------------------------------

// 12 major keys in clockwise order starting from C (signature: 0,1,2,...,6,-5,-4,-3,-2,-1)
const MAJOR_SIGS  = [0, 1, 2, 3, 4, 5, 6, -5, -4, -3, -2, -1] as const;
// 12 minor keys in the same clockwise order (same circle positions)
const MINOR_SIGS  = [0, 1, 2, 3, 4, 5, 6, -5, -4, -3, -2, -1] as const;

class ConcreteCircleNode implements CircleNode {
  readonly key:                Key;
  readonly relativeKey:        Key;
  readonly fifthsFromC:        number;
  declare dominantNeighbor:    CircleNode;
  declare subdominantNeighbor: CircleNode;

  constructor(key: Key, fifthsFromC: number) {
    this.key = key;
    this.relativeKey = key.relative;
    this.fifthsFromC = fifthsFromC;
  }
}

// fifthsFromC: position 0-11 → [-1,-2,-3,-4,-5,6,5,4,3,2,1,0] shifted
// Positions 0-6 = 0,1,2,3,4,5,6; positions 7-11 = -5,-4,-3,-2,-1
function posToFifths(pos: number): number {
  return pos <= 6 ? pos : pos - 12;
}

// ---------------------------------------------------------------------------
// Lazy initialization — avoids circular import with scaleFactory via keyFactory
// ---------------------------------------------------------------------------

let _majorNodes: ConcreteCircleNode[] | undefined;
let _minorNodes: ConcreteCircleNode[] | undefined;
let _keyToNode: Map<Key, ConcreteCircleNode> | undefined;

function getMajorNodes(): ConcreteCircleNode[] {
  if (!_majorNodes) {
    _majorNodes = MAJOR_SIGS.map((sig, pos) =>
      new ConcreteCircleNode(keyFactory.major(sig), posToFifths(pos))
    );
    _minorNodes = MINOR_SIGS.map((sig, pos) =>
      new ConcreteCircleNode(keyFactory.minor(sig), posToFifths(pos))
    );

    // Wire dominantNeighbor (clockwise = +1) and subdominantNeighbor (counter-clockwise = -1)
    for (let i = 0; i < 12; i++) {
      _majorNodes[i]!.dominantNeighbor = _majorNodes[(i + 1) % 12]!;
      _majorNodes[i]!.subdominantNeighbor = _majorNodes[(i + 11) % 12]!;
      _minorNodes[i]!.dominantNeighbor = _minorNodes[(i + 1) % 12]!;
      _minorNodes[i]!.subdominantNeighbor = _minorNodes[(i + 11) % 12]!;
    }

    // Build lookup map from Key → CircleNode
    _keyToNode = new Map<Key, ConcreteCircleNode>();
    for (const n of _majorNodes) _keyToNode.set(n.key, n);
    for (const n of _minorNodes) _keyToNode.set(n.key, n);

    // Also map enharmonic equivalents to the same node
    // (F# and Gb major are both valid lookups for node at position 6)
    for (const n of _majorNodes) _keyToNode.set(n.key.enharmonicEquivalent, n);
    for (const n of _minorNodes) _keyToNode.set(n.key.enharmonicEquivalent, n);
  }
  return _majorNodes;
}

function getMinorNodes(): ConcreteCircleNode[] {
  getMajorNodes(); // ensure initialized
  return _minorNodes!;
}

function getKeyToNode(): Map<Key, ConcreteCircleNode> {
  getMajorNodes(); // ensure initialized
  return _keyToNode!;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const circleOfFifths: CircleOfFifths = {
  nodeFor(key: Key): CircleNode {
    const node = getKeyToNode().get(key) ?? getKeyToNode().get(key.enharmonicEquivalent);
    if (!node) throw new Error(`Key not found in circle: ${key.tonic.spelling.letter} ${key.modality}`);
    return node;
  },

  get majorKeys() { return getMajorNodes() as ReadonlyArray<CircleNode>; },
  get minorKeys() { return getMinorNodes() as ReadonlyArray<CircleNode>; },

  pathBetween(from: Key, to: Key): ReadonlyArray<CircleNode> {
    const fromNode = this.nodeFor(from);
    const toNode   = this.nodeFor(to);
    const nodes = from.modality === "major" ? getMajorNodes() : getMinorNodes();
    const fi = nodes.indexOf(fromNode as ConcreteCircleNode);
    const ti = nodes.indexOf(toNode   as ConcreteCircleNode);
    if (fi < 0 || ti < 0) return [fromNode, toNode];
    const cwDist  = ((ti - fi) + 12) % 12;
    const ccwDist = ((fi - ti) + 12) % 12;
    const path: ConcreteCircleNode[] = [];
    if (cwDist <= ccwDist) {
      for (let step = 0; step <= cwDist; step++) path.push(nodes[(fi + step) % 12]!);
    } else {
      for (let step = 0; step <= ccwDist; step++) path.push(nodes[(fi - step + 12) % 12]!);
    }
    return path;
  },

  distance(a: Key, to: Key): number {
    const nodeA = this.nodeFor(a);
    const nodeB = this.nodeFor(to);
    const nodes = a.modality === "major" ? getMajorNodes() : getMinorNodes();
    const ai = nodes.indexOf(nodeA as ConcreteCircleNode);
    const bi = nodes.indexOf(nodeB as ConcreteCircleNode);
    if (ai < 0 || bi < 0) return 0;
    const d = Math.abs(ai - bi);
    return Math.min(d, 12 - d);
  },
};

// ---------------------------------------------------------------------------

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