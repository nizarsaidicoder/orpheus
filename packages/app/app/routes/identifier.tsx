import { useMemo, useState } from "react";
import { useAppStore } from "~/lib/store";
import { useChordIdentifier } from "~/hooks/useChordIdentifier";
import { useScaleIdentifier } from "~/hooks/useScaleIdentifier";
import { getFretboard, spellingToDisplay } from "~/lib/engine";
import { useKeyParam, useModeParam, useTuningParam } from "~/lib/url-state";
import { FretboardSVG } from "~/components/fretboard/FretboardSVG";
import { cn } from "~/lib/utils";
import type { FretHighlight } from "~/lib/types";

// ── Convert Zustand key-set → FretPosition[] ──────────────────────────────────

function useActivePositions(tuning: string) {
  const activeKeys = useAppStore((s) => s.activePositions);
  const fretboard  = getFretboard(tuning);

  return useMemo(() => {
    const positions = [];
    for (const key of activeKeys) {
      const [strS, fretS] = key.split(":");
      const str  = Number(strS);
      const fret = Number(fretS);
      if (isNaN(str) || isNaN(fret)) continue;
      const stringPositions = fretboard.positionsForString(str);
      const pos = stringPositions.find((p) => p.fret === fret);
      if (pos) positions.push(pos);
    }
    return positions;
  }, [activeKeys, fretboard]);
}

// ── Active positions → FretHighlights (neutral color) ────────────────────────

const DOT_COLOR = "var(--color-primary)";

function positionsToHighlights(
  positions: ReturnType<typeof useActivePositions>,
): FretHighlight[] {
  return positions.map((pos) => ({
    string: pos.string,
    fret:   pos.fret,
    color:  DOT_COLOR,
    labels: { degree: "", interval: "", finger: "" },
  }));
}

// ── Route ─────────────────────────────────────────────────────────────────────

type IdentifierMode = "chord" | "scale";

export default function IdentifierRoute() {
  const [keyNote] = useKeyParam();
  const [keyMode] = useModeParam();
  const [tuning]  = useTuningParam();

  const [identMode, setIdentMode] = useState<IdentifierMode>("chord");

  const togglePosition = useAppStore((s) => s.togglePosition);
  const clearPositions = useAppStore((s) => s.clearPositions);

  const positions  = useActivePositions(tuning);
  const highlights = positionsToHighlights(positions);

  // Chord analysis
  const { chord, chordName, suggestedKey, keyConfidence } = useChordIdentifier(positions);

  // Scale analysis
  const { scale, scaleName } = useScaleIdentifier(
    positions,
    identMode === "scale" ? keyNote : undefined,
    identMode === "scale" ? keyMode : undefined,
  );

  const hasPositions = positions.length > 0;

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col overflow-hidden">
      {/* Header: mode toggle + clear */}
      <div className="flex items-center gap-4 border-b border-border px-6 py-3">
        <div
          className="flex items-center rounded-md border border-input overflow-hidden"
          role="group"
          aria-label="Identifier mode"
        >
          {(["chord", "scale"] as IdentifierMode[]).map((m, i) => (
            <button
              key={m}
              type="button"
              onClick={() => setIdentMode(m)}
              className={cn(
                "px-4 py-1.5 text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                i > 0 && "border-l border-input",
                identMode === m
                  ? "bg-primary text-primary-foreground"
                  : "bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>

        <span className="text-xs text-muted-foreground">
          Click frets to toggle. Build a {identMode} pattern.
        </span>

        {hasPositions && (
          <button
            type="button"
            onClick={clearPositions}
            className="ml-auto rounded border border-border px-3 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Fretboard */}
      <div className="flex flex-1 items-center justify-center p-8 overflow-x-auto">
        <FretboardSVG
          fromFret={0}
          toFret={12}
          highlights={highlights}
          interactive={true}
          onToggle={(str, fret) => togglePosition(`${str}:${fret}`)}
        />
      </div>

      {/* Analysis panel */}
      <div className="border-t border-border bg-surface-1 px-6 py-5">
        {!hasPositions ? (
          <p className="text-sm text-muted-foreground">
            Click fret positions above to begin identification.
          </p>
        ) : identMode === "chord" ? (
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Chord</p>
              <p className="text-2xl font-semibold text-foreground">
                {chordName ?? <span className="text-muted-foreground text-lg">Unrecognised</span>}
              </p>
            </div>
            {chordName && chord && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Intervals</p>
                <p className="font-mono text-sm text-foreground">
                  {chord.intervalStructure.map((iv) => `${iv.semitones}st`).join("  ")}
                </p>
              </div>
            )}
            {suggestedKey && (
              <div className="ml-auto">
                <p className="text-xs text-muted-foreground mb-1">Suggested key</p>
                <p className="text-sm font-semibold text-foreground">
                  {spellingToDisplay(suggestedKey.tonic.spelling)}{" "}
                  {suggestedKey.modality}
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    ({Math.round(keyConfidence * 100)}%)
                  </span>
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Scale</p>
              <p className="text-2xl font-semibold text-foreground">
                {scale
                  ? `${spellingToDisplay(scale.root.spelling)} ${scaleName}`
                  : <span className="text-muted-foreground text-lg">Unrecognised</span>
                }
              </p>
            </div>
            {scale && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Notes</p>
                <p className="font-mono text-sm text-foreground">
                  {scale.pitches.map((p) => spellingToDisplay(p.spelling)).join("  ")}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
