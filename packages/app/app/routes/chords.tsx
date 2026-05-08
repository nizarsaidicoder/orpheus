import { useChord } from "~/hooks/useChord";
import { QUALITY_OPTIONS, intervalLabel } from "~/lib/engine";
import {
  useKeyParam,
  useModeParam,
  useTuningParam,
  useRootParam,
  useQualityParam,
  useVoicingParam,
} from "~/lib/url-state";
import { FretboardSVG } from "~/components/fretboard/FretboardSVG";
import { ChordDiagramGrid } from "~/components/chord-diagram/ChordDiagramGrid";
import { cn } from "~/lib/utils";

// ── Note picker strip ─────────────────────────────────────────────────────────

const CHROMATIC_NOTES = [
  "C","Db","D","Eb","E","F","F#","G","Ab","A","Bb","B",
] as const;

// ── Quality groups ────────────────────────────────────────────────────────────

const QUALITY_GROUPS = (() => {
  const map = new Map<string, typeof QUALITY_OPTIONS[number][]>();
  for (const q of QUALITY_OPTIONS) {
    if (!map.has(q.group)) map.set(q.group, []);
    map.get(q.group)!.push(q);
  }
  return map;
})();

// ── Fret window for a voicing ─────────────────────────────────────────────────

function chordFretWindow(highlights: { fret: number }[]): [number, number] {
  const frets = highlights.map((h) => h.fret).filter((f) => f > 0);
  if (frets.length === 0) return [0, 4];
  const min = Math.min(...frets);
  const from = Math.max(0, min - 1);
  return [from, from + 5];
}

// ── Tonal function badge color ────────────────────────────────────────────────

const FUNCTION_COLOR: Record<string, string> = {
  tonic:       "bg-blue-500/20 text-blue-300 border-blue-500/30",
  predominant: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  dominant:    "bg-red-500/20 text-red-300 border-red-500/30",
  ambiguous:   "bg-surface-3 text-muted-foreground border-border",
};

// ── Route ─────────────────────────────────────────────────────────────────────

export default function ChordsRoute() {
  const [keyNote] = useKeyParam();
  const [keyMode] = useModeParam();
  const [tuning]  = useTuningParam();

  const [root, setRoot]           = useRootParam();
  const [quality, setQuality]     = useQualityParam();
  const [voicingIdx, setVoicing]  = useVoicingParam();

  const {
    chord,
    chordName,
    voicings,
    highlights,
    stringStates,
    romanNumeral,
    analysis,
  } = useChord({
    root,
    quality,
    tuning,
    voicingIndex: voicingIdx,
    keyNote,
    keyMode,
  });

  const [fromFret, toFret] = chordFretWindow(highlights);

  // Interval chips (root + chord tones)
  const intervalChips = [
    { label: "R", sub: "root" },
    ...chord.intervalStructure.map((iv) => ({
      label: intervalLabel(iv.semitones),
      sub: `${iv.semitones}st`,
    })),
  ];

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* ── Left panel: root + quality ── */}
      <aside className="w-52 flex-shrink-0 border-r border-border overflow-y-auto p-4 space-y-5">
        {/* Root picker */}
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Root
          </h3>
          <div className="grid grid-cols-4 gap-1">
            {CHROMATIC_NOTES.map((note) => (
              <button
                key={note}
                type="button"
                onClick={() => { setRoot(note); setVoicing(0); }}
                className={cn(
                  "rounded px-1.5 py-1 text-xs font-mono font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                  note === root
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface-2 text-foreground hover:bg-accent",
                )}
              >
                {note}
              </button>
            ))}
          </div>
        </section>

        {/* Quality picker — grouped */}
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Quality
          </h3>
          <div className="space-y-3">
            {[...QUALITY_GROUPS.entries()].map(([group, opts]) => (
              <div key={group}>
                <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                  {group}
                </p>
                <div className="flex flex-wrap gap-1">
                  {opts.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => { setQuality(opt.value); setVoicing(0); }}
                      className={cn(
                        "rounded px-2 py-0.5 text-xs font-medium transition-colors",
                        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                        opt.value === quality
                          ? "bg-primary text-primary-foreground"
                          : "bg-surface-2 text-foreground hover:bg-accent",
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </aside>

      {/* ── Center: fretboard + chord info ── */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Fretboard */}
        <div className="flex flex-1 items-center justify-center p-8 overflow-x-auto">
          <FretboardSVG
            fromFret={fromFret}
            toFret={toFret}
            highlights={highlights}
            stringStates={stringStates}
          />
        </div>

        {/* Info bar */}
        <footer className="border-t border-border bg-surface-1 px-6 py-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Name + roman numeral */}
            <div className="flex items-baseline gap-2.5 min-w-[8rem]">
              <span className="text-2xl font-semibold text-foreground">{chordName}</span>
              {romanNumeral && (
                <span className="font-mono text-lg text-primary">{romanNumeral}</span>
              )}
            </div>

            {/* Tonal function */}
            <span
              className={cn(
                "rounded border px-2 py-0.5 text-xs font-medium capitalize",
                FUNCTION_COLOR[analysis.function] ?? FUNCTION_COLOR.ambiguous,
              )}
            >
              {analysis.function}
              {analysis.role ? ` · ${analysis.role}` : ""}
            </span>

            {/* Borrowed badge */}
            {analysis.isBorrowed && (
              <span className="rounded border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 text-xs text-purple-300">
                borrowed
              </span>
            )}

            {/* Interval chips */}
            <div className="ml-auto flex items-center gap-1.5">
              {intervalChips.map((iv, i) => (
                <div key={i} className="flex flex-col items-center rounded bg-surface-2 px-2 py-1 min-w-[2.25rem]">
                  <span className="font-mono text-xs font-semibold text-foreground leading-none">
                    {iv.label}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground leading-none mt-0.5">
                    {iv.sub}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </footer>
      </main>

      {/* ── Right panel: voicing grid ── */}
      <aside className="w-56 flex-shrink-0 border-l border-border overflow-y-auto p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Voicings ({voicings.length})
        </h3>
        <ChordDiagramGrid
          voicings={voicings.slice(0, 6)}
          chord={chord}
          selectedIndex={voicingIdx}
          onSelect={(i) => setVoicing(i)}
        />
      </aside>
    </div>
  );
}
