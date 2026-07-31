import { Link } from "react-router-dom";

/** A single post preview card, used on the home section and the /blog index. */
export default function BlogCard({ post }) {
  const stamp = post.author_date || post.created_at;
  const date = stamp
    ? new Date(stamp).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  return (
    <Link
      to={`/blog/${post.slug}`}
      className="glass group flex flex-col overflow-hidden rounded-3xl transition-transform hover:-translate-y-1"
    >
      {post.cover_image && (
        <img
          src={post.cover_image}
          alt=""
          loading="lazy"
          className="h-44 w-full object-cover"
        />
      )}
      <div className="flex flex-1 flex-col p-6">
        {post.tags?.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-white/60"
              >
                {t}
              </span>
            ))}
          </div>
        )}
        <h3 className="text-lg font-bold text-white">{post.title}</h3>
        {post.excerpt && (
          <p className="mt-2 line-clamp-3 text-sm text-white/60">
            {post.excerpt}
          </p>
        )}
        <div className="mt-4 flex items-center justify-between pt-2 text-xs text-white/40">
          <span>
            {post.author_name ? `${post.author_name} · ` : ""}
            {date}
          </span>
          <span className="text-neon-cyan transition-all group-hover:underline">
            Read →
          </span>
        </div>
      </div>
    </Link>
  );
}
