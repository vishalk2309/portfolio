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

    // A previous mount (React StrictMode remounts effects in dev) can leave a
    // channel on this topic still tearing down. Drop any leftovers first, or
    // the new join can be dropped and `sync` never fires — leaving the badge
    // stuck with no live count.
    for (const c of supabase.getChannels()) {
      if (c.topic === CHANNEL || c.topic === `realtime:${CHANNEL}`) {
        supabase.removeChannel(c);
      }
    }

    const channel = supabase.channel(CHANNEL, {
      config: { presence: { key } },
    });

    const readPresence = () => {
      if (cancelled) return;
      // Never report fewer than 1 — this tab is itself a viewer, so a 0 here
      // means presence state hasn't propagated yet, not "nobody watching".
      const count = Object.keys(channel.presenceState()).length;
      setLive(Math.max(count, 1));
    };

    channel
      .on("presence", { event: "sync" }, readPresence)
      .on("presence", { event: "join" }, readPresence)
      .on("presence", { event: "leave" }, readPresence)
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ online_at: new Date().toISOString() });
          // Don't rely solely on `sync` firing — once our own track lands we
          // know the count is at least 1, so show the badge either way.
          readPresence();
        }
      });

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  return { live, total };
}
