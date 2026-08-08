import { useEffect, useState } from "react";

const CAT_COLORS = {
  School: "#10B981",
  Basic: "#22D3EE",
  Easy: "#34D399",
  Medium: "#FBBF24",
  Hard: "#F87171",
};

// The community API returns either flat keys (with ?raw=y) or nested objects.
// Normalize both shapes into { total, categories: [{label, value, color}] }.
function normalize(json, fallback) {
  if (!json || typeof json !== "object") return fallback;

  const num = (v) =>
    typeof v === "number" ? v : parseInt(String(v).replace(/\D/g, ""), 10) || 0;

  const order = ["School", "Basic", "Easy", "Medium", "Hard"];
  const categories = [];

  for (const key of order) {
    // flat shape: json.Easy ; nested shape: json.solvedStats.easy.count
    let value;
    if (json[key] != null) value = num(json[key]);
    else if (json.solvedStats?.[key.toLowerCase()]?.count != null)
      value = num(json.solvedStats[key.toLowerCase()].count);
    if (value != null && value > 0)
      categories.push({ label: key, value, color: CAT_COLORS[key] });
  }

  if (!categories.length) return fallback;

  const total =
    num(json.totalProblemsSolved ?? json.total_problems_solved) ||
    categories.reduce((s, c) => s + c.value, 0);

  return { total, categories };
}

/**
 * Fetches GeeksforGeeks problem stats from a community API.
 * Returns { data, status }; falls back to `fallback` on any failure.
 */
export default function useGfgStats({ username, apiBase, fallback }) {
  const [data, setData] = useState(fallback);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    // No working public GFG API right now -> skip fetching, use static data.
    if (!apiBase || !username || username.startsWith("YOUR_")) {
      setStatus("skipped");
      return;
    }
    let cancelled = false;
    setStatus("loading");

    (async () => {
      try {
        const res = await fetch(
          `${apiBase}/?raw=y&userName=${encodeURIComponent(username)}`
        );
        if (!res.ok) throw new Error("gfg " + res.status);
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
