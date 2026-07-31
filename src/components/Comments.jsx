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

  // top-level composer
  const [f, setF] = useState({ name: "", email: "", body: "", botcheck: false });
  const [status, setStatus] = useState("idle"); // idle | sending | error
  const [msg, setMsg] = useState("");

  // reply composer: which comment's form is open + where the reply attaches
  const [replyTo, setReplyTo] = useState(null); // { id, parentId } | null
  const [rf, setRf] = useState({ name: "", email: "", body: "" });
  const [rStatus, setRStatus] = useState("idle");

  useEffect(() => {
    if (!supabase || !blogId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("blog_comments")
        .select("id,name,body,created_at,parent_id")
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

  const post = async ({ name, email, body, parentId }) => {
    const { data, error } = await supabase.functions.invoke("submit-comment", {
      body: {
        blog_id: blogId,
        name,
        email: email || null,
        body,
        parent_id: parentId || null,
      },
    });
    if (error || !data?.success)
      throw new Error(data?.error || "Could not post comment.");
    setComments((c) => [...c, data.comment]);
  };

  const submitTop = async (e) => {
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
      await post({ name: f.name, email: f.email, body: f.body });
      setF({ name: "", email: "", body: "", botcheck: false });
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setMsg(err.message || "Could not post comment.");
    }
  };

  const submitReply = async (e) => {
    e.preventDefault();
    if (!rf.name.trim() || rf.body.trim().length < 2) {
      setRStatus("error");
      return;
    }
    setRStatus("sending");
    try {
      await post({
        name: rf.name,
        email: rf.email,
        body: rf.body,
        parentId: replyTo.parentId,
      });
      setRf({ name: "", email: "", body: "" });
      setReplyTo(null);
      setRStatus("idle");
    } catch {
      setRStatus("error");
    }
  };

  const toggleReply = (id, parentId) => {
    setReplyTo((r) => (r?.id === id ? null : { id, parentId }));
    setRf({ name: "", body: "" });
    setRStatus("idle");
  };

  const topLevel = comments.filter((c) => !c.parent_id);
  const repliesFor = (id) => comments.filter((c) => c.parent_id === id);

  const renderReplyForm = () => (
    <form onSubmit={submitReply} className="mt-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <input
          className={field}
          placeholder="Your name"
          value={rf.name}
          onChange={(e) => setRf((p) => ({ ...p, name: e.target.value }))}
        />
        <input
          className={field}
          type="email"
          placeholder="Email (optional — to hear about replies)"
          value={rf.email}
          onChange={(e) => setRf((p) => ({ ...p, email: e.target.value }))}
        />
      </div>
      <textarea
        className={`${field} mt-2 resize-none`}
        rows={2}
        placeholder="Write a reply…"
        value={rf.body}
        onChange={(e) => setRf((p) => ({ ...p, body: e.target.value }))}
      />
      <div className="mt-2 flex gap-2">
        <button
          type="submit"
          disabled={rStatus === "sending"}
          className="rounded-xl bg-gradient-btn px-4 py-2 text-sm font-semibold text-base disabled:opacity-60"
        >
          {rStatus === "sending" ? "Posting…" : "Reply"}
        </button>
        <button
          type="button"
          onClick={() => setReplyTo(null)}
          className="rounded-xl px-3 py-2 text-sm text-white/60 hover:text-white"
        >
          Cancel
        </button>
      </div>
      {rStatus === "error" && (
        <p className="mt-1 text-xs text-red-400">Couldn&rsquo;t post that reply.</p>
      )}
    </form>
  );

  const renderMeta = (c) => (
    <div className="flex items-center justify-between">
      <span className="font-semibold text-white">{c.name}</span>
      <span className="text-xs text-white/40">{fmt(c.created_at)}</span>
    </div>
  );

  return (
    <section className="mt-12 border-t border-white/10 pt-8">
      <h2 className="font-serif text-2xl font-bold text-white">
        Comments{comments.length ? ` (${comments.length})` : ""}
      </h2>

      <div className="mt-6 space-y-4">
        {loading ? (
          <p className="text-sm text-white/40">Loading…</p>
        ) : topLevel.length === 0 ? (
          <p className="text-sm text-white/40">
            No comments yet — be the first to comment.
          </p>
        ) : (
          topLevel.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
            >
              {renderMeta(c)}
              <p className="mt-2 whitespace-pre-wrap text-sm text-white/70">
                {c.body}
              </p>
              <button
                onClick={() => toggleReply(c.id, c.id)}
                className="mt-2 text-xs text-neon-cyan hover:underline"
              >
                Reply
              </button>
              {replyTo?.id === c.id && renderReplyForm()}

              {/* replies */}
              {repliesFor(c.id).length > 0 && (
                <div className="mt-3 space-y-3 border-l border-white/10 pl-4">
                  {repliesFor(c.id).map((r) => (
                    <div key={r.id}>
                      {renderMeta(r)}
                      <p className="mt-1 whitespace-pre-wrap text-sm text-white/70">
                        {r.body}
                      </p>
                      <button
                        onClick={() => toggleReply(r.id, c.id)}
                        className="mt-1 text-xs text-neon-cyan hover:underline"
                      >
                        Reply
                      </button>
                      {replyTo?.id === r.id && renderReplyForm()}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* new top-level comment */}
      <form onSubmit={submitTop} className="mt-8">
        <h3 className="mb-3 text-sm font-semibold text-white/70">
          Leave a comment
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            className={field}
            placeholder="Your name"
            value={f.name}
            onChange={(e) => setF((p) => ({ ...p, name: e.target.value }))}
            required
          />
          <input
            className={field}
            type="email"
            placeholder="Email (optional — to hear about replies)"
            value={f.email}
            onChange={(e) => setF((p) => ({ ...p, email: e.target.value }))}
          />
        </div>
        <textarea
          className={`${field} mt-3 resize-none`}
          rows={4}
          placeholder="Write a comment…"
          value={f.body}
          onChange={(e) => setF((p) => ({ ...p, body: e.target.value }))}
          required
        />
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
        {status === "error" && <p className="mt-2 text-sm text-red-400">{msg}</p>}
      </form>
    </section>
  );
}
