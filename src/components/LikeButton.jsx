import { useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { supabase } from "../lib/supabase";

const key = (id) => `blog-liked:${id}`;
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Like button — the visitor must give a name + email, so a person can like a
 * post only once (enforced per-email in the like_blog RPC).
 */
export default function LikeButton({ postId, initial = 0 }) {
  const [count, setCount] = useState(initial || 0);
  const [liked, setLiked] = useState(() => {
    try {
      return !!localStorage.getItem(key(postId));
    } catch {
      return false;
    }
  });
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !emailRe.test(email)) {
      setMsg("Enter your name and a valid email.");
      return;
    }
    if (!supabase) return;
    setBusy(true);
    setMsg("");
    try {
      const { data, error } = await supabase.rpc("like_blog", {
        p_blog_id: postId,
        p_name: name,
        p_email: email,
      });
      if (error) throw new Error("Could not register your like.");
      const row = Array.isArray(data) ? data[0] : data;
      if (row?.likes != null) setCount(Number(row.likes));
      setLiked(true);
      try {
        localStorage.setItem(key(postId), email.trim().toLowerCase());
      } catch {
        /* ignore */
      }
      setOpen(false);
    } catch (err) {
      setMsg(err.message || "Could not register your like.");
    } finally {
      setBusy(false);
    }
  };

  const unlike = async () => {
    if (!supabase || busy) return;
    let em = null;
    try {
      em = localStorage.getItem(key(postId));
    } catch {
      /* ignore */
    }
    if (!em) {
      setLiked(false);
      return;
    }
    setBusy(true);
    try {
      const { data, error } = await supabase.rpc("unlike_blog", {
        p_blog_id: postId,
        p_email: em,
      });
      if (!error && data != null) setCount(Number(data));
      else setCount((c) => Math.max(0, c - 1));
      setLiked(false);
      try {
        localStorage.removeItem(key(postId));
      } catch {
        /* ignore */
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => (liked ? unlike() : setOpen((o) => !o))}
        disabled={busy}
        aria-pressed={liked}
        aria-label={liked ? "Unlike this post" : "Like this post"}
        title={liked ? "Click to unlike" : "Like this post"}
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all hover:scale-105 ${
          liked
            ? "border-rose-400/40 bg-rose-500/10 text-rose-400"
            : "border-white/15 bg-white/5 text-white/70 hover:text-white"
        }`}
      >
        {liked ? <FaHeart /> : <FaRegHeart />}
        <span>{count}</span>
      </button>

      {open && !liked && (
        <form
          onSubmit={submit}
          className="glass absolute left-0 top-full z-20 mt-2 w-64 rounded-2xl p-4 text-left"
        >
          <p className="mb-2 text-xs text-white/60">
            Like this post — tell us who you are:
          </p>
          <input
            className="mb-2 w-full rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-neon-purple"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="mb-2 w-full rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-neon-purple"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={busy}
              className="flex-1 rounded-lg bg-gradient-btn py-2 text-sm font-semibold text-base disabled:opacity-60"
            >
              {busy ? "…" : "Like"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-sm text-white/60 hover:text-white"
            >
              Cancel
            </button>
          </div>
          {msg && <p className="mt-2 text-xs text-red-400">{msg}</p>}
        </form>
      )}
    </div>
  );
}
