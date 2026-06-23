import { motion } from "framer-motion";
import { github } from "../data";
import useGithubContributions from "../hooks/useGithubContributions";

// level 0..4 -> color (GitHub-dark-ish, tinted to the site's cyan/purple)
const LEVELS = ["#1c2230", "#0e4429", "#006d32", "#26a641", "#39d353"];

export default function ContributionHeatmap() {
  const { weeks, total, status } = useGithubContributions(github.username);

  if (status === "error" || status === "skipped") return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="glass rounded-3xl p-6 sm:p-8"
    >
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">
          {status === "live" ? (
            <>
              <span className="gradient-text">{total}</span> contributions in
              the last year
            </>
          ) : (
            "Loading contributions…"
          )}
        </h3>
      </div>

      {/* horizontally scrollable grid on small screens */}
      <div className="overflow-x-auto pb-2 [scrollbar-width:thin]">
        <div className="flex gap-[3px]">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day) => (
                <div
                  key={day.date}
                  title={`${day.date}: ${day.count} contribution${
                    day.count === 1 ? "" : "s"
                  }`}
                  className="h-[11px] w-[11px] rounded-[2px]"
                  style={{ background: LEVELS[day.level] || LEVELS[0] }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2 text-xs text-white/40">
        <span>Less</span>
        {LEVELS.map((c) => (
          <span
            key={c}
            className="h-[11px] w-[11px] rounded-[2px]"
            style={{ background: c }}
          />
        ))}
        <span>More</span>
      </div>
    </motion.div>
  );
}
