import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function BlogLikesAdmin() {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likesLoading, setLikesLoading] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("blogs")
      .select("id, title, slug, likes, published")
      .order("created_at", { ascending: false });
    setPosts(data || []);
    setLoading(false);
  };

  const loadLikes = async (postId) => {
    setLikesLoading(true);
    const { data } = await supabase
      .from("blog_likes")
      .select("id, name, email, created_at")
      .eq("blog_id", postId)
      .order("created_at", { ascending: false });
    setLikes(data || []);
    setLikesLoading(false);
  };

  const handlePostClick = (post) => {
    setSelectedPost(post);
    loadLikes(post.id);
  };

  if (selectedPost) {
    return (
      <div className="glass rounded-3xl p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              <span className="gradient-text">Likes for "{selectedPost.title}"</span>
            </h2>
            <p className="mt-1 text-sm text-white/60">
              Total: <span className="font-semibold text-white">{selectedPost.likes}</span> likes
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedPost(null);
              setLikes([]);
            }}
            className="rounded-xl px-4 py-2 text-sm text-white/60 hover:text-white"
          >
            ← Back
          </button>
        </div>

        {likesLoading ? (
          <p className="text-white/40">Loading likes…</p>
        ) : likes.length === 0 ? (
          <p className="text-white/40">No likes yet.</p>
        ) : (
          <div className="space-y-2">
            {likes.map((like) => {
              const date = new Date(like.created_at).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <div
                  key={like.id}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
                >
                  <div>
                    <p className="font-semibold text-white">{like.name}</p>
                    <p className="text-xs text-white/50">{like.email}</p>
                  </div>
                  <p className="text-xs text-white/40">{date}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="glass rounded-3xl p-6 sm:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">
          <span className="gradient-text">Blog Likes Analytics</span>
        </h2>
        <p className="mt-1 text-sm text-white/60">See who liked each blog post</p>
      </div>

      {loading ? (
        <p className="text-white/40">Loading…</p>
      ) : posts.length === 0 ? (
        <p className="text-white/40">No blog posts yet.</p>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <button
              key={post.id}
              onClick={() => handlePostClick(post)}
              className="w-full text-left"
            >
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 transition-all hover:bg-white/[0.06]">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-semibold text-white">
                      {post.title}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] ${
                        post.published
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-white/10 text-white/50"
                      }`}
                    >
                      {post.published ? "Published" : "Draft"}
                    </span>
                  </div>
                  <div className="truncate text-xs text-white/40">/{post.slug}</div>
                </div>
                <div className="ml-4 flex items-center gap-2 text-right">
                  <span className="text-sm font-semibold text-rose-400">
                    ❤️ {post.likes}
                  </span>
                  <span className="text-white/40">→</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
