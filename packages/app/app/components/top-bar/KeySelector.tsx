import { useEffect, useRef, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import { NOTE_OPTIONS } from "~/lib/engine";
import { useKeyParam, useModeParam } from "~/lib/url-state";
import { useCircleOfFifths } from "~/hooks/useCircleOfFifths";
import { CircleOfFifthsSVG } from "~/components/circle-of-fifths/CircleOfFifthsSVG";

const MODE_OPTIONS = [
  { value: "major", label: "Major" },
  { value: "minor", label: "Minor" },
] as const;

export function KeySelector() {
  const [key, setKey] = useKeyParam();
  const [mode, setMode] = useModeParam();
  const [circleOpen, setCircleOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { majorNodes, minorNodes, activeNode } = useCircleOfFifths(key, mode);

  // Close on outside click
  useEffect(() => {
    if (!circleOpen) return;
    function onOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setCircleOpen(false);
      }
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [circleOpen]);

  function handleSelectFromCircle(noteName: string, selectedMode: "major" | "minor") {
    setKey(noteName as typeof key);
    setMode(selectedMode);
    setCircleOpen(false);
  }

  return (
    <div ref={containerRef} className="relative flex items-center gap-1.5" aria-label="Key selector">
      {/* Circle-of-fifths toggle button */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => setCircleOpen((v) => !v)}
        aria-label="Open circle of fifths key selector"
        aria-expanded={circleOpen}
      >
        {/* Simple circle icon */}
        <svg viewBox="0 0 16 16" width={14} height={14} fill="none">
          <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="8" cy="8" r="3"   stroke="currentColor" strokeWidth="1.2" />
          <line x1="8" y1="1.5" x2="8" y2="14.5" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.4" />
          <line x1="1.5" y1="8" x2="14.5" y2="8" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.4" />
        </svg>
      </Button>

      {/* Note selector */}
      <Select value={key} onValueChange={(v) => setKey(v as typeof key)}>
        <SelectTrigger className="h-8 w-[4.5rem] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {NOTE_OPTIONS.map((note) => (
            <SelectItem key={note} value={note} className="text-xs">
              {note}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Mode selector */}
      <Select value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
        <SelectTrigger className="h-8 w-[5.5rem] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {MODE_OPTIONS.map((m) => (
            <SelectItem key={m.value} value={m.value} className="text-xs">
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Circle-of-fifths popover */}
      {circleOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 rounded-lg border border-border bg-popover p-3 shadow-xl">
          <CircleOfFifthsSVG
            majorNodes={majorNodes}
            minorNodes={minorNodes}
            activeNode={activeNode}
            onSelectKey={handleSelectFromCircle}
            size={260}
          />
        </div>
      )}
    </div>
  );
}
