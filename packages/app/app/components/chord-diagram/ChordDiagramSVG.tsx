// ChordDiagramSVG — compact vertical nut-view chord diagram.
// Strings run vertically, frets run horizontally.
// Shows 4 fret rows. Barre, open circles, muted X, finger numbers.

import { useAppStore } from "~/lib/store";
import type { FretHighlight, LabelFormat, StringState } from "~/lib/types";

// ── Layout constants (px, for a compact ~80px-wide diagram) ──────────────────

const STRING_COUNT  = 6;
const FRET_ROWS     = 4;          // fret rows visible in the diagram

const H_MARGIN      = 12;         // left/right margin
const TOP_MARGIN    = 20;         // space above nut (for open/muted symbols)
const BOTTOM_MARGIN = 16;         // space below last fret row (for fret number)

const STRING_PITCH  = 11;         // horizontal gap between strings
const FRET_PITCH    = 14;         // vertical gap between fret rows
const NUT_HEIGHT    = 5;          // nut thickness

// Derived
const INNER_WIDTH   = (STRING_COUNT - 1) * STRING_PITCH;
const INNER_HEIGHT  = FRET_ROWS * FRET_PITCH;

const TOTAL_WIDTH   = 2 * H_MARGIN + INNER_WIDTH;
const TOTAL_HEIGHT  = TOP_MARGIN + NUT_HEIGHT + INNER_HEIGHT + BOTTOM_MARGIN;

const STRING_X = (stringNum: number) =>
  H_MARGIN + (STRING_COUNT - stringNum) * STRING_PITCH;  // string 6 = left, string 1 = right

const FRET_Y = (fretRow: number) =>
  TOP_MARGIN + NUT_HEIGHT + fretRow * FRET_PITCH;   // 0 = top of nut, 1 = first fret band, …

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ChordDiagramSVGProps {
  /** Fret at top of diagram (first row). 0 = open/nut position. */
  startFret?: number;
  /** Highlight dots from useChord / buildChordHighlights. */
  highlights?: FretHighlight[];
  /** Per-string state (index 0 = string 6 = low E). */
  stringStates?: StringState[];
  /** Override label format. */
  labelFormat?: LabelFormat;
  /** Whether this voicing is selected (adds ring). */
  selected?: boolean;
  /** Click handler for selection in ChordDiagramGrid. */
  onClick?: () => void;
  width?: number;   // render width in CSS px (maintains aspect ratio via viewBox)
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ChordDiagramSVG({
  startFret = 0,
  highlights = [],
  stringStates,
  labelFormat: labelFormatProp,
  selected = false,
  onClick,
  width = 80,
}: ChordDiagramSVGProps) {
  const storeLabelFormat = useAppStore((s) => s.labelFormat);
  const labelFormat = labelFormatProp ?? storeLabelFormat;

  const showNut = startFret === 0;

  // Build dot lookup
  const dotMap = new Map<string, FretHighlight>();
  for (const h of highlights) {
    dotMap.set(`${h.string}:${h.fret}`, h);
  }

  function getLabel(h: FretHighlight): string {
    return h.labels[labelFormat] ?? "";
  }

  // Detect barre: same finger, consecutive strings, same fret
  const barreMap = new Map<string, { minString: number; maxString: number; fret: number }>();
  for (const h of highlights) {
    if (h.finger && h.finger > 0) {
      const k = `${h.finger}:${h.fret}`;
      const prev = barreMap.get(k);
      if (prev) {
        prev.minString = Math.min(prev.minString, h.string);
        prev.maxString = Math.max(prev.maxString, h.string);
      } else {
        barreMap.set(k, { minString: h.string, maxString: h.string, fret: h.fret });
      }
    }
  }
  const barres = [...barreMap.values()].filter((b) => b.maxString - b.minString > 0);

  const DOT_R = 5;

  return (
    <svg
      viewBox={`0 0 ${TOTAL_WIDTH} ${TOTAL_HEIGHT}`}
      width={width}
      height={(width / TOTAL_WIDTH) * TOTAL_HEIGHT}
      onClick={onClick}
      className={onClick ? "cursor-pointer" : undefined}
      style={selected ? { outline: "2px solid var(--color-primary)", borderRadius: 4 } : undefined}
      aria-label={`Chord diagram${startFret > 0 ? ` starting at fret ${startFret}` : ""}`}
      role={onClick ? "button" : "img"}
    >
      {/* ── Open / muted indicators ── */}
      {stringStates?.map((state, i) => {
        const stringNum = STRING_COUNT - i; // 6..1
        const cx = STRING_X(stringNum);
        const cy = TOP_MARGIN - 8;
        if (state === "open") {
          return (
            <circle
              key={`os-${stringNum}`}
              cx={cx} cy={cy} r={4}
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
              <line x1={cx-d} y1={cy-d} x2={cx+d} y2={cy+d}
                stroke="var(--color-muted-foreground)" strokeWidth={1.5} strokeLinecap="round" />
              <line x1={cx+d} y1={cy-d} x2={cx-d} y2={cy+d}
                stroke="var(--color-muted-foreground)" strokeWidth={1.5} strokeLinecap="round" />
            </g>
          );
        }
        return null;
      })}

      {/* ── Nut or start-fret indicator ── */}
      {showNut ? (
        <rect
          x={H_MARGIN - 1}
          y={TOP_MARGIN}
          width={INNER_WIDTH + 2}
          height={NUT_HEIGHT}
          fill="var(--color-foreground)"
          rx={1}
        />
      ) : (
        <text
          x={H_MARGIN - 4}
          y={TOP_MARGIN + NUT_HEIGHT + FRET_PITCH / 2}
          textAnchor="end"
          dominantBaseline="middle"
          fontSize={7}
          fill="var(--color-muted-foreground)"
          fontFamily="var(--font-mono)"
        >
          {startFret}fr
        </text>
      )}

      {/* ── Fret lines ── */}
      {Array.from({ length: FRET_ROWS + 1 }, (_, row) => (
        <line
          key={`fret-${row}`}
          x1={H_MARGIN}
          y1={FRET_Y(row)}
          x2={H_MARGIN + INNER_WIDTH}
          y2={FRET_Y(row)}
          stroke="var(--color-border)"
          strokeWidth={row === 0 && !showNut ? 0.5 : 0.5}
        />
      ))}

      {/* ── String lines ── */}
      {Array.from({ length: STRING_COUNT }, (_, i) => {
        const stringNum = STRING_COUNT - i;
        const x = STRING_X(stringNum);
        return (
          <line
            key={`str-${stringNum}`}
            x1={x} y1={FRET_Y(0)}
            x2={x} y2={FRET_Y(FRET_ROWS)}
            stroke="var(--color-border)"
            strokeWidth={0.75}
          />
        );
      })}

      {/* ── Barre arcs ── */}
      {barres.map((b, i) => {
        const row = b.fret - startFret;
        if (row < 1 || row > FRET_ROWS) return null;
        const cy = FRET_Y(row) - FRET_PITCH / 2;
        const x1 = STRING_X(b.maxString);
        const x2 = STRING_X(b.minString);
        return (
          <rect
            key={`barre-${i}`}
            x={x1 - DOT_R}
            y={cy - DOT_R}
            width={x2 - x1 + DOT_R * 2}
            height={DOT_R * 2}
            rx={DOT_R}
            fill="var(--color-foreground)"
            opacity={0.85}
          />
        );
      })}

      {/* ── Dots ── */}
      {highlights.map((h, idx) => {
        const row = h.fret - startFret;
        if (h.fret === 0) return null; // open strings shown above nut
        if (row < 1 || row > FRET_ROWS) return null;

        const cx = STRING_X(h.string);
        const cy = FRET_Y(row) - FRET_PITCH / 2;
        const label = getLabel(h);
        const needsSmall = label.length > 2;

        return (
          <g key={`dot-${idx}`}>
            <circle cx={cx} cy={cy} r={DOT_R} fill={h.color} opacity={0.92} />
            {label && (
              <text
                x={cx} y={cy}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={needsSmall ? 5 : 6}
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
