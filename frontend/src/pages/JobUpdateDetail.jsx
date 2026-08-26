import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowLeft, FiBriefcase, FiCalendar } from "react-icons/fi";
import Background from "../components/Background";
import Footer from "../components/Footer";
import { supabase } from "../lib/supabase";
import { useSEO } from "../hooks/useSEO";
import { useStructuredData } from "../hooks/useStructuredData";

export default function JobUpdateDetail() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [update, setUpdate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useSEO({
    title: `${update?.title || "Job Update"} - Vishal Kushwaha`,
    description: update?.description || "A career update from Vishal Kushwaha",
    image: update?.cover_image,
    canonical: update ? `https://www.vishalworks.co.in/job/${update.slug}` : undefined,
  });

  // Add structured data for the job update
  useStructuredData(
    update
      ? {
          '@context': 'https://schema.org',
          '@type': 'NewsArticle',
          headline: update.title,
          description: update.description || update.title,
          url: `https://www.vishalworks.co.in/job/${update.slug}`,
          datePublished: update.created_at,
          dateModified: update.updated_at,
          author: {
            '@type': 'Person',
            name: 'Vishal Kushwaha',
            url: 'https://www.vishalworks.co.in',
          },
          publisher: {
            '@type': 'Organization',
            name: 'Vishal Kushwaha',
            url: 'https://www.vishalworks.co.in',
          },
          ...(update.cover_image && {
            image: {
              '@type': 'ImageObject',
              url: update.cover_image,
            },
          }),
          keywords: update.tags?.join(', ') || '',
        }
      : null
  );

  useEffect(() => {
    if (!slug || !supabase) {
      setError("Invalid update");
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const { data, error: err } = await supabase
          .from("job_updates")
          .select("*")
          .eq("slug", slug)
          .eq("published", true)
          .single();

        if (err) {
          setError("Update not found");
          setUpdate(null);
        } else {
          setUpdate(data);
          setError(null);
        }
      } catch {
        setError("Failed to load update");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [slug]);

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/jobs");
  };

  const startDate = update?.start_date
    ? new Date(update.start_date).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="relative min-h-screen">
      <Background />

      <header className="fixed inset-x-0 top-0 z-50">
        <nav className="glass mx-auto flex max-w-6xl items-center justify-between rounded-b-2xl px-6 py-4">
          <button
            onClick={goBack}
            className="flex items-center gap-1 text-sm text-white/70 transition-colors hover:text-white"
          >
            <FiArrowLeft size={16} /> Back
          </button>
          <span className="text-lg font-bold">
            <span className="gradient-text">Career</span>
          </span>
          <div className="w-16" />
        </nav>
      </header>

      <main className="relative z-10 mx-auto max-w-3xl px-6 pb-24 pt-32">
        {loading && <p className="text-white/40">Loading…</p>}

        {error && !loading && (
          <div className="text-center">
            <p className="text-white/40 mb-4">{error}</p>
            <button
              onClick={() => navigate("/jobs")}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              ← View all updates
            </button>
          </div>
        )}

        {update && (
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {update.cover_image && (
              <img
                src={update.cover_image}
                alt={update.title}
                className="mb-8 h-96 w-full rounded-3xl border border-white/10 object-cover"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            )}

            <div className="mb-8">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  {update.company && (
                    <p className="text-sm font-semibold text-neon-cyan">
                      {update.company}
                    </p>
                  )}
                  {update.position && (
                    <p className="text-lg font-bold text-white">{update.position}</p>
                  )}
                </div>
                <FiBriefcase className="shrink-0 text-white/40" size={24} />
              </div>

              <h1 className="text-4xl font-bold text-white mb-4">{update.title}</h1>

              {update.description && (
                <p className="text-lg leading-relaxed text-white/70 mb-4">
                  {update.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-white/50">
                {startDate && (
                  <div className="flex items-center gap-2">
                    <FiCalendar size={16} />
                    Started: {startDate}
                  </div>
                )}
                {update.tags && update.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {update.tags.map((tag, i) => (
                      <span key={i} className="text-white/60">
                        {i > 0 ? "•" : ""} {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {update.tags && update.tags.length > 0 && (
              <div className="mb-8 flex flex-wrap gap-2">
                {update.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-sm font-medium text-white/70"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {update.content && (
              <div className="prose prose-invert max-w-none">
                <div
                  className="space-y-4 text-white/70 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: update.content }}
                />
              </div>
            )}

            <div className="mt-12 border-t border-white/10 pt-8 text-center">
              <button
                onClick={() => navigate("/jobs")}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                ← View all updates
              </button>
            </div>
          </motion.article>
        )}
      </main>

      <Footer />
    </div>
  );
}
