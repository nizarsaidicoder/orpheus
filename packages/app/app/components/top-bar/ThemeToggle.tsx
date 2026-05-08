import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "~/components/ui/button";

export function ThemeToggle() {
  const [isLight, setIsLight] = useState(false);

  // Read initial state from DOM (set by inline script in root.tsx)
  useEffect(() => {
    setIsLight(document.documentElement.classList.contains("light"));
  }, []);

  function toggle() {
    const next = !isLight;
    document.documentElement.classList.toggle("light", next);
    localStorage.setItem("theme", next ? "light" : "dark");
    setIsLight(next);
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
    >
      {isLight ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </Button>
  );
}
