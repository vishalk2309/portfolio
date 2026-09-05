import { useParams, Link } from "react-router-dom";
import { FaLinkedin } from "react-icons/fa";
import { useEffect, useState } from "react";
import BlogLayout from "./BlogLayout";
import BlogContent from "../components/BlogContent";
import ShareButtons from "../components/ShareButtons";
import LikeButton from "../components/LikeButton";
import Comments from "../components/Comments";
import SubscribeBox from "../components/SubscribeBox";
import EnhancedNewsletter from "../components/EnhancedNewsletter";
import BlogPostStats from "../components/BlogPostStats";
import AdSense from "../components/AdSense";
import { useBlogPost } from "../hooks/useBlogs";
import { supabase } from "../lib/supabase";
import { useSEO } from "../hooks/useSEO";
import { useStructuredData } from "../hooks/useStructuredData";

export default function BlogPost() {
  const { slug } = useParams();
  const { post, status } = useBlogPost(slug);
  const [views, setViews] = useState(0);
  const [commentCount, setCommentCount] = useState(0);

  // Show the stored total right away, then count this visit at most once
  // per browser session so refreshing doesn't inflate it.
  useEffect(() => {
    if (!post?.id) return;
    setViews(post.views || 0);
    if (!supabase) return;

    const key = `viewed_${post.id}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      return; // private mode — don't count rather than count every load
    }

    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.rpc("bump_blog_views", {
        p_id: post.id,
      });
      if (!cancelled && !error && typeof data === "number") setViews(data);
    })();
    return () => {
      cancelled = true;
    };
  }, [post?.id, post?.views]);

  useSEO({
    title: post ? `${post.title} - Vishal Kushwaha's Blog` : "Blog Post - Vishal Kushwaha",
    description: post?.excerpt || post?.summary || "Read this article on web development and software engineering.",
    image: post?.cover_image,
  });

  // Add BlogPosting structured data for search engines
  useStructuredData(
    post && status === 'ready'
      ? {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.excerpt || post.summary || "",
          image: post.cover_image || 'https://vishalworks.co.in/og.png',
          datePublished: post.author_date || post.created_at,
          author: {
            '@type': 'Person',
            name: post.author_name || 'Vishal Kushwaha',
          },
          keywords: (post.tags || []).join(', '),
        }
      : null
  );

  const stamp = post?.author_date || post?.created_at;
  const date = stamp
    ? new Date(stamp).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const linkedin = post?.author_linkedin
    ? /^https?:\/\//i.test(post.author_linkedin)
      ? post.author_linkedin
      : `https://www.linkedin.com/in/${post.author_linkedin.replace(/^@/, "")}`
    : null;

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
              alt={post.title}
              className="mb-8 mx-auto block max-h-[400px] w-auto max-w-full rounded-3xl"
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
          <p className="mt-3 flex flex-wrap items-center gap-x-2 text-sm text-white/40">
            <span>
              {post.author_name ? `By ${post.author_name}` : ""}
              {post.author_name && date ? " · " : ""}
              {date}
            </span>
            {linkedin && (
              <a
                href={linkedin}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-neon-cyan hover:underline"
              >
                <FaLinkedin /> LinkedIn
              </a>
            )}
          </p>

          {/* Blog Post Stats */}
          <div className="mt-6">
            <BlogPostStats
              post={post}
              views={views}
              commentCount={commentCount}
            />
          </div>

          <BlogContent content={post.content || ""} className="mt-8" />

          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
            <LikeButton postId={post.id} initial={post.likes} />
            <ShareButtons
              url={typeof window !== "undefined" ? window.location.href : ""}
              title={post.title}
            />
          </div>

          {/* AdSense Ad — reuses the Blog Index unit ID. Swap for a dedicated
              "Blog Post" unit if you want separate reporting. */}
          <AdSense slot="7419295719" />

          <Comments blogId={post.id} onCountChange={setCommentCount} />

          <div className="mt-12">
            <EnhancedNewsletter />
          </div>

          <div className="mt-8">
            <Link to="/blog" className="text-sm text-neon-cyan hover:underline">
              ← Back to all posts
            </Link>
          </div>
        </article>
      )}
    </BlogLayout>
  );
}
