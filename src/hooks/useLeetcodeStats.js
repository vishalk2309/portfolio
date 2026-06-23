import { useEffect, useState } from "react";

const COLORS = { Easy: "#22D3EE", Medium: "#34D399", Hard: "#F87171" };

function normalize(json, fallback) {
  if (!json || json.errors || json.totalSolved == null) return fallback;
  return {
    totalSolved: json.totalSolved ?? 0,
    totalQuestions: json.totalQuestions ?? 0,
    ranking: json.ranking ?? 0,
    reputation: json.reputation ?? 0,
    contribution: json.contributionPoint ?? 0,
    breakdown: [
      {
        label: "Easy",
        solved: json.easySolved ?? 0,
        total: json.totalEasy ?? 0,
        color: COLORS.Easy,
      },
      {
        label: "Medium",
        solved: json.mediumSolved ?? 0,
        total: json.totalMedium ?? 0,
        color: COLORS.Medium,
      },
      {
        label: "Hard",
        solved: json.hardSolved ?? 0,
        total: json.totalHard ?? 0,
        color: COLORS.Hard,
      },
    ],
  };
}

/**
 * Fetches live LeetCode stats via a CORS-enabled community proxy.
 * Returns { data, status }; falls back to `fallback` on any failure.
 */
export default function useLeetcodeStats({ username, apiBase, fallback }) {
  const [data, setData] = useState(fallback);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    if (!apiBase || !username || username.startsWith("YOUR_")) {
      setStatus("skipped");
      return;
    }
    let cancelled = false;
    setStatus("loading");

    (async () => {
      try {
        const res = await fetch(
          `${apiBase}/${encodeURIComponent(username)}`
        );
        if (!res.ok) throw new Error("leetcode " + res.status);
        const json = await res.json();
        const normalized = normalize(json, fallback);
        if (cancelled) return;
        setData(normalized);
        setStatus(normalized === fallback ? "error" : "live");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [username, apiBase]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, status };
}
