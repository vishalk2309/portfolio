import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const fmt = (d) =>
  d
    ? new Date(d).toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

/** Admin comment moderation: list all comments, hide/show, delete. */
export default function CommentsAdmin() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("blog_comments")
      .select("id,name,body,created_at,approved,blog_id,blogs(title,slug)")
      .order("created_at", { ascending: false });
    setComments(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (c) => {
    if (!window.confirm(`Delete this comment by ${c.name}? This can't be undone.`))
      return;
    await supabase.from("blog_comments").delete().eq("id", c.id);
    setComments((x) => x.filter((i) => i.id !== c.id));
  };

  const toggleApproved = async (c) => {
    await supabase
      .from("blog_comments")
      .update({ approved: !c.approved })
      .eq("id", c.id);
    setComments((x) =>
      x.map((i) => (i.id === c.id ? { ...i, approved: !i.approved } : i))
    );
  };

  return (
    <div className="glass rounded-3xl p-6 sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          <span className="gradient-text">Comments</span>
        </h2>
        <button
          onClick={load}
          className="rounded-xl px-4 py-2 text-sm text-white/60 hover:text-white"
        >
          ↻ Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-white/40">Loading…</p>
      ) : comments.length === 0 ? (
        <p className="text-white/40">No comments yet.</p>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div
              key={c.id}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
            >
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-semibold text-white">{c.name}</span>
                {!c.approved && (
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/50">
                    Hidden
                  </span>
                )}
                <span className="text-xs text-white/40">· {fmt(c.created_at)}</span>
              </div>
              <p className="mt-1 text-xs text-white/40">
                on{" "}
                {c.blogs?.slug ? (
                  <a
                    href={`/blog/${c.blogs.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-neon-cyan hover:underline"
                  >
                    {c.blogs.title || c.blogs.slug}
                  </a>
                ) : (
                  "(deleted post)"
                )}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-white/75">
                {c.body}
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => toggleApproved(c)}
                  className="rounded-lg px-3 py-1.5 text-xs text-white/60 hover:text-white"
                >
                  {c.approved ? "Hide" : "Show"}
                </button>
                <button
                  onClick={() => remove(c)}
                  className="rounded-lg px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
