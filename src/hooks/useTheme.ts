import { useEffect, useMemo } from "react";
import { useAppStore } from "@/stores/appStore";

export type ResolvedTheme = "light" | "dark";

export function useTheme() {
  const theme = useAppStore((s) => s.preferences.theme);
  const fontSize = useAppStore((s) => s.preferences.fontSize);
  const accentColor = useAppStore((s) => s.preferences.accentColor);

  const resolvedTheme: ResolvedTheme = useMemo(() => {
    if (theme === "auto") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return theme;
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    if (theme !== "auto") return;
    const handler = (e: MediaQueryListEvent) => {
      const root = document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(e.matches ? "dark" : "light");
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    const scale = fontSize / 100;
    root.style.setProperty("--app-font-scale", String(scale));
    root.style.fontSize = `${16 * scale}px`;
  }, [fontSize]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--app-accent", accentColor);
    const hover = adjustColor(accentColor, -12);
    root.style.setProperty("--app-accent-hover", hover);
  }, [accentColor]);

  return {
    theme,
    resolvedTheme,
    isDark: resolvedTheme === "dark",
  };
}

function adjustColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const r = Math.max(0, Math.min(255, (num >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt));
  const b = Math.max(0, Math.min(255, (num & 0x0000ff) + amt));
  return `#${(0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1)}`;
}

export default useTheme;
