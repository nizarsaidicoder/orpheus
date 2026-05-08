import { useAppStore } from "~/lib/store";
import type { LabelFormat } from "~/lib/types";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

const OPTIONS: { value: LabelFormat; label: string; title: string }[] = [
  { value: "degree",   label: "Deg",  title: "Show scale degrees (R, b3, 5…)" },
  { value: "interval", label: "Int",  title: "Show intervals (P1, m3, P5…)" },
  { value: "finger",   label: "Fng",  title: "Show fretting finger numbers" },
];

export function LabelFormatToggle() {
  const labelFormat = useAppStore((s) => s.labelFormat);
  const setLabelFormat = useAppStore((s) => s.setLabelFormat);

  return (
    <div
      className="flex items-center rounded-md border border-input overflow-hidden"
      role="group"
      aria-label="Dot label format"
    >
      {OPTIONS.map((opt, i) => (
        <button
          key={opt.value}
          type="button"
          title={opt.title}
          aria-pressed={labelFormat === opt.value}
          onClick={() => setLabelFormat(opt.value)}
          className={cn(
            "px-2 py-1 text-xs font-mono leading-none transition-colors",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            i > 0 && "border-l border-input",
            labelFormat === opt.value
              ? "bg-primary text-primary-foreground"
              : "bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
