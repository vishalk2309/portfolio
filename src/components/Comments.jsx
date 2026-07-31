import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const field =
  "w-full rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-3 text-white placeholder-white/40 outline-none transition-all duration-300 focus:border-neon-purple";

const fmt = (d) =>
  d
    ? new Date(d).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

export default function Comments({ blogId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [f, setF] = useState({ name: "", body: "", botcheck: false });
  const [status, setStatus] = useState("idle"); // idle | sending | error
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!supabase || !blogId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("blog_comments")
        .select("id,name,body,created_at")
        .eq("blog_id", blogId)
        .eq("approved", true)
        .order("created_at", { ascending: true });
      if (!cancelled) {
        setComments(data || []);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [blogId]);

  const submit = async (e) => {
    e.preventDefault();
    if (!f.name.trim() || f.body.trim().length < 2) {
      setStatus("error");
      setMsg("Add your name and a comment.");
      return;
    }
    setStatus("sending");
    setMsg("");
    try {
      if (!supabase) throw new Error("Service not configured.");
      const { data, error } = await supabase.functions.invoke("submit-comment", {
        body: { blog_id: blogId, name: f.name, body: f.body, botcheck: f.botcheck },
      });
      if (error || !data?.success)
        throw new Error(data?.error || "Could not post comment.");
      setComments((c) => [...c, data.comment]);
      setF({ name: "", body: "", botcheck: false });
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setMsg(err.message || "Could not post comment.");
    }
  };

  return (
    <section className="mt-12 border-t border-white/10 pt-8">
      <h2 className="font-serif text-2xl font-bold text-white">
        Comments{comments.length ? ` (${comments.length})` : ""}
      </h2>

      {/* Existing comments */}
      <div className="mt-6 space-y-4">
        {loading ? (
          <p className="text-sm text-white/40">Loading…</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-white/40">
            No comments yet — be the first to comment.
          </p>
        ) : (
          comments.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">{c.name}</span>
                <span className="text-xs text-white/40">{fmt(c.created_at)}</span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-white/70">
                {c.body}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Add a comment */}
      <form onSubmit={submit} className="mt-8">
        <h3 className="mb-3 text-sm font-semibold text-white/70">
          Leave a comment
        </h3>
        <input
          className={field}
          placeholder="Your name"
          value={f.name}
          onChange={(e) => setF((p) => ({ ...p, name: e.target.value }))}
          required
        />
        <textarea
          className={`${field} mt-3 resize-none`}
          rows={4}
          placeholder="Write a comment…"
          value={f.body}
          onChange={(e) => setF((p) => ({ ...p, body: e.target.value }))}
          required
        />
        {/* honeypot */}
        <input
          type="checkbox"
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
          aria-hidden="true"
          checked={f.botcheck}
          onChange={(e) => setF((p) => ({ ...p, botcheck: e.target.checked }))}
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="mt-3 rounded-2xl bg-gradient-btn px-6 py-3 font-semibold text-base transition-all duration-300 hover:scale-[1.02] disabled:opacity-60"
        >
          {status === "sending" ? "Posting…" : "Post comment"}
        </button>
        {status === "error" && (
          <p className="mt-2 text-sm text-red-400">{msg}</p>
        )}
      </form>
    </section>
  );
}
