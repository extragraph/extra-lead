"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { readThemePreference, writeThemePreference, type Theme } from "@/lib/theme/theme-preference";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = readThemePreference();
    setTheme(saved);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    writeThemePreference(theme);
    const html = document.documentElement;
    if (theme === "dark") {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [theme, mounted]);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-[var(--panel-border)] bg-[var(--input-bg)] text-zinc-600 transition hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-950/60"
      aria-label="Changer le thème"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 text-amber-300" strokeWidth={2} />
      ) : (
        <Moon className="h-4 w-4 text-indigo-400" strokeWidth={2} />
      )}
    </button>
  );
}
