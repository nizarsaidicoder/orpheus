// FretboardSVG — pure SVG fretboard renderer.
// Strings run horizontally (string 6 = top row, string 1 = bottom row).
// All data arrives via props; component has zero engine imports.

import { useAppStore } from "~/lib/store";
import type { FretHighlight, LabelFormat, StringState } from "~/lib/types";

// ── Layout constants ──────────────────────────────────────────────────────────

const STRING_COUNT = 6;
const STRING_LABELS = ["e", "B", "G", "D", "A", "E"] as const; // string 1–6 top-to-bottom

/** Single-dot position markers on fretboard (LAST fret in pair for 12th). */
const SINGLE_MARKERS = new Set([3, 5, 7, 9, 15, 17, 19, 21]);
const DOUBLE_MARKERS = new Set([12, 24]);

// Visual layout (px)
const LEFT_MARGIN   = 28;  // space for string labels
const RIGHT_MARGIN  = 12;
const TOP_MARGIN    = 20;  // space for fret numbers
const BOTTOM_MARGIN = 8;
const STRING_PITCH  = 20;  // vertical gap between strings
const NUT_WIDTH     = 6;

// Derived
const INNER_HEIGHT  = (STRING_COUNT - 1) * STRING_PITCH;
const TOTAL_HEIGHT  = TOP_MARGIN + INNER_HEIGHT + BOTTOM_MARGIN;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface FretboardSVGProps {
  /** First fret shown (0 = open strings / nut visible). */
  fromFret?: number;
  /** Last fret shown (inclusive). */
  toFret?: number;
  /** Highlighted dot positions. */
  highlights?: FretHighlight[];
  /** Per-string open/muted/played state (index 0 = string 6). */
  stringStates?: StringState[];
  /** Enable click-to-toggle mode (for /identifier). */
  interactive?: boolean;
  /** Called when a fret cell is clicked in interactive mode. */
  onToggle?: (stringNum: number, fret: number) => void;
  /** Override label format (defaults to store value). */
  labelFormat?: LabelFormat;
  className?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function FretboardSVG({
  fromFret = 0,
  toFret   = 12,
  highlights = [],
  stringStates,
  interactive = false,
  onToggle,
  labelFormat: labelFormatProp,
  className,
}: FretboardSVGProps) {
  const storeLabelFormat = useAppStore((s) => s.labelFormat);
  const labelFormat = labelFormatProp ?? storeLabelFormat;

  const fretCount = toFret - fromFret;                      // number of frets visible
  const showNut   = fromFret === 0;

  // ── Dynamic geometry ──────────────────────────────────────────────────────

  // Fret column width — even spacing
  // We allocate the fret width inside the SVG; the SVG viewBox width adjusts.
  const FRET_WIDTH = 52;
  const innerWidth = fretCount * FRET_WIDTH;
  const totalWidth = LEFT_MARGIN + (showNut ? NUT_WIDTH : 0) + innerWidth + RIGHT_MARGIN;

  // X coordinate for the left edge of fret N (relative to the string area start)
  const stringAreaX = LEFT_MARGIN + (showNut ? NUT_WIDTH : 0);

  function fretX(fret: number): number {
    // fret is absolute; we offset by fromFret
    return stringAreaX + (fret - fromFret - 1) * FRET_WIDTH + FRET_WIDTH;
  }

  function fretCenterX(fret: number): number {
    // Center of fret cell (between fret-1 line and fret line)
    if (fret === 0) {
      // Open string — to the left of nut
      return LEFT_MARGIN + NUT_WIDTH / 2;
    }
    return stringAreaX + (fret - fromFret - 1) * FRET_WIDTH + FRET_WIDTH / 2;
  }

  function stringY(stringNum: number): number {
    // string 6 = top, string 1 = bottom
    const idx = STRING_COUNT - stringNum; // 0 = string 6
    return TOP_MARGIN + idx * STRING_PITCH;
  }

  // ── Dot lookup map ────────────────────────────────────────────────────────

  const dotMap = new Map<string, FretHighlight>();
  for (const h of highlights) {
    dotMap.set(`${h.string}:${h.fret}`, h);
  }

  function getLabel(h: FretHighlight): string {
    return h.labels[labelFormat] ?? "";
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <svg
      viewBox={`0 0 ${totalWidth} ${TOTAL_HEIGHT}`}
      width={totalWidth}
      height={TOTAL_HEIGHT}
      className={className}
      aria-label="Guitar fretboard"
      role={interactive ? "application" : "img"}
    >
      {/* ── Fret numbers ── */}
      {Array.from({ length: fretCount + 1 }, (_, i) => {
        const fret = fromFret + i;
        if (fret === 0) return null;
        return (
          <text
            key={`fn-${fret}`}
            x={fretCenterX(fret)}
            y={TOP_MARGIN - 6}
            textAnchor="middle"
            dominantBaseline="auto"
            fontSize={9}
            fill="var(--color-muted-foreground)"
            fontFamily="var(--font-mono)"
          >
            {fret}
          </text>
        );
      })}

      {/* ── String labels (left side) ── */}
      {Array.from({ length: STRING_COUNT }, (_, i) => {
        const stringNum = STRING_COUNT - i; // 6..1
        return (
          <text
            key={`sl-${stringNum}`}
            x={LEFT_MARGIN - 6}
            y={stringY(stringNum)}
            textAnchor="end"
            dominantBaseline="middle"
            fontSize={10}
            fill="var(--color-muted-foreground)"
            fontFamily="var(--font-mono)"
          >
            {STRING_LABELS[i]}
          </text>
        );
      })}

      {/* ── Nut ── */}
      {showNut && (
        <rect
          x={LEFT_MARGIN}
          y={TOP_MARGIN - 2}
          width={NUT_WIDTH}
          height={INNER_HEIGHT + 4}
          fill="var(--color-foreground)"
          rx={1}
        />
      )}

      {/* ── Fret lines ── */}
      {Array.from({ length: fretCount }, (_, i) => {
        const fret = fromFret + i + 1;
        const x = fretX(fret);
        return (
          <line
            key={`fl-${fret}`}
            x1={x} y1={TOP_MARGIN}
            x2={x} y2={TOP_MARGIN + INNER_HEIGHT}
            stroke="var(--color-border)"
            strokeWidth={1}
          />
        );
      })}

      {/* ── String lines ── */}
      {Array.from({ length: STRING_COUNT }, (_, i) => {
        const stringNum = STRING_COUNT - i;
        const y = stringY(stringNum);
        // Heavier strings are slightly thicker (visual hint)
        const strokeWidth = 0.5 + (i / STRING_COUNT) * 1.0;
        return (
          <line
            key={`str-${stringNum}`}
            x1={LEFT_MARGIN + (showNut ? NUT_WIDTH : 0)}
            y1={y}
            x2={LEFT_MARGIN + (showNut ? NUT_WIDTH : 0) + innerWidth}
            y2={y}
            stroke="var(--color-border)"
            strokeWidth={strokeWidth}
          />
        );
      })}

      {/* ── Position markers ── */}
      {Array.from({ length: fretCount }, (_, i) => {
        const fret = fromFret + i + 1;
        const cx = fretCenterX(fret);
        const midY = TOP_MARGIN + INNER_HEIGHT / 2;

        if (SINGLE_MARKERS.has(fret)) {
          return (
            <circle
              key={`pm-${fret}`}
              cx={cx}
              cy={midY}
              r={4}
              fill="var(--color-surface-3)"
            />
          );
        }
        if (DOUBLE_MARKERS.has(fret)) {
          const gap = STRING_PITCH * 1.5;
          return (
            <g key={`pm-${fret}`}>
              <circle cx={cx} cy={midY - gap / 2} r={4} fill="var(--color-surface-3)" />
              <circle cx={cx} cy={midY + gap / 2} r={4} fill="var(--color-surface-3)" />
            </g>
          );
        }
        return null;
      })}

      {/* ── Open/muted indicators above nut ── */}
      {stringStates && fromFret === 0 && stringStates.map((state, i) => {
        const stringNum = STRING_COUNT - i;
        const cx = fretCenterX(0) - NUT_WIDTH / 2 - 4;
        const cy = stringY(stringNum);
        if (state === "open") {
          return (
            <circle
              key={`os-${stringNum}`}
              cx={cx}
              cy={cy}
              r={4}
              fill="none"
              stroke="var(--color-foreground)"
              strokeWidth={1.5}
            />
          );
        }
        if (state === "muted") {
          const d = 3;
          return (
            <g key={`ms-${stringNum}`}>
              <line
                x1={cx - d} y1={cy - d} x2={cx + d} y2={cy + d}
                stroke="var(--color-muted-foreground)"
                strokeWidth={1.5}
                strokeLinecap="round"
              />
              <line
                x1={cx + d} y1={cy - d} x2={cx - d} y2={cy + d}
                stroke="var(--color-muted-foreground)"
                strokeWidth={1.5}
                strokeLinecap="round"
              />
            </g>
          );
        }
        return null;
      })}

      {/* ── Interactive tap targets ── */}
      {interactive && Array.from({ length: STRING_COUNT }, (_, si) => {
        const stringNum = STRING_COUNT - si;
        return Array.from({ length: fretCount }, (_, fi) => {
          const fret = fromFret + fi + 1;
          const cx = fretCenterX(fret);
          const cy = stringY(stringNum);
          return (
            <rect
              key={`tap-${stringNum}-${fret}`}
              x={cx - FRET_WIDTH / 2}
              y={cy - STRING_PITCH / 2}
              width={FRET_WIDTH}
              height={STRING_PITCH}
              fill="transparent"
              className="cursor-pointer"
              onClick={() => onToggle?.(stringNum, fret)}
              role="button"
              aria-label={`String ${stringNum}, fret ${fret}`}
            />
          );
        });
      })}

      {/* ── Highlight dots ── */}
      {highlights.map((h, idx) => {
        // Skip dots outside the visible range
        if (h.fret > toFret || h.fret < fromFret) return null;
        const cx = fretCenterX(h.fret);
        const cy = stringY(h.string);
        const label = getLabel(h);
        const DOT_R = 9;
        const needsSmallText = label.length > 2;

        return (
          <g key={`dot-${idx}-${h.string}-${h.fret}`}>
            <circle
              cx={cx}
              cy={cy}
              r={DOT_R}
              fill={h.color}
              opacity={0.92}
            />
            {label && (
              <text
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={needsSmallText ? 7 : 8}
                fontWeight="600"
                fontFamily="var(--font-mono)"
                fill="var(--color-surface-1)"
                pointerEvents="none"
              >
                {label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
