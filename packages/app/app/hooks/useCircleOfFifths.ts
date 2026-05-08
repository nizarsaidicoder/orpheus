import { useMemo } from "react";
import { circleOfFifths } from "@orpheus/engine";
import { parseKey } from "~/lib/engine.ts";
import type { CircleNode, Key } from "@orpheus/engine";

export interface UseCircleOfFifthsResult {
  /** 12 major nodes in circle order (C first, clockwise). */
  majorNodes: ReadonlyArray<CircleNode>;
  /** 12 minor nodes in circle order (A first, clockwise). */
  minorNodes: ReadonlyArray<CircleNode>;
  /** The node matching the current active key (null if non-standard). */
  activeNode: CircleNode | null;
  /** Shortest path from C major to the active key (for sweep animation). */
  pathToActive: ReadonlyArray<CircleNode>;
  /** Fifth-distance from C to active key (0–6). */
  distance: number;
}

/**
 * Feeds CircleOfFifthsSVG. Used in the TopBar key-selector panel.
 * Clicking a node in the SVG updates ?key= + ?mode= URL params globally —
 * that happens in the component, not here.
 */
export function useCircleOfFifths(
  activeKeyNote: string,
  activeMode: string,
): UseCircleOfFifthsResult {
  const activeKey = useMemo(
    () => parseKey(activeKeyNote, activeMode),
    [activeKeyNote, activeMode],
  );

  const majorNodes = circleOfFifths.majorKeys;
  const minorNodes = circleOfFifths.minorKeys;

  const activeNode = useMemo(() => {
    try {
      return circleOfFifths.nodeFor(activeKey);
    } catch {
      return null;
    }
  }, [activeKey]);

  const pathToActive = useMemo(() => {
    try {
      const cMajor = majorNodes[0]?.key;
      if (!cMajor) return [];
      return circleOfFifths.pathBetween(cMajor, activeKey);
    } catch {
      return [];
    }
  }, [activeKey, majorNodes]);

  const distance = useMemo(() => {
    try {
      const cMajor = majorNodes[0]?.key;
      if (!cMajor) return 0;
      return circleOfFifths.distance(cMajor, activeKey);
    } catch {
      return 0;
    }
  }, [activeKey, majorNodes]);

  return { majorNodes, minorNodes, activeNode, pathToActive, distance };
}
