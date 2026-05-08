import { useArpeggios } from "~/hooks/useArpeggios";
import { QUALITY_OPTIONS } from "~/lib/engine";
import {
  useKeyParam,
  useModeParam,
  useTuningParam,
  useRootParam,
  useQualityParam,
  useFretParam,
} from "~/lib/url-state";
import { FretboardSVG } from "~/components/fretboard/FretboardSVG";
import { cn } from "~/lib/utils";

// ── Only triad / seventh qualities for arpeggio patterns ─────────────────────

const ARPEGGIO_QUALITIES = QUALITY_OPTIONS.filter((q) =>
  ["Triads", "Sevenths"].includes(q.group),
);

const QUALITY_GROUPS = (() => {
  const map = new Map<string, typeof ARPEGGIO_QUALITIES[number][]>();
  for (const q of ARPEGGIO_QUALITIES) {
    if (!map.has(q.group)) map.set(q.group, []);
    map.get(q.group)!.push(q);
  }
  return map;
})();

const CHROMATIC_NOTES = [
  "C","Db","D","Eb","E","F","F#","G","Ab","A","Bb","B",
] as const;

// ── CAGED shape colors (same as scales route) ─────────────────────────────────

const CAGED_COLOR: Record<string, string> = {
  C: "border-[var(--color-dot-root)]/40   bg-[var(--color-dot-root)]/10   text-[var(--color-dot-root)]",
  A: "border-[var(--color-dot-third)]/40  bg-[var(--color-dot-third)]/10  text-[var(--color-dot-third)]",
  G: "border-[var(--color-dot-fifth)]/40  bg-[var(--color-dot-fifth)]/10  text-[var(--color-dot-fifth)]",
  E: "border-[var(--color-dot-seventh)]/40 bg-[var(--color-dot-seventh)]/10 text-[var(--color-dot-seventh)]",
  D: "border-[var(--color-dot-other)]/40  bg-[var(--color-dot-other)]/10  text-[var(--color-dot-other)]",
};

const MAX_FRET = 20;
const WINDOW   = 5;

export default function ArpeggiosRoute() {
  const [keyNote]  = useKeyParam();
  const [keyMode]  = useModeParam();
  const [tuning]   = useTuningParam();

  const [root, setRoot]         = useRootParam();
  const [quality, setQuality]   = useQualityParam();
  const [fromFret, setFromFret] = useFretParam();

  const toFret = fromFret + WINDOW;

  const { chord, chordName, highlights, cagedPositions } = useArpeggios({
    root,
    quality,
    tuning,
    fromFret,
    toFret,
    keyNote,
    keyMode,
  });

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* ── Left panel: root + quality ── */}
      <aside className="w-52 flex-shrink-0 border-r border-border overflow-y-auto p-4 space-y-5">
        {/* Root */}
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Root
          </h3>
          <div className="grid grid-cols-4 gap-1">
            {CHROMATIC_NOTES.map((note) => (
              <button
                key={note}
                type="button"
                onClick={() => setRoot(note)}
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

        {/* Quality */}
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Type
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
                      onClick={() => setQuality(opt.value)}
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

      {/* ── Main: fretboard + controls ── */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-border px-6 py-3 flex items-center gap-3">
          <h2 className="text-lg font-semibold text-foreground">{chordName}</h2>
          <span className="text-sm text-muted-foreground">arpeggio</span>
          <span className="font-mono text-xs text-muted-foreground ml-2">
            {chord.pitches.length} tones
          </span>
        </div>

        {/* CAGED position tabs */}
        <div className="flex items-center gap-2 border-b border-border px-6 py-2">
          <span className="text-xs text-muted-foreground mr-1">Jump to:</span>
          {cagedPositions.map((pos) => (
            <button
              key={pos.shape}
              type="button"
              onClick={() => setFromFret(Math.max(0, pos.rootFret - 1))}
              className={cn(
                "rounded border px-3 py-1 text-xs font-mono font-semibold transition-colors",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                CAGED_COLOR[pos.shape] ?? "",
              )}
            >
              {pos.shape}
              <span className="ml-1 text-[10px] font-normal opacity-70">fr{pos.rootFret}</span>
            </button>
          ))}
        </div>

        {/* Fretboard */}
        <div className="flex flex-1 items-center justify-center p-8 overflow-x-auto">
          <FretboardSVG
            fromFret={fromFret}
            toFret={toFret}
            highlights={highlights}
          />
        </div>

        {/* Fret slider */}
        <div className="border-t border-border px-6 py-4 flex items-center gap-4">
          <span className="text-xs text-muted-foreground w-16 font-mono">
            Fret {fromFret}–{toFret}
          </span>
          <input
            type="range"
            min={0}
            max={MAX_FRET - WINDOW}
            value={fromFret}
            onChange={(e) => setFromFret(Number(e.target.value))}
            className="flex-1 accent-primary"
            aria-label="Scroll fret position"
          />
          <span className="text-xs text-muted-foreground w-8 font-mono text-right">
            {MAX_FRET}
          </span>
        </div>
      </main>
    </div>
  );
}
