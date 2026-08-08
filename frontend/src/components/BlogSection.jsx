import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import SectionHeading from "./SectionHeading";
import BlogCard from "./BlogCard";
import { useBlogs } from "../hooks/useBlogs";

/** Home-page section showing the most recent posts, linking to /blog. */
export default function BlogSection() {
  const { posts, status } = useBlogs();

  // Nothing published yet (or Supabase unavailable) — hide the section.
  if (status !== "ready" || posts.length === 0) return null;

  const recent = posts.slice(0, 3);

  return (
    <section id="blog" className="relative px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow="Insights" title="Blogs" />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recent.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5 }}
            >
              <BlogCard post={post} />
            </motion.div>
          ))}
        </div>

        {posts.length > recent.length && (
          <div className="mt-10 text-center">
            <Link
              to="/blog"
              className="inline-block rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition-transform hover:scale-105"
            >
              View all posts →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
