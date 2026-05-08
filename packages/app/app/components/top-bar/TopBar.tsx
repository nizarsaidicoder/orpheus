import { NavLink } from "react-router";
import { cn } from "~/lib/utils";
import { KeySelector } from "./KeySelector";
import { TuningSelector } from "./TuningSelector";
import { ThemeToggle } from "./ThemeToggle";
import { LabelFormatToggle } from "./LabelFormatToggle";

const NAV_LINKS = [
  { to: "/chords",       label: "Chords" },
  { to: "/scales",       label: "Scales" },
  { to: "/identifier",   label: "Identifier" },
  { to: "/progressions", label: "Progressions" },
  { to: "/arpeggios",    label: "Arpeggios" },
] as const;

export function TopBar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 h-14 border-b border-border bg-surface-1/90 backdrop-blur-sm">
      <div className="flex h-full items-center gap-6 px-4">
        {/* Wordmark */}
        <span className="font-mono text-sm font-semibold tracking-widest text-primary select-none">
          ORPHEUS
        </span>

        {/* Nav */}
        <nav className="flex items-center gap-1" aria-label="Feature navigation">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right controls */}
        <div className="flex items-center gap-3">
          <LabelFormatToggle />
          <div className="h-4 w-px bg-border" aria-hidden />
          <KeySelector />
          <div className="h-4 w-px bg-border" aria-hidden />
          <TuningSelector />
          <div className="h-4 w-px bg-border" aria-hidden />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
