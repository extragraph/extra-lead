const THEME_STORAGE_KEY = "extra-lead-theme-preference";

export type Theme = "light" | "dark";

export function readThemePreference(): Theme {
  if (typeof window === "undefined") return "dark";
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  return (saved === "light" ? "light" : "dark") as Theme;
}

export function writeThemePreference(theme: Theme) {
  if (typeof window === "undefined") return;
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}
