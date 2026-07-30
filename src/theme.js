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

/* ------------------------------------------------------------------ */
/* Light / dark mode — toggles a class on <html>; CSS variables in     */
/* index.css do the rest. Independent of the accent above.             */
/* ------------------------------------------------------------------ */
const MODE_KEY = "mode";

export function getMode() {
  try {
    return localStorage.getItem(MODE_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function applyMode(mode) {
  const root = document.documentElement;
  root.classList.remove("theme-light", "theme-dark");
  root.classList.add(mode === "dark" ? "theme-dark" : "theme-light");
}

export function setMode(mode) {
  const next = mode === "dark" ? "dark" : "light";
  try {
    localStorage.setItem(MODE_KEY, next);
  } catch {
    /* ignore */
  }
  applyMode(next);
  window.dispatchEvent(new CustomEvent("modechange", { detail: next }));
}

/** [mode, setMode] — re-renders any component when the light/dark mode changes. */
export function useMode() {
  const [mode, setLocal] = useState(getMode);
  useEffect(() => {
    const on = (e) => setLocal(e.detail);
    window.addEventListener("modechange", on);
    return () => window.removeEventListener("modechange", on);
  }, []);
  return [mode, setMode];
}
