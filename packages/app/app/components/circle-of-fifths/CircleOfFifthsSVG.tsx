// CircleOfFifthsSVG — interactive pie-wedge circle.
// Outer ring = 12 major keys. Inner ring = 12 relative minor keys.
// Clicking a wedge calls onSelectKey(noteName, mode).
// Active key + its relative minor are highlighted.

import { spellingToDisplay } from "~/lib/engine";
import type { CircleNode } from "@orpheus/engine";

// ── Geometry ──────────────────────────────────────────────────────────────────

const CX = 150;
const CY = 150;
const OUTER_R   = 140;
const MAJOR_OUT = 135;
const MAJOR_IN  = 95;
const MINOR_OUT = 90;
const MINOR_IN  = 55;
const LABEL_GAP = 3; // gap between wedge edges and label bounds

const WEDGE_DEG = 30;  // 360 / 12

// ── Helpers ───────────────────────────────────────────────────────────────────

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

/** Cartesian point on a circle. */
function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const a = toRad(angleDeg);
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

/** SVG path for a ring sector (annulus wedge). */
function sectorPath(
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  startDeg: number,
  endDeg: number,
): string {
  const p1 = polar(cx, cy, outerR, startDeg);
  const p2 = polar(cx, cy, outerR, endDeg);
  const p3 = polar(cx, cy, innerR, endDeg);
  const p4 = polar(cx, cy, innerR, startDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${p1.x} ${p1.y}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${p2.x} ${p2.y}`,
    `L ${p3.x} ${p3.y}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${p4.x} ${p4.y}`,
    "Z",
  ].join(" ");
}

/** Angle for node at index i, measured from 12-o'clock going clockwise. */
function wedgeStartDeg(i: number) {
  return i * WEDGE_DEG - 90;
}

/** Center angle of wedge i. */
function wedgeMidDeg(i: number) {
  return wedgeStartDeg(i) + WEDGE_DEG / 2;
}

/** Key signature string: "3♯" | "2♭" | "". */
function keySigLabel(fifthsFromC: number): string {
  if (fifthsFromC === 0) return "";
  if (fifthsFromC > 0) return `${fifthsFromC}♯`;
  return `${Math.abs(fifthsFromC)}♭`;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CircleOfFifthsSVGProps {
  majorNodes: ReadonlyArray<CircleNode>;
  minorNodes: ReadonlyArray<CircleNode>;
  /** Currently active node (highlighted). May be major or minor. */
  activeNode: CircleNode | null;
  /** Called when a wedge is clicked. */
  onSelectKey: (noteName: string, mode: "major" | "minor") => void;
  size?: number;  // CSS render size in px (default 300)
}

// ── Component ─────────────────────────────────────────────────────────────────

export function CircleOfFifthsSVG({
  majorNodes,
  minorNodes,
  activeNode,
  onSelectKey,
  size = 300,
}: CircleOfFifthsSVGProps) {
  // Determine which positions to highlight
  const activeMajorPos = activeNode
    ? majorNodes.findIndex((n) => n.key === activeNode.key || n.relativeKey === activeNode.key)
    : -1;
  const activeMinorPos = activeNode
    ? minorNodes.findIndex((n) => n.key === activeNode.key || n.relativeKey === activeNode.key)
    : -1;

  return (
    <svg
      viewBox="0 0 300 300"
      width={size}
      height={size}
      aria-label="Circle of fifths — click a key to select it"
      role="application"
    >
      {/* ── Center dot ── */}
      <circle cx={CX} cy={CY} r={MINOR_IN - 2} fill="var(--color-surface-2)" />

      {/* ── Minor (inner) ring ── */}
      {minorNodes.map((node, i) => {
        const startDeg = wedgeStartDeg(i);
        const endDeg   = startDeg + WEDGE_DEG;
        const midDeg   = wedgeMidDeg(i);
        const midPt    = polar(CX, CY, (MINOR_IN + MINOR_OUT) / 2, midDeg);
        const noteName = spellingToDisplay(node.key.tonic.spelling);
        const isActive = i === activeMinorPos;

        return (
          <g
            key={`minor-${i}`}
            onClick={() => onSelectKey(noteName.replace("♭", "b").replace("♯", "#"), "minor")}
            className="cursor-pointer"
            role="button"
            aria-label={`${noteName} minor`}
          >
            <path
              d={sectorPath(CX, CY, MINOR_IN, MINOR_OUT, startDeg, endDeg)}
              fill={isActive ? "var(--color-primary)" : "var(--color-surface-3)"}
              stroke="var(--color-surface-1)"
              strokeWidth={1.5}
              className="transition-colors hover:fill-[var(--color-accent)]"
            />
            <text
              x={midPt.x}
              y={midPt.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={9}
              fontWeight={isActive ? "700" : "400"}
              fontFamily="var(--font-sans)"
              fill={isActive ? "var(--color-primary-foreground)" : "var(--color-muted-foreground)"}
              pointerEvents="none"
            >
              {noteName}m
            </text>
          </g>
        );
      })}

      {/* ── Major (outer) ring ── */}
      {majorNodes.map((node, i) => {
        const startDeg = wedgeStartDeg(i);
        const endDeg   = startDeg + WEDGE_DEG;
        const midDeg   = wedgeMidDeg(i);
        const midPt    = polar(CX, CY, (MAJOR_IN + MAJOR_OUT) / 2, midDeg);
        const noteName = spellingToDisplay(node.key.tonic.spelling);
        const isActive = i === activeMajorPos;
        const sigLabel = keySigLabel(node.fifthsFromC);

        return (
          <g
            key={`major-${i}`}
            onClick={() => onSelectKey(noteName.replace("♭", "b").replace("♯", "#"), "major")}
            className="cursor-pointer"
            role="button"
            aria-label={`${noteName} major (${sigLabel || "no accidentals"})`}
          >
            <path
              d={sectorPath(CX, CY, MAJOR_IN, MAJOR_OUT, startDeg, endDeg)}
              fill={isActive ? "var(--color-primary)" : "var(--color-surface-2)"}
              stroke="var(--color-surface-1)"
              strokeWidth={1.5}
              className="transition-colors hover:fill-[var(--color-accent)]"
            />
            {/* Note name */}
            <text
              x={midPt.x}
              y={midPt.y - 4}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={12}
              fontWeight={isActive ? "700" : "500"}
              fontFamily="var(--font-sans)"
              fill={isActive ? "var(--color-primary-foreground)" : "var(--color-foreground)"}
              pointerEvents="none"
            >
              {noteName}
            </text>
            {/* Key signature */}
            {sigLabel && (
              <text
                x={midPt.x}
                y={midPt.y + 9}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={8}
                fontFamily="var(--font-mono)"
                fill={isActive ? "var(--color-primary-foreground)" : "var(--color-muted-foreground)"}
                opacity={0.8}
                pointerEvents="none"
              >
                {sigLabel}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
