import { useEffect, useState } from "react";

// Accent presets. Only the UI accent recolors — per-brand colors (skill
// logos, project glows, language bars) keep their real colors.
export const ACCENTS = {
  cyan: { label: "Cyan", from: "#6EE7F9", to: "#A855F7", glow: "#6EE7F9" },
  purple: { label: "Purple", from: "#C084FC", to: "#7C3AED", glow: "#A855F7" },
  green: { label: "Green", from: "#5EEAD4", to: "#22C55E", glow: "#34D399" },
};

const KEY = "accent";

export function getAccent() {
  try {
    return localStorage.getItem(KEY) || "cyan";
  } catch {
    return "cyan";
  }
}

export function applyAccent(name) {
  const a = ACCENTS[name] || ACCENTS.cyan;
  const root = document.documentElement;
  root.style.setProperty("--accent-from", a.from);
  root.style.setProperty("--accent-to", a.to);
  root.style.setProperty("--accent-glow", a.glow);
}

export function setAccent(name) {
  if (!ACCENTS[name]) return;
  try {
    localStorage.setItem(KEY, name);
  } catch {
    /* ignore */
  }
  applyAccent(name);
  window.dispatchEvent(new CustomEvent("accentchange", { detail: name }));
}

/** [accent, setAccent] — re-renders any component when the accent changes. */
export function useAccent() {
  const [accent, setLocal] = useState(getAccent);
  useEffect(() => {
    const on = (e) => setLocal(e.detail);
    window.addEventListener("accentchange", on);
    return () => window.removeEventListener("accentchange", on);
  }, []);
  return [accent, setAccent];
}
