import { FaEye } from "react-icons/fa";
import useVisitorStats from "../hooks/useVisitorStats";

/**
 * Compact visitor badge — a pulsing dot with how many people are viewing
 * right now, plus the cumulative visit count. Each half renders only once
 * its figure is known, so it never shows an empty/broken state.
 *
 * Chrome-free by design: no pill, border or backdrop, so the page background
 * shows straight through. Colors come from the theme tokens (`text-white` maps
 * to --c-fg, `bg-live` to --c-live), which is what keeps it legible in both
 * light and dark without a surface behind it.
 */
export default function LiveVisitors({ className = "" }) {
  const { live, total } = useVisitorStats();

  if (live == null && total == null) return null;

  return (
    <div
      className={`inline-flex items-center gap-2 bg-transparent text-[10px] text-white/60 sm:gap-3 sm:text-xs ${className}`}
    >
      {live != null && (
        <span className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="live-dot absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
            <span className="live-dot relative inline-flex h-2 w-2 rounded-full" />
          </span>
          <span className="font-semibold text-white">{live}</span>
        </span>
      )}

      {live != null && total != null && (
        <span className="h-3 w-px bg-white/25" aria-hidden="true" />
      )}

      {total != null && (
        <span className="flex items-center gap-1.5">
          <FaEye className="text-white/40" />
          <span className="font-semibold text-white">
            {Number(total).toLocaleString()}
          </span>
          
        </span>
      )}
    </div>
  );
}
