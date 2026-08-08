import { useEffect, useState } from "react";

// Colors for the language bar (GitHub linguist-ish).
const LANG_COLORS = {
  JavaScript: "#F1E05A",
  TypeScript: "#3178C6",
  Python: "#3572A5",
  Java: "#B07219",
  HTML: "#E34C26",
  CSS: "#563D7C",
  "Jupyter Notebook": "#DA5B0B",
  "C++": "#F34B7D",
  C: "#555555",
  "C#": "#178600",
  Go: "#00ADD8",
  Rust: "#DEA584",
  PHP: "#4F5D95",
  Ruby: "#701516",
  Shell: "#89E051",
  Dart: "#00B4AB",
  Kotlin: "#A97BFF",
  Swift: "#F05138",
  Vue: "#41B883",
  SCSS: "#C6538C",
  Dockerfile: "#384D54",
  Other: "#8B949E",
};
const langColor = (name) => LANG_COLORS[name] || "#8B949E";

function computeGrade(stars, followers, repos) {
  const score = stars * 4 + followers * 3 + repos;
  if (score > 400) return { letter: "A+", pct: 96 };
  if (score > 250) return { letter: "A", pct: 88 };
  if (score > 150) return { letter: "A-", pct: 80 };
  if (score > 90) return { letter: "B+", pct: 70 };
  if (score > 50) return { letter: "B", pct: 60 };
  if (score > 20) return { letter: "B-", pct: 50 };
  return { letter: "C", pct: 35 };
}

const CACHE_TTL = 3 * 60 * 60 * 1000; // 3 hours

/**
 * Fetches live GitHub stats. Languages are BYTE-ACCURATE (summed from each
 * repo's /languages endpoint, forks excluded) to match the GitHub profile.
 * Results are cached in localStorage so the extra requests run at most once
 * per 3 hours per browser. Falls back to `fallback` on any failure.
 */
export default function useGithubStats(username, fallback) {
  const [data, setData] = useState(fallback);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    if (!username || username.startsWith("YOUR_")) {
      setStatus("skipped");
      return;
    }

    const cacheKey = `gh-stats-${username}`;
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey) || "null");
      if (cached && Date.now() - cached.ts < CACHE_TTL) {
        setData(cached.data);
        setStatus("live");
        return;
      }
    } catch {
      /* ignore bad cache */
    }

    let cancelled = false;
    setStatus("loading");

    (async () => {
      try {
        const headers = { Accept: "application/vnd.github+json" };

        const userRes = await fetch(
          `https://api.github.com/users/${username}`,
          { headers }
        );
        if (!userRes.ok) throw new Error("user " + userRes.status);
        const user = await userRes.json();

        const reposRes = await fetch(
          `https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`,
          { headers }
        );
        const allRepos = reposRes.ok ? await reposRes.json() : [];
        const repos = allRepos.filter((r) => !r.fork); // exclude forks

        const stars = repos.reduce(
          (s, r) => s + (r.stargazers_count || 0),
          0
        );

        // Byte-accurate languages: sum bytes from each repo's /languages.
        const byteMap = {};
        await Promise.all(
          repos.map(async (r) => {
            try {
              const res = await fetch(r.languages_url, { headers });
              if (!res.ok) return;
              const langs = await res.json();
              for (const [name, bytes] of Object.entries(langs)) {
                byteMap[name] = (byteMap[name] || 0) + bytes;
              }
            } catch {
              /* skip this repo */
            }
          })
        );

        const totalBytes =
          Object.values(byteMap).reduce((a, b) => a + b, 0) || 1;
        const sorted = Object.entries(byteMap).sort((a, b) => b[1] - a[1]);
        const top = sorted.slice(0, 5);
        const languages = top.map(([name, bytes]) => ({
          name,
          pct: +((bytes / totalBytes) * 100).toFixed(1),
          color: langColor(name),
        }));
        const shownBytes = top.reduce((s, [, b]) => s + b, 0);
        const otherPct = +(
          ((totalBytes - shownBytes) / totalBytes) *
          100
        ).toFixed(1);
        if (otherPct >= 1)
          languages.push({ name: "Other", pct: otherPct, color: "#8B949E" });

        // PRs & issues via the search API (best-effort).
        let prs = fallback.prs;
        let issues = fallback.issues;
        try {
          const prRes = await fetch(
            `https://api.github.com/search/issues?q=author:${username}+type:pr&per_page=1`,
            { headers }
          );
          if (prRes.ok) prs = (await prRes.json()).total_count ?? prs;
          const isRes = await fetch(
            `https://api.github.com/search/issues?q=author:${username}+type:issue&per_page=1`,
            { headers }
          );
          if (isRes.ok) issues = (await isRes.json()).total_count ?? issues;
        } catch {
          /* keep fallbacks */
        }

        const result = {
          grade: computeGrade(stars, user.followers, user.public_repos),
          stars,
          repos: user.public_repos,
          followers: user.followers,
          prs,
          issues,
          languages: languages.length ? languages : fallback.languages,
          avatar: user.avatar_url,
          profileUrl: user.html_url,
        };

        try {
          localStorage.setItem(
            cacheKey,
            JSON.stringify({ ts: Date.now(), data: result })
          );
        } catch {
          /* storage full / disabled */
        }

        if (cancelled) return;
        setData(result);
        setStatus("live");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [username]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, status };
}
