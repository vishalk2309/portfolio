import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import BlogLayout from "./BlogLayout";
import { useBlogPost } from "../hooks/useBlogs";

export default function BlogPost() {
  const { slug } = useParams();
  const { post, status } = useBlogPost(slug);

  const stamp = post?.author_date || post?.created_at;
  const date = stamp
    ? new Date(stamp).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <BlogLayout>
      {status === "loading" && <p className="text-white/40">Loading…</p>}

      {(status === "notfound" || status === "error") && (
        <div className="py-16 text-center">
          <h1 className="font-serif text-3xl font-bold text-white">
            Post not found
          </h1>
          <p className="mt-3 text-white/50">
            This post may have been moved or unpublished.
          </p>
          <Link
            to="/blog"
            className="mt-6 inline-block text-sm text-neon-cyan hover:underline"
          >
            ← Back to all posts
          </Link>
        </div>
      )}

      {status === "ready" && post && (
        <article>
          {post.cover_image && (
            <img
              src={post.cover_image}
              alt=""
              className="mb-8 max-h-[380px] w-full rounded-3xl object-cover"
            />
          )}

          <div className="mb-3 flex flex-wrap gap-2">
            {(post.tags || []).map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-white/60"
              >
                {t}
              </span>
            ))}
          </div>

          <h1 className="font-serif text-4xl font-bold leading-tight text-white sm:text-5xl">
            {post.title}
          </h1>
          <p className="mt-3 text-sm text-white/40">
            {post.author_name ? `By ${post.author_name}` : ""}
            {post.author_name && date ? " · " : ""}
            {date}
          </p>

          <div className="mt-8 blog-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content || ""}
            </ReactMarkdown>
          </div>

          <div className="mt-12 border-t border-white/10 pt-6">
            <Link
              to="/blog"
              className="text-sm text-neon-cyan hover:underline"
            >
              ← Back to all posts
            </Link>
          </div>
        </article>
      )}
    </BlogLayout>
  );
}
