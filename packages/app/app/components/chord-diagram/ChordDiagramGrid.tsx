// ChordDiagramGrid — renders up to 6 chord voicings side-by-side.
// Clicking a diagram updates the selected voicing index.

import type { Fingering } from "@orpheus/fretboard";
import { buildChordHighlights, getStringStates } from "~/lib/engine";
import type { Chord } from "@orpheus/engine";
import { ChordDiagramSVG } from "./ChordDiagramSVG";

export interface ChordDiagramGridProps {
  voicings: ReadonlyArray<Fingering>;
  chord: Chord;
  selectedIndex: number;
  onSelect: (index: number) => void;
}

/** Derive the lowest non-open fret in a fingering (= diagram startFret). */
function startFretFor(fingering: Fingering): number {
  const frets = fingering.assignments
    .map((a) => a.position.fret)
    .filter((f) => f > 0);
  return frets.length > 0 ? Math.min(...frets) : 0;
}

export function ChordDiagramGrid({
  voicings,
  chord,
  selectedIndex,
  onSelect,
}: ChordDiagramGridProps) {
  if (voicings.length === 0) {
    return (
      <p className="text-xs text-muted-foreground text-center py-4">
        No voicings found
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {voicings.slice(0, 6).map((fingering, idx) => {
        const highlights = buildChordHighlights(fingering, chord);
        const stringStates = getStringStates(fingering);
        const startFret = startFretFor(fingering);

        return (
          <div key={idx} className="flex flex-col items-center gap-1">
            <ChordDiagramSVG
              startFret={startFret}
              highlights={highlights}
              stringStates={stringStates}
              selected={idx === selectedIndex}
              onClick={() => onSelect(idx)}
              width={72}
            />
            <span className="text-[10px] font-mono text-muted-foreground">
              #{idx + 1}
            </span>
          </div>
        );
      })}
    </div>
  );
}
