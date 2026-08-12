import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import BlogLayout from "./BlogLayout";
import BlogCard from "../components/BlogCard";
import SubscribeBox from "../components/SubscribeBox";
import { useBlogs } from "../hooks/useBlogs";

const STORAGE_KEY = "blogViewMode";

export default function BlogIndex() {
  const { posts, status } = useBlogs();
  const [viewMode, setViewMode] = useState("grid");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setViewMode(saved);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, viewMode);
    }
  }, [viewMode, isLoaded]);

  return (
    <BlogLayout>
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl font-bold text-white sm:text-5xl">
            Blogs & Insights
          </h1>
          <p className="mt-2 text-white/55">
            Thoughts, notes, and things I&rsquo;m building.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2 rounded-full bg-white/5 border border-white/10 p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`rounded-full px-3 py-2 text-sm font-medium transition-all ${
                viewMode === "grid"
                  ? "bg-white text-[rgb(var(--c-base))]"
                  : "text-white/60 hover:text-white"
              }`}
              title="Grid view"
            >
              ⊞ Grid
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`rounded-full px-3 py-2 text-sm font-medium transition-all ${
                viewMode === "list"
                  ? "bg-white text-[rgb(var(--c-base))]"
                  : "text-white/60 hover:text-white"
              }`}
              title="List view"
            >
              ☰ List
            </button>
          </div>
          <Link
            to="/blog/write"
            className="inline-block rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[rgb(var(--c-base))] transition-transform hover:scale-105"
          >
            ✍️ Write a post
          </Link>
        </div>
      </div>

      {status === "loading" && <p className="text-white/40">Loading…</p>}

      {status !== "loading" && posts.length === 0 && (
        <p className="text-white/40">No posts yet — check back soon.</p>
      )}

      {viewMode === "grid" && (
        <div className="grid gap-6 sm:grid-cols-2">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {viewMode === "list" && (
        <div className="space-y-4">
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              className="glass group flex gap-4 rounded-2xl p-4 transition-all hover:-translate-y-0.5"
            >
              {post.cover_image && (
                <img
                  src={post.cover_image}
                  alt=""
                  loading="lazy"
                  className="hidden sm:block w-24 h-24 object-cover rounded-xl flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white line-clamp-1">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="mt-1 line-clamp-2 text-sm text-white/60">
                        {post.excerpt
                          .replace(/&nbsp;/gi, " ")
                          .replace(/&amp;/gi, "&")
                          .replace(/&[a-z0-9#]+;/gi, " ")}
                      </p>
                    )}
                  </div>
                  <span className="text-neon-cyan transition-all group-hover:underline whitespace-nowrap flex-shrink-0">
                    Read →
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-white/40">
                  <div className="flex flex-wrap gap-2">
                    {post.tags?.slice(0, 2).map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    {post.author_name && (
                      <span>{post.author_name}</span>
                    )}
                    <span>
                      {new Date(post.author_date || post.created_at).toLocaleDateString(
                        undefined,
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-12">
        <SubscribeBox />
      </div>
    </BlogLayout>
  );
}
