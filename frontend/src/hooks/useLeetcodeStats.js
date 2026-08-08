import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const COLORS = { Easy: "#22D3EE", Medium: "#34D399", Hard: "#F87171" };

// Primary source: our own edge function (LeetCode GraphQL, cached, no cold start).
async function fetchViaEdge(username) {
  if (!supabase) return null;
  const { data, error } = await supabase.functions.invoke("leetcode-stats", {
    body: { username },
  });
  if (error || !data || data.error || data.totalSolved == null) return null;
  return data;
}

// Fallback source: a community proxy (may cold-start / rate-limit).
async function fetchViaProxy(apiBase, username) {
  if (!apiBase) return null;
  const res = await fetch(`${apiBase}/userProfile/${encodeURIComponent(username)}`);
  if (!res.ok) return null;
  return await res.json();
}

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
    if (!username || username.startsWith("YOUR_")) {
      setStatus("skipped");
      return;
    }
    let cancelled = false;
    setStatus("loading");

    (async () => {
      // Edge function first, then the proxy, then static fallback.
      let json = await fetchViaEdge(username).catch(() => null);
      if (!json) json = await fetchViaProxy(apiBase, username).catch(() => null);
      if (cancelled) return;

      if (!json) {
        setStatus("error");
        return;
      }
      const normalized = normalize(json, fallback);
      setData(normalized);
      setStatus(normalized === fallback ? "error" : "live");
    })();

    return () => {
      cancelled = true;
    };
  }, [username, apiBase]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, status };
}
