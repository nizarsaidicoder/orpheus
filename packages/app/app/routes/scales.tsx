import { useScale } from "~/hooks/useScale";
import { SCALE_OPTIONS, spellingToDisplay } from "~/lib/engine";
import {
  useKeyParam,
  useModeParam,
  useTuningParam,
  useScaleParam,
  useFretParam,
} from "~/lib/url-state";
import { FretboardSVG } from "~/components/fretboard/FretboardSVG";
import { cn } from "~/lib/utils";

// ── Scale groups ──────────────────────────────────────────────────────────────

const SCALE_GROUPS = (() => {
  const map = new Map<string, typeof SCALE_OPTIONS[number][]>();
  for (const s of SCALE_OPTIONS) {
    const g = s.group ?? "other";
    if (!map.has(g)) map.set(g, []);
    map.get(g)!.push(s);
  }
  return map;
})();

// ── CAGED shape colors ────────────────────────────────────────────────────────

const CAGED_COLOR: Record<string, string> = {
  C: "bg-[var(--color-dot-root)]/20   text-[var(--color-dot-root)]   border-[var(--color-dot-root)]/40",
  A: "bg-[var(--color-dot-third)]/20  text-[var(--color-dot-third)]  border-[var(--color-dot-third)]/40",
  G: "bg-[var(--color-dot-fifth)]/20  text-[var(--color-dot-fifth)]  border-[var(--color-dot-fifth)]/40",
  E: "bg-[var(--color-dot-seventh)]/20 text-[var(--color-dot-seventh)] border-[var(--color-dot-seventh)]/40",
  D: "bg-[var(--color-dot-other)]/20  text-[var(--color-dot-other)]  border-[var(--color-dot-other)]/40",
};

// ── Fret slider config ────────────────────────────────────────────────────────

const MAX_FRET = 20;
const WINDOW   = 5;

// ── Route ─────────────────────────────────────────────────────────────────────

export default function ScalesRoute() {
  const [keyNote] = useKeyParam();
  const [keyMode] = useModeParam();
  const [tuning]  = useTuningParam();

  const [scaleName, setScaleName] = useScaleParam();
  const [fromFret, setFromFret]   = useFretParam();

  const toFret = fromFret + WINDOW;

  // Use key note as root for scale display
  const {
    scale,
    highlights,
    cagedPositions,
    allScalePositions,
  } = useScale({
    patternName: scaleName,
    root: keyNote,
    tuning,
    fromFret,
    toFret,
    keyNote,
    keyMode,
  });

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* ── Left panel: scale picker ── */}
      <aside className="w-52 flex-shrink-0 border-r border-border overflow-y-auto p-4 space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Scale
        </h3>
        {[...SCALE_GROUPS.entries()].map(([group, opts]) => (
          <div key={group}>
            <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
              {group}
            </p>
            <div className="flex flex-col gap-0.5">
              {opts.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setScaleName(opt.value)}
                  className={cn(
                    "rounded px-2.5 py-1 text-left text-xs font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                    opt.value === scaleName
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-accent",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </aside>

      {/* ── Main: fretboard + controls ── */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Scale name header */}
        <div className="border-b border-border px-6 py-3 flex items-center gap-3">
          <h2 className="text-lg font-semibold text-foreground">
            {scale
              ? `${spellingToDisplay(scale.root.spelling)} ${scaleName.charAt(0).toUpperCase() + scaleName.slice(1)}`
              : scaleName}
          </h2>
          {scale && (
            <span className="text-xs text-muted-foreground font-mono">
              {scale.pitches.map((p) => spellingToDisplay(p.spelling)).join("  ")}
            </span>
          )}
        </div>

        {/* CAGED position tabs */}
        <div className="flex items-center gap-2 border-b border-border px-6 py-2">
          <span className="text-xs text-muted-foreground mr-1">CAGED:</span>
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

          {/* All positions from scaleMap */}
          <div className="ml-4 flex items-center gap-1">
            <span className="text-[10px] text-muted-foreground">Positions:</span>
            {allScalePositions.map((pos, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setFromFret(pos.fretRange[0])}
                className={cn(
                  "rounded border border-border px-2 py-0.5 text-[10px] font-mono transition-colors",
                  pos.fretRange[0] === fromFret
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-surface-2 text-muted-foreground hover:bg-accent",
                )}
              >
                {pos.cagedShape ? pos.cagedShape : i + 1}
              </button>
            ))}
          </div>
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
          <span className="text-xs text-muted-foreground w-16 font-mono">Fret {fromFret}–{toFret}</span>
          <input
            type="range"
            min={0}
            max={MAX_FRET - WINDOW}
            value={fromFret}
            onChange={(e) => setFromFret(Number(e.target.value))}
            className="flex-1 accent-primary"
            aria-label="Scroll fret position"
          />
          <span className="text-xs text-muted-foreground w-8 font-mono text-right">{MAX_FRET}</span>
        </div>
      </main>
    </div>
  );
}
