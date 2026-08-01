// Supabase Edge Function: leetcode-stats
//
// Fetches a user's public LeetCode stats straight from LeetCode's GraphQL API
// (no flaky third-party proxy) and returns them in the flat shape the site's
// useLeetcodeStats hook already understands. Results are cached for 1 hour in
// the optional `leetcode_cache` table so repeat visits are instant and we
// never hammer LeetCode. The cache is best-effort: if the table doesn't exist,
// the function still works, it just fetches live every time.
//
// Deploy:
//   supabase functions deploy leetcode-stats --no-verify-jwt
//
// No secrets required. SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are injected
// automatically (used only for the optional cache).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "content-type": "application/json" },
  });

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

const QUERY = `
query userProfile($username: String!) {
  allQuestionsCount { difficulty count }
  matchedUser(username: $username) {
    profile { ranking reputation }
    contributions { points }
    submitStatsGlobal { acSubmissionNum { difficulty count } }
  }
}`;

type Bucket = { difficulty: string; count: number };
const pick = (arr: Bucket[] | undefined, diff: string) =>
  arr?.find((x) => x.difficulty === diff)?.count ?? 0;

// GraphQL response -> the flat shape useLeetcodeStats.normalize() expects.
// deno-lint-ignore no-explicit-any
function shape(gql: any) {
  const m = gql?.data?.matchedUser;
  if (!m) return null; // user not found / private
  const all = gql.data.allQuestionsCount as Bucket[];
  const ac = m.submitStatsGlobal?.acSubmissionNum as Bucket[];
  return {
    totalSolved: pick(ac, "All"),
    totalQuestions: pick(all, "All"),
    ranking: m.profile?.ranking ?? 0,
    reputation: m.profile?.reputation ?? 0,
    contributionPoint: m.contributions?.points ?? 0,
    easySolved: pick(ac, "Easy"),
    totalEasy: pick(all, "Easy"),
    mediumSolved: pick(ac, "Medium"),
    totalMedium: pick(all, "Medium"),
    hardSolved: pick(ac, "Hard"),
    totalHard: pick(all, "Hard"),
  };
}

async function fetchLeetcode(username: string) {
  const r = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      referer: `https://leetcode.com/${username}/`,
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
    },
    body: JSON.stringify({ query: QUERY, variables: { username } }),
  });
  if (!r.ok) throw new Error(`leetcode ${r.status}`);
  return shape(await r.json());
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  // Accept username from POST body or ?username= query param.
  let username = "";
  if (req.method === "POST") {
    try {
      username = String((await req.json())?.username || "").trim();
    } catch {
      /* ignore */
    }
  } else {
    username = new URL(req.url).searchParams.get("username")?.trim() || "";
  }
  if (!username)
    return json({ error: "Missing username" }, 400);

  // Optional cache (best-effort — works fine without the table).
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = url && key ? createClient(url, key) : null;

  if (supabase) {
    const { data: cached } = await supabase
      .from("leetcode_cache")
      .select("data, updated_at")
      .eq("username", username)
      .maybeSingle();
    if (cached?.updated_at) {
      const fresh = Date.now() - new Date(cached.updated_at).getTime() < CACHE_TTL_MS;
      if (fresh && cached.data) return json(cached.data);
    }

    try {
      const stats = await fetchLeetcode(username);
      if (!stats) return json({ error: "User not found" }, 404);
      await supabase.from("leetcode_cache").upsert({
        username,
        data: stats,
        updated_at: new Date().toISOString(),
      });
      return json(stats);
    } catch (e) {
      // Live fetch failed — serve stale cache if we have any.
      if (cached?.data) return json(cached.data);
      return json({ error: String((e as Error).message || e) }, 502);
    }
  }

  // No cache available — straight passthrough.
  try {
    const stats = await fetchLeetcode(username);
    if (!stats) return json({ error: "User not found" }, 404);
    return json(stats);
  } catch (e) {
    return json({ error: String((e as Error).message || e) }, 502);
  }
});
