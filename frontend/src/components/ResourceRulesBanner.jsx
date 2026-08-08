import { useState } from "react";
import { FiAlertCircle, FiPause, FiPlay } from "react-icons/fi";
import { resourceRules } from "../data";

/**
 * Scrolling notice bar for the resources page. The track holds two identical
 * copies of the rule list, so translating it -50% loops seamlessly (same trick
 * as the testimonials marquee). Hovering — or the pause button — stops it so a
 * rule can actually be read.
 */
export default function ResourceRulesBanner({ rules = resourceRules }) {
  const [paused, setPaused] = useState(false);
  if (!rules?.length) return null;

  const Track = () => (
    <>
      {rules.map((rule, i) => (
        <span key={i} className="flex shrink-0 items-center gap-3 px-6">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-neon-cyan" />
          <span className="whitespace-nowrap">{rule}</span>
        </span>
      ))}
    </>
  );

  return (
    <div className="glass relative flex items-center gap-3 overflow-hidden rounded-2xl py-3 pl-4 pr-2">
      <span className="flex shrink-0 items-center gap-2 text-sm font-semibold text-neon-cyan">
        <FiAlertCircle className="shrink-0" />
        <span className="hidden sm:inline">File rules</span>
      </span>

      <div
        className={`relative flex-1 overflow-hidden ${paused ? "marquee-paused" : ""}`}
      >
        <div
          className="animate-marquee-banner flex items-center text-sm text-white/70"
          aria-live="off"
        >
          <Track />
          {/* Second copy — the seamless half of the loop, hidden from a11y tools. */}
          <span className="flex items-center" aria-hidden="true">
            <Track />
          </span>
        </div>
        {/* Soft fade at both edges so text slides in and out instead of clipping. */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-base to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-base to-transparent" />
      </div>

      <button
        onClick={() => setPaused((p) => !p)}
        aria-label={paused ? "Resume the scrolling rules" : "Pause the scrolling rules"}
        title={paused ? "Resume" : "Pause"}
        className="shrink-0 rounded-full border border-white/15 bg-white/5 p-2 text-white/60 transition-colors hover:text-white"
      >
        {paused ? <FiPlay size={13} /> : <FiPause size={13} />}
      </button>
    </div>
  );
}
