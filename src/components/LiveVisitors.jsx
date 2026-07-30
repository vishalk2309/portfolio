import useVisitorStats from "../hooks/useVisitorStats";

/**
 * Compact "live viewers" badge — a pulsing dot + how many people are
 * viewing the site right now. Renders nothing until the count is known.
 */
export default function LiveVisitors({ className = "" }) {
  const { live } = useVisitorStats();

  if (live == null) return null;

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-white/60 backdrop-blur-md ${className}`}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
      </span>
      <span className="font-semibold text-white">{live}</span>
      online
    </div>
  );
}
