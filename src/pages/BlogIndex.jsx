import BlogLayout from "./BlogLayout";
import BlogCard from "../components/BlogCard";
import { useBlogs } from "../hooks/useBlogs";

export default function BlogIndex() {
  const { posts, status } = useBlogs();

  return (
    <BlogLayout>
      <h1 className="font-serif text-4xl font-bold text-white sm:text-5xl">
        Blog
      </h1>
      <p className="mb-10 mt-2 text-white/55">
        Thoughts, notes, and things I&rsquo;m building.
      </p>

      {status === "loading" && <p className="text-white/40">Loading…</p>}

      {status !== "loading" && posts.length === 0 && (
        <p className="text-white/40">No posts yet — check back soon.</p>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        {posts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
    </BlogLayout>
  );
}
