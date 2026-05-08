import { useMemo, useState } from "react";
import { useHarmonization } from "~/hooks/useHarmonization";
import {
  chordDisplayName,
  getVoicings,
  buildChordHighlights,
  getStringStates,
  spellingToDisplay,
  parseKey,
} from "~/lib/engine";
import { functionalAnalyzer } from "@orpheus/engine";
import {
  useKeyParam,
  useModeParam,
  useTuningParam,
  useProgressionParam,
} from "~/lib/url-state";
import { ChordDiagramSVG } from "~/components/chord-diagram/ChordDiagramSVG";
import { cn } from "~/lib/utils";
import type { HarmonizationExtension, Chord } from "@orpheus/engine";

// ── Presets ───────────────────────────────────────────────────────────────────

const PRESETS: { label: string; degrees: number[] }[] = [
  { label: "I–V–vi–IV",  degrees: [1, 5, 6, 4] },
  { label: "I–IV–V",     degrees: [1, 4, 5] },
  { label: "ii–V–I",     degrees: [2, 5, 1] },
  { label: "I–vi–ii–V",  degrees: [1, 6, 2, 5] },
  { label: "I–iii–IV–V", degrees: [1, 3, 4, 5] },
  { label: "vi–IV–I–V",  degrees: [6, 4, 1, 5] },
];

// ── Styles ────────────────────────────────────────────────────────────────────

const FUNCTION_STYLE: Record<string, string> = {
  tonic:       "border-blue-500/40 bg-blue-500/15 text-blue-300",
  predominant: "border-amber-500/40 bg-amber-500/15 text-amber-300",
  dominant:    "border-red-500/40 bg-red-500/15 text-red-300",
  ambiguous:   "border-border bg-surface-3 text-muted-foreground",
};

const EXTENSIONS: { value: HarmonizationExtension; label: string }[] = [
  { value: "triad",   label: "Triads" },
  { value: "seventh", label: "7ths" },
  { value: "ninth",   label: "9ths" },
];

// ── Chord card data builder ───────────────────────────────────────────────────

function buildCardData(chord: Chord, tuning: string) {
  const rootName = spellingToDisplay(chord.root.spelling);
  const voicings = getVoicings(rootName, chord.quality.kind, tuning);
  const fingering = voicings[0] ?? null;
  return {
    name: chordDisplayName(chord),
    highlights: fingering ? buildChordHighlights(fingering, chord) : [],
    stringStates: fingering ? getStringStates(fingering) : undefined,
  };
}

// ── Route ─────────────────────────────────────────────────────────────────────

export default function ProgressionsRoute() {
  const [keyNote] = useKeyParam();
  const [keyMode] = useModeParam();
  const [tuning]  = useTuningParam();

  const [progression, setProgression] = useProgressionParam();
  const [extension, setExtension]     = useState<HarmonizationExtension>("triad");

  const { degrees } = useHarmonization(keyNote, keyMode, extension);
  const key = useMemo(() => parseKey(keyNote, keyMode), [keyNote, keyMode]);

  // Build cards once per progression change
  const progressionCards = useMemo(
    () => progression.map((deg) => {
      const hd = degrees[deg - 1];
      if (!hd) return null;
      const card = buildCardData(hd.chord, tuning);
      let tonalFn = "ambiguous";
      try {
        const analysis = functionalAnalyzer.analyze(hd.chord, key);
        tonalFn = analysis.function;
      } catch {}
      return { deg, hd, tonalFn, ...card };
    }).filter(Boolean) as Array<{
      deg: number;
      hd: typeof degrees[0];
      tonalFn: string;
      name: string;
      highlights: ReturnType<typeof buildChordHighlights>;
      stringStates: ReturnType<typeof getStringStates> | undefined;
    }>,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [progression.join(","), degrees, tuning, key],
  );

  function addDegree(d: number) {
    setProgression([...progression, d]);
  }

  function removeDegree(i: number) {
    setProgression(progression.filter((_, idx) => idx !== i));
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* ── Left panel ── */}
      <aside className="w-56 flex-shrink-0 border-r border-border overflow-y-auto p-4 space-y-5">
        {/* Extension */}
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Extension
          </h3>
          <div className="flex rounded-md border border-input overflow-hidden">
            {EXTENSIONS.map((ext, i) => (
              <button
                key={ext.value}
                type="button"
                onClick={() => setExtension(ext.value)}
                className={cn(
                  "flex-1 py-1 text-xs font-medium transition-colors focus-visible:outline-none",
                  i > 0 && "border-l border-input",
                  extension === ext.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-transparent text-muted-foreground hover:bg-accent",
                )}
              >
                {ext.label}
              </button>
            ))}
          </div>
        </div>

        {/* Degree palette */}
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Degrees
          </h3>
          <div className="space-y-0.5">
            {degrees.map((hd, i) => (
              <button
                key={i}
                type="button"
                onClick={() => addDegree(hd.scaleDegree)}
                className="w-full flex items-center gap-2 rounded px-2.5 py-1.5 text-left hover:bg-accent transition-colors"
              >
                <span className="font-mono text-sm font-semibold text-primary w-9 shrink-0">
                  {hd.romanNumeral}
                </span>
                <span className="text-xs text-foreground truncate">
                  {chordDisplayName(hd.chord)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Presets */}
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Presets
          </h3>
          <div className="space-y-0.5">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setProgression(p.degrees)}
                className="w-full rounded px-2.5 py-1 text-left text-xs font-mono text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* ── Main: timeline ── */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-border px-6 py-3 flex items-center gap-3 min-h-[3rem]">
          <h2 className="text-sm font-semibold text-foreground">Progression</h2>
          {progression.length > 0 && (
            <>
              <span className="font-mono text-sm text-primary">
                {progression.map((d) => degrees[d - 1]?.romanNumeral ?? "?").join(" – ")}
              </span>
              <button
                type="button"
                onClick={() => setProgression([])}
                className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear
              </button>
            </>
          )}
        </div>

        {/* Chord cards */}
        <div className="flex-1 overflow-x-auto overflow-y-auto p-6">
          {progressionCards.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Add chords from the degree palette →
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-4 content-start">
              {progressionCards.map((card, i) => (
                <div
                  key={`${card.deg}-${i}`}
                  className="group relative flex flex-col items-center rounded-lg border border-border bg-surface-2 px-3 pb-3 pt-2 gap-1.5"
                >
                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => removeDegree(i)}
                    className={cn(
                      "absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center",
                      "rounded-full bg-surface-3 text-xs text-muted-foreground",
                      "opacity-0 transition-opacity group-hover:opacity-100",
                      "hover:bg-destructive hover:text-white",
                    )}
                    aria-label="Remove chord"
                  >
                    ×
                  </button>

                  {/* Roman + function */}
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-sm font-bold text-primary">
                      {card.hd.romanNumeral}
                    </span>
                    <span
                      className={cn(
                        "rounded border px-1.5 py-0.5 text-[10px] font-medium capitalize",
                        FUNCTION_STYLE[card.tonalFn] ?? FUNCTION_STYLE.ambiguous,
                      )}
                    >
                      {card.tonalFn}
                    </span>
                  </div>

                  {/* Diagram */}
                  <ChordDiagramSVG
                    highlights={card.highlights}
                    stringStates={card.stringStates}
                    width={72}
                  />

                  {/* Name */}
                  <span className="text-xs font-medium text-foreground">
                    {card.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
