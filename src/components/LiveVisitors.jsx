import { FaEye } from "react-icons/fa";
import useVisitorStats from "../hooks/useVisitorStats";

/**
 * Compact visitor badge — a pulsing dot with how many people are viewing
 * right now, plus the cumulative visit count. Each half renders only once
 * its figure is known, so it never shows an empty/broken state.
 */
export default function LiveVisitors({ className = "" }) {
  const { live, total } = useVisitorStats();

  if (live == null && total == null) return null;

  return (
    <div
      className={`inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-white/60 backdrop-blur-md ${className}`}
    >
      {live != null && (
        <span className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="font-semibold text-white">{live}</span>
          online
        </span>
      )}

      {live != null && total != null && (
        <span className="h-3 w-px bg-white/15" aria-hidden="true" />
      )}

      {total != null && (
        <span className="flex items-center gap-1.5">
          <FaEye className="text-white/40" />
          <span className="font-semibold text-white">
            {Number(total).toLocaleString()}
          </span>
          visits
        </span>
      )}
    </div>
  );
}
