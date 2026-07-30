import { useState } from "react";
import { FaPalette } from "react-icons/fa";
import { FiSun, FiMoon } from "react-icons/fi";
import AccentDots from "./AccentDots";
import { useMode } from "../theme";

/** Bottom-right cluster: light/dark toggle + palette button (accent swatches). */
export default function FloatingThemeButton() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useMode();
  const isDark = mode === "dark";

  return (
    <div
      className="fixed bottom-6 right-6 z-[80] flex items-center gap-3"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div
        className={`glass flex items-center gap-2 rounded-full px-3 py-2 transition-all duration-300 ${
          open
            ? "translate-x-0 opacity-100"
            : "pointer-events-none translate-x-3 opacity-0"
        }`}
      >
        <AccentDots size={20} />
      </div>

      {/* Light / dark mode toggle */}
      <button
        onClick={() => setMode(isDark ? "light" : "dark")}
        aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
        title={isDark ? "Light mode" : "Dark mode"}
        className="glass flex h-12 w-12 items-center justify-center rounded-full text-lg text-white transition-transform hover:scale-110"
      >
        {isDark ? <FiSun /> : <FiMoon />}
      </button>

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Change accent theme"
        className="flex h-12 w-12 items-center justify-center rounded-full text-lg text-base shadow-[0_0_24px_-4px_var(--accent-glow)] transition-transform hover:scale-110"
        style={{
          background:
            "linear-gradient(135deg, var(--accent-from), var(--accent-to))",
        }}
      >
        <FaPalette />
      </button>
    </div>
  );
}
