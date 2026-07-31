import { useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { supabase } from "../lib/supabase";

const key = (id) => `blog-liked:${id}`;

/** Heart button — one like per visitor (remembered in localStorage). */
export default function LikeButton({ postId, initial = 0 }) {
  const [count, setCount] = useState(initial || 0);
  const [liked, setLiked] = useState(() => {
    try {
      return localStorage.getItem(key(postId)) === "1";
    } catch {
      return false;
    }
  });
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    if (!supabase || busy) return;
    const delta = liked ? -1 : 1;
    setBusy(true);
    // optimistic
    setCount((c) => Math.max(0, c + delta));
    const next = !liked;
    setLiked(next);
    try {
      localStorage.setItem(key(postId), next ? "1" : "0");
    } catch {
      /* ignore */
    }
    const { data, error } = await supabase.rpc("bump_blog_likes", {
      p_id: postId,
      p_delta: delta,
    });
    if (!error && (typeof data === "number" || typeof data === "string"))
      setCount(Number(data));
    setBusy(false);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={liked}
      aria-label={liked ? "Unlike this post" : "Like this post"}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all hover:scale-105 ${
        liked
          ? "border-rose-400/40 bg-rose-500/10 text-rose-400"
          : "border-white/15 bg-white/5 text-white/70 hover:text-white"
      }`}
    >
      {liked ? <FaHeart /> : <FaRegHeart />}
      <span>{count}</span>
    </button>
  );
}
