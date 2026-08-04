import { Link } from "react-router-dom";
import BlogLayout from "./BlogLayout";
import BlogCard from "../components/BlogCard";
import SubscribeBox from "../components/SubscribeBox";
import { useBlogs } from "../hooks/useBlogs";

export default function BlogIndex() {
  const { posts, status } = useBlogs();

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
        <Link
          to="/blog/write"
          className="inline-block rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[rgb(var(--c-base))] transition-transform hover:scale-105"
        >
          ✍️ Write a post
        </Link>
      </div>

      {status === "loading" && <p className="text-white/40">Loading…</p>}

      {status !== "loading" && posts.length === 0 && (
        <p className="text-white/40">No posts yet — check back soon.</p>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        {posts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>

      <div className="mt-12">
        <SubscribeBox />
      </div>
    </BlogLayout>
  );
}
