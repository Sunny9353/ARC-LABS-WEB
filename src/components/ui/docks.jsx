import { useEffect, useState } from "react";
import { Moon, Settings, Sun } from "lucide-react";

const STORAGE_KEY = "arclabs_theme";

function getSystemTheme() {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function applyTheme(mode) {
  const resolvedTheme = mode === "system" ? getSystemTheme() : mode;
  document.documentElement.dataset.theme = resolvedTheme;
  document.documentElement.dataset.themeMode = mode;
}

export const Component = () => {
  const [mode, setMode] = useState(() => localStorage.getItem(STORAGE_KEY) || "dark");

  useEffect(() => {
    applyTheme(mode);
    localStorage.setItem(STORAGE_KEY, mode);

    if (mode !== "system") return undefined;

    const media = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => applyTheme("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [mode]);

  const itemClass = (value) =>
    `theme-dock-btn${mode === value ? " active" : ""}`;

  return (
    <div className="theme-dock" aria-label="Theme controls">
      <button
        className={itemClass("light")}
        aria-label="Toggle Light Mode"
        onClick={() => setMode("light")}
        type="button"
      >
        <Sun aria-hidden="true" />
        <span>Light</span>
      </button>

      <button
        className={itemClass("dark")}
        aria-label="Toggle Dark Mode"
        onClick={() => setMode("dark")}
        type="button"
      >
        <Moon aria-hidden="true" />
        <span>Dark</span>
      </button>

      <button
        className={itemClass("system")}
        aria-label="Use System Theme"
        onClick={() => setMode("system")}
        type="button"
      >
        <Settings aria-hidden="true" />
        <span>System</span>
      </button>
    </div>
  );
};

export const ThemeDock = Component;
