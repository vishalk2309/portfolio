import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

/**
 * Dashboard screen for request-only resources: read who asked for what and why,
 * then approve or decline. The decision goes through the decide-access Edge
 * Function (which also emails the requester) rather than a direct table update,
 * so access_requests needs no UPDATE policy for anyone.
 */

const FILTERS = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "declined", label: "Declined" },
  { key: "all", label: "All" },
];

export default function AccessRequestsAdmin() {
  const [filter, setFilter] = useState("pending");
  const [rows, setRows] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [notes, setNotes] = useState({}); // request id → message to send
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    let q = supabase
      .from("access_requests")
      .select(
        "id, resource_id, user_id, email, name, reason, status, note, created_at, decided_at, resources(title, category)"
      )
      .order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter);

    const { data, error } = await q;
    if (error) setErr(error.message);
    setRows(data || []);

    // Tab badges — a separate lightweight read so the counts stay right
    // regardless of which filter is showing.
    const { data: all } = await supabase.from("access_requests").select("status");
    const c = {};
    for (const r of all || []) c[r.status] = (c[r.status] || 0) + 1;
    c.all = (all || []).length;
    setCounts(c);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const decide = async (row, decision) => {
    if (busyId) return;
    if (
      decision === "declined" &&
      !window.confirm(`Decline ${row.email || "this request"}?`)
    )
      return;
    setBusyId(row.id);
    setErr("");
    setMsg("");
    try {
      const { data, error } = await supabase.functions.invoke("decide-access", {
        body: {
          requestId: row.id,
          decision,
          note: (notes[row.id] || "").trim(),
        },
      });
      if (error || !data?.success) {
        let m = data?.error;
        if (!m && error?.context?.json) {
          try {
            m = (await error.context.json())?.error;
          } catch {
            /* ignore */
          }
        }
        throw new Error(m || "Could not save the decision.");
      }
      setMsg(
        data.emailed
          ? `Marked ${decision} — the requester has been emailed.`
          : `Marked ${decision}. (No email went out — check the Brevo secrets.)`
      );
      setNotes((n) => ({ ...n, [row.id]: "" }));
      await load();
    } catch (e) {
      setErr(e.message || "Something went wrong.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold">
          <span className="gradient-text">Access Requests</span>
        </h2>
        <button
          onClick={load}
          className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white/70 hover:text-white"
        >
          ↻ Refresh
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
              filter === f.key
                ? "bg-white/10 text-white"
                : "text-white/50 hover:text-white"
            }`}
          >
            {f.label}
            {counts[f.key] ? (
              <span className="ml-1.5 text-xs text-white/40">
                {counts[f.key]}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {msg && (
        <p className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-300">
          {msg}
        </p>
      )}
      {err && (
        <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
          {err}
        </p>
      )}

      {loading && <p className="text-white/40">Loading…</p>}

      {!loading && rows.length === 0 && (
        <p className="text-white/40">
          {filter === "pending"
            ? "No requests waiting on you. 🎉"
            : "Nothing here."}
        </p>
      )}

      <div className="grid gap-3">
        {rows.map((row) => (
          <div
            key={row.id}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-white">
                  {row.resources?.title || `Resource #${row.resource_id}`}
                </p>
                <p className="text-sm text-white/50">
                  {row.name ? `${row.name} · ` : ""}
                  {row.email || "unknown email"}
                </p>
              </div>
              <StatusPill status={row.status} />
            </div>

            {row.reason && (
              <p className="mt-3 whitespace-pre-wrap rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70">
                {row.reason}
              </p>
            )}

            <p className="mt-2 text-xs text-white/35">
              Asked{" "}
              {row.created_at ? new Date(row.created_at).toLocaleString() : "—"}
              {row.decided_at &&
                ` · decided ${new Date(row.decided_at).toLocaleString()}`}
            </p>

            {row.status === "pending" ? (
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input
                  value={notes[row.id] || ""}
                  onChange={(e) =>
                    setNotes((n) => ({ ...n, [row.id]: e.target.value }))
                  }
                  placeholder="Optional message to include in the email…"
                  className="min-w-0 flex-1 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-neon-cyan/50"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => decide(row, "approved")}
                    disabled={busyId === row.id}
                    className="rounded-xl bg-gradient-btn px-4 py-2 text-sm font-semibold text-base disabled:opacity-60"
                  >
                    {busyId === row.id ? "Saving…" : "Approve"}
                  </button>
                  <button
                    onClick={() => decide(row, "declined")}
                    disabled={busyId === row.id}
                    className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/20 disabled:opacity-60"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-3 flex flex-wrap items-center gap-3">
                {row.note && (
                  <p className="text-sm italic text-white/45">“{row.note}”</p>
                )}
                {/* Lets you reverse a decision — approve someone you declined,
                    or revoke access you'd granted. */}
                <button
                  onClick={() =>
                    decide(
                      row,
                      row.status === "approved" ? "declined" : "approved"
                    )
                  }
                  disabled={busyId === row.id}
                  className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white/70 hover:text-white disabled:opacity-60"
                >
                  {busyId === row.id
                    ? "Saving…"
                    : row.status === "approved"
                    ? "Revoke access"
                    : "Approve instead"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const styles = {
    pending: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    approved: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    declined: "border-red-400/30 bg-red-400/10 text-red-300",
  };
  return (
    <span
      className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${
        styles[status] || "border-white/15 bg-white/5 text-white/60"
      }`}
    >
      {status}
    </span>
  );
}
