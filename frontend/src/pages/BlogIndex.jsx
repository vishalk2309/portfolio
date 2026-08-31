import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import BlogLayout from "./BlogLayout";
import BlogCard from "../components/BlogCard";
import SubscribeBox from "../components/SubscribeBox";
import AdSense from "../components/AdSense";
import { useBlogs } from "../hooks/useBlogs";
import { useSEO } from "../hooks/useSEO";
import { useStructuredData } from "../hooks/useStructuredData";
import { FiSearch } from "react-icons/fi";

const STORAGE_KEY = "blogViewMode";

export default function BlogIndex() {
  const { posts, status } = useBlogs();
  const [viewMode, setViewMode] = useState("grid");
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);

  useSEO({
    title: "Blogs & Insights - Vishal Kushwaha",
    description: "Read articles about web development, full-stack engineering, coding practices, and tech insights. Thoughts and notes from a software developer.",
  });

  // Add CollectionPage structured data for the blog index
  useStructuredData(
    status === 'ready' && posts.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Blogs & Insights',
          description: 'A collection of articles about web development and software engineering',
          url: 'https://vishalworks.co.in/blog',
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: posts.slice(0, 10).map((post, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              item: {
                '@type': 'BlogPosting',
                headline: post.title,
                url: `https://www.vishalworks.co.in/blog/${post.slug}`,
                image: post.cover_image,
                description: post.excerpt || "",
                datePublished: post.author_date || post.created_at,
              },
            })),
          },
        }
      : null
  );

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

  const allTags = Array.from(
    new Set(posts.flatMap((post) => post.tags || []))
  ).sort();

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      searchTerm === "" ||
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.excerpt?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.some((tag) => post.tags?.includes(tag));

    return matchesSearch && matchesTags;
  });

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

      {status !== "loading" && posts.length > 0 && (
        <>
          <div className="mb-8 space-y-4">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-neon-cyan/50"
              />
            </div>

            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-white/60 self-center">Filter:</span>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() =>
                      setSelectedTags((prev) =>
                        prev.includes(tag)
                          ? prev.filter((t) => t !== tag)
                          : [...prev, tag]
                      )
                    }
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                      selectedTags.includes(tag)
                        ? "bg-neon-cyan text-[rgb(var(--c-base))]"
                        : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
                {selectedTags.length > 0 && (
                  <button
                    onClick={() => setSelectedTags([])}
                    className="rounded-full px-3 py-1 text-xs text-white/40 hover:text-white transition-all"
                  >
                    Clear all
                  </button>
                )}
              </div>
            )}
          </div>

          {filteredPosts.length === 0 && (
            <p className="text-white/40 py-8">
              No posts match your search. Try different keywords or filters.
            </p>
          )}
        </>
      )}

      {viewMode === "grid" && (
        <div className="grid gap-6 sm:grid-cols-2">
          {filteredPosts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {viewMode === "list" && (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              className="glass group flex gap-4 rounded-2xl p-4 transition-all hover:-translate-y-0.5"
            >
              {post.cover_image && (
                <img
                  src={post.cover_image}
                  alt={post.title}
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

      {/* AdSense Ad */}
      <AdSense slot="7419295719" />

      <div className="mt-12">
        <SubscribeBox />
      </div>
    </BlogLayout>
  );
}
