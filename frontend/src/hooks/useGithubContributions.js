import { useEffect, useState } from "react";

/**
 * Fetches the last year of GitHub contributions (the green grid) from a
 * CORS-enabled community API. Returns { weeks, total, status }.
 * `weeks` is an array of weeks, each an array of up to 7 { date, count, level }.
 */
export default function useGithubContributions(username) {
  const [state, setState] = useState({ weeks: [], total: 0, status: "loading" });

  useEffect(() => {
    if (!username || username.startsWith("YOUR_")) {
      setState((s) => ({ ...s, status: "skipped" }));
      return;
    }
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(
          `https://github-contributions-api.jogruber.de/v4/${username}?y=last`
        );
        if (!res.ok) throw new Error("contrib " + res.status);
        const json = await res.json();
        const days = json.contributions || [];

        // group days into weeks (columns), aligned to weekday rows
        const weeks = [];
        let week = [];
        days.forEach((d) => {
          const weekday = new Date(d.date).getDay(); // 0=Sun
          if (weekday === 0 && week.length) {
            weeks.push(week);
            week = [];
          }
          week.push(d);
        });
        if (week.length) weeks.push(week);

        if (cancelled) return;
        setState({
          weeks,
          total: json.total?.lastYear ?? 0,
          status: "live",
        });
      } catch {
        if (!cancelled) setState((s) => ({ ...s, status: "error" }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [username]);

  return state;
}
