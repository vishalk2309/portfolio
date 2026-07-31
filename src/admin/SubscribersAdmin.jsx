import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const fmt = (d) =>
  d
    ? new Date(d).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

/** Admin view of blog newsletter subscribers: count, list, copy, remove. */
export default function SubscribersAdmin() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("blog_subscribers")
      .select("id,email,created_at")
      .order("created_at", { ascending: false });
    setSubs(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (s) => {
    if (!window.confirm(`Remove ${s.email} from subscribers?`)) return;
    await supabase.from("blog_subscribers").delete().eq("id", s.id);
    setSubs((x) => x.filter((i) => i.id !== s.id));
  };

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(subs.map((s) => s.email).join(", "));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="glass rounded-3xl p-6 sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          <span className="gradient-text">Subscribers</span>
          {!loading && (
            <span className="ml-2 text-sm font-normal text-white/40">
              {subs.length}
            </span>
          )}
        </h2>
        <div className="flex items-center gap-2">
          {subs.length > 0 && (
            <button
              onClick={copyAll}
              className="rounded-xl bg-white/10 px-3 py-2 text-xs text-white hover:bg-white/20"
            >
              {copied ? "Copied!" : "Copy all emails"}
            </button>
          )}
          <button
            onClick={load}
            className="rounded-xl px-3 py-2 text-sm text-white/60 hover:text-white"
          >
            ↻
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-white/40">Loading…</p>
      ) : subs.length === 0 ? (
        <p className="text-white/40">No subscribers yet.</p>
      ) : (
        <div className="space-y-2">
          {subs.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
            >
              <span className="min-w-0 flex-1 truncate text-white">{s.email}</span>
              <span className="text-xs text-white/40">{fmt(s.created_at)}</span>
              <button
                onClick={() => remove(s)}
                className="rounded-lg px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
