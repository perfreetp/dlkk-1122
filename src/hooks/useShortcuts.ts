import { useEffect } from "react";
import Mousetrap from "mousetrap";
import { useAppStore } from "@/stores/appStore";
import { SHORTCUT_DEFS } from "@/types";

function convertToMousetrap(shortcut: string): string {
  return shortcut
    .replace(/⌘/g, "mod")
    .replace(/⇧/g, "shift")
    .replace(/⌥/g, "option")
    .replace(/⌃/g, "ctrl")
    .replace(/↩/g, "enter")
    .replace(/←/g, "left")
    .replace(/→/g, "right")
    .replace(/↑/g, "up")
    .replace(/↓/g, "down")
    .replace(/,/g, ", ")
    .toLowerCase();
}

export function useShortcuts() {
  const shortcuts = useAppStore((s) => s.preferences.shortcuts);
  const toggleShowSearch = useAppStore((s) => s.toggleShowSearch);
  const setActivePanel = useAppStore((s) => s.setActivePanel);
  const setShowEditor = useAppStore((s) => s.setShowEditor);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const setActiveSettingsTab = useAppStore((s) => s.setActiveSettingsTab);

  useEffect(() => {
    const bindings: Array<{ key: string; handler: (e: Event) => void }> = [];

    const bind = (defKey: string, handler: () => void) => {
      const userShortcut = shortcuts[defKey];
      const def = SHORTCUT_DEFS.find((d) => d.key === defKey);
      const raw = userShortcut || def?.defaultMac || "";
      if (!raw) return;
      const combo = convertToMousetrap(raw);
      const wrapped = (e: Event) => {
        e.preventDefault();
        handler();
      };
      Mousetrap.bind(combo, wrapped);
      bindings.push({ key: combo, handler: wrapped });
    };

    bind("newPost", () => setShowEditor(true));
    bind("search", toggleShowSearch);
    bind("settings", () => {
      setActivePanel("settings");
      setActiveSettingsTab("appearance");
    });
    bind("toggleTheme", toggleTheme);
    bind("openMessages", () => setActivePanel("messages"));
    bind("openFavorites", () => setActivePanel("favorites"));
    bind("nav1", () => setActivePanel("feed"));
    bind("nav2", () => setActivePanel("categories"));
    bind("nav3", () => setActivePanel("messages"));
    bind("nav4", () => setActivePanel("favorites"));
    bind("nav5", () => setActivePanel("profile"));

    return () => {
      bindings.forEach((b) => Mousetrap.unbind(b.key));
    };
  }, [shortcuts, toggleShowSearch, setActivePanel, setShowEditor, toggleTheme, setActiveSettingsTab]);
}

export default useShortcuts;
