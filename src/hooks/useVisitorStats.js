import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

// One shared presence channel name for the whole site.
const CHANNEL = "portfolio-presence";
// sessionStorage flag so a refresh in the same tab isn't counted twice.
const VISIT_FLAG = "portfolio_visit_counted";

/**
 * Live visitor stats:
 *   - `live`  : how many people are viewing the site right now (Realtime Presence)
 *   - `total` : cumulative visit count (Postgres counter via RPC)
 *
 * If Supabase isn't configured, both stay null and the UI hides itself —
 * the site never breaks.
 */
export default function useVisitorStats() {
  const [live, setLive] = useState(null);
  const [total, setTotal] = useState(null);

  useEffect(() => {
    if (!supabase) return;

    // ---- Total visits: count once per session, otherwise just read it ----
    let cancelled = false;
    (async () => {
      try {
        const counted = sessionStorage.getItem(VISIT_FLAG);
        if (!counted) {
          const { data, error } = await supabase.rpc("increment_visits");
          if (!error && !cancelled) {
            sessionStorage.setItem(VISIT_FLAG, "1");
            setTotal(data);
            return;
          }
        }
        // Already counted this session (or increment failed) → just read.
        const { data } = await supabase
          .from("site_stats")
          .select("total_visits")
          .eq("id", 1)
          .single();
        if (!cancelled && data) setTotal(data.total_visits);
      } catch {
        /* stay null → UI hides the visits number */
      }
    })();

    // ---- Live viewers: Realtime Presence ----
    // Each open tab gets a unique presence key; the count is how many are tracked.
    const key =
      (crypto.randomUUID && crypto.randomUUID()) ||
      `${Date.now()}-${Math.random()}`;

    const channel = supabase.channel(CHANNEL, {
      config: { presence: { key } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        setLive(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  return { live, total };
}
