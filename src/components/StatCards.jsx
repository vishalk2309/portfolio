import { motion } from "framer-motion";
import { FaGithub } from "react-icons/fa";
import { SiGeeksforgeeks, SiLeetcode } from "react-icons/si";
import { gfg, github, leetcode } from "../data";
import ProgressRing from "./ProgressRing";
import useGithubStats from "../hooks/useGithubStats";
import useGfgStats from "../hooks/useGfgStats";
import useLeetcodeStats from "../hooks/useLeetcodeStats";

const fade = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
};

// Small "live data" indicator dot.
function LiveDot({ status }) {
  if (status === "live")
    return (
      <span className="flex items-center gap-1.5 text-xs text-emerald-400">
        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
        Live
      </span>
    );
  if (status === "loading")
    return <span className="text-xs text-white/40">loading…</span>;
  return null; // skipped / error -> silently show fallback data
}

export function GfgCard() {
  const { data, status } = useGfgStats(gfg);
  const find = (l) => data.categories.find((c) => c.label === l)?.value ?? 0;
  const maxCat = Math.max(...data.categories.map((c) => c.value), 1);

  return (
    <motion.div
      {...fade}
      transition={{ duration: 0.6 }}
      className="glass rounded-3xl p-6 sm:p-8"
    >
      <div className="mb-6 flex items-center justify-between">
        <h3 className="flex items-center gap-3 text-2xl font-bold">
          <SiGeeksforgeeks className="text-3xl text-[#2F8D46]" />
          <span className="gradient-text">GeeksforGeeks</span>
        </h3>
        <LiveDot status={status} />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <ProgressRing
          id="gfg"
          size={130}
          stroke={11}
          progress={Math.min(100, (data.total / 1000) * 100)}
          from="#34D399"
          to="#22D3EE"
        >
          <span className="text-3xl font-bold text-white">{data.total}</span>
          <span className="text-xs text-white/40">solved</span>
        </ProgressRing>

        <div className="grid flex-1 grid-cols-3 gap-2 min-w-[200px] sm:gap-3">
          <Stat value={find("Easy")} label="Easy" />
          <Stat value={find("Medium")} label="Medium" />
          <Stat value={find("Hard")} label="Hard" />
        </div>
      </div>

      <div className="mt-7 space-y-4">
        {data.categories.map((c) => (
          <div key={c.label}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="font-semibold text-white">{c.label}</span>
              <span className="text-white/60">{c.value}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${(c.value / maxCat) * 100}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ background: c.color }}
              />
            </div>
          </div>
        ))}
      </div>

      <a
        href={gfg.profileUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-6 inline-block text-sm text-neon-cyan transition-colors hover:text-white"
      >
        View GFG profile →
      </a>
    </motion.div>
  );
}

function Stat({ value, label }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-2 py-4 text-center sm:px-3">
      <div className="text-xl font-bold text-white sm:text-2xl">{value}</div>
      <div className="text-xs text-white/45">{label}</div>
    </div>
  );
}

export function LeetCodeCard() {
  const { data, status } = useLeetcodeStats(leetcode);
  const pct =
    data.totalQuestions > 0
      ? (data.totalSolved / data.totalQuestions) * 100
      : 0;

  return (
    <motion.div
      {...fade}
      transition={{ duration: 0.6 }}
      className="glass rounded-3xl p-6 sm:p-8"
    >
      <div className="mb-6 flex items-center justify-between">
        <h3 className="flex items-center gap-3 text-2xl font-bold">
          <SiLeetcode className="text-3xl text-[#FFA116]" />
          <span className="gradient-text">LeetCode</span>
        </h3>
        <LiveDot status={status} />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <ProgressRing
          id="lc"
          size={130}
          stroke={11}
          progress={pct}
          from="#FFA116"
          to="#22D3EE"
        >
          <span className="text-3xl font-bold text-white">
            {data.totalSolved}
          </span>
          <span className="text-xs text-white/40">{data.totalQuestions}</span>
        </ProgressRing>

        <div className="grid flex-1 grid-cols-3 gap-2 min-w-[200px] sm:gap-3">
          <Stat
            value={data.ranking ? data.ranking.toLocaleString() : "—"}
            label="Rank"
          />
          <Stat value={data.reputation} label="Reputation" />
          <Stat value={data.contribution} label="Contribution" />
        </div>
      </div>

      <div className="mt-7 space-y-5">
        {data.breakdown.map((b) => (
          <div key={b.label}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-semibold text-white">{b.label}</span>
              <span className="text-white/60">
                {b.solved}/{b.total}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{
                  width: `${b.total ? (b.solved / b.total) * 100 : 0}%`,
                }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ background: b.color }}
              />
            </div>
          </div>
        ))}
      </div>

      <a
        href={leetcode.profileUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-6 inline-block text-sm text-neon-cyan transition-colors hover:text-white"
      >
        View LeetCode profile →
      </a>
    </motion.div>
  );
}

export function GitHubCard() {
  const { data, status } = useGithubStats(github.username, github.fallback);

  const rows = [
    { icon: "⭐", label: "Total Stars Earned:", value: data.stars },
    { icon: "📦", label: "Public Repos:", value: data.repos },
    { icon: "👥", label: "Followers:", value: data.followers },
    { icon: "🔀", label: "Total PRs:", value: data.prs },
    { icon: "❗", label: "Total Issues:", value: data.issues },
  ];

  return (
    <motion.div
      {...fade}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="glass rounded-3xl p-6 sm:p-8"
    >
      <div className="mb-6 flex items-center justify-between">
        <h3 className="flex items-center gap-3 text-2xl font-bold">
          <FaGithub className="text-3xl text-white" />
          <span className="gradient-text">Github</span>
        </h3>
        <div className="flex items-center gap-3">
          <LiveDot status={status} />
          <ProgressRing
            id="gh"
            size={84}
            stroke={7}
            progress={data.grade.pct}
            from="#A855F7"
            to="#6EE7F9"
          >
            <span className="text-xl font-bold text-white">
              {data.grade.letter}
            </span>
          </ProgressRing>
        </div>
      </div>

      <div className="space-y-4">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between">
            <span className="flex items-center gap-3 text-white/75">
              <span>{r.icon}</span>
              {r.label}
            </span>
            <span className="text-lg font-bold text-white">{r.value}</span>
          </div>
        ))}
      </div>

      {/* language bar */}
      <div className="mt-7">
        <div className="flex h-2.5 w-full overflow-hidden rounded-full">
          {data.languages.map((l) => (
            <div
              key={l.name}
              style={{ width: `${l.pct}%`, background: l.color }}
              title={`${l.name} ${l.pct}%`}
            />
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-y-2 text-sm">
          {data.languages.map((l) => (
            <div key={l.name} className="flex items-center gap-2 text-white/70">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: l.color }}
              />
              {l.name} <span className="text-white/45">{l.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
