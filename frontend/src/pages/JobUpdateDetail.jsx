import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowLeft, FiBriefcase, FiCalendar, FiMapPin, FiTag, FiAward, FiExternalLink } from "react-icons/fi";
import Background from "../components/Background";
import Footer from "../components/Footer";
import JobSubscribePopup from "../components/JobSubscribePopup";
import AdSense from "../components/AdSense";
import { supabase } from "../lib/supabase";
import { useSEO } from "../hooks/useSEO";
import { useStructuredData } from "../hooks/useStructuredData";

export default function JobUpdateDetail() {
  const navigate = useNavigate();
  const location = useLocation();
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

  // Count one view per browser session per post.
  useEffect(() => {
    if (!update?.id || !supabase) return;

    const key = `job_viewed_${update.id}`;
    try {
      if (sessionStorage.getItem(key)) return;
      // Claim the key up front so a StrictMode double-mount or a fast
      // re-render can't double count; released again if the call fails.
      sessionStorage.setItem(key, "1");
    } catch {
      return; // private mode — don't count rather than count every load
    }

    (async () => {
      const { error } = await supabase.rpc("bump_job_views", {
        p_id: update.id,
      });
      // Failed call (offline, RPC missing) — drop the claim so the next
      // page load retries instead of losing the view for the whole session.
      if (error) {
        try {
          sessionStorage.removeItem(key);
        } catch {
          /* nothing to release */
        }
      }
    })();
  }, [update?.id]);

  const goBack = () => {
    // location.key is "default" when this is the first entry in the app's
    // history (e.g. link opened directly from WhatsApp), so there is nothing
    // in-app to go back to. window.history.length is unreliable here because
    // the browser/in-app WebView may already have unrelated entries.
    if (location.key !== "default") navigate(-1);
    else navigate("/jobs");
  };

  const startDate = update?.start_date
    ? new Date(update.start_date).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : null;

  const endDate = update?.end_date
    ? new Date(update.end_date).toLocaleDateString("en-US", {
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
                  {update.job_id && (
                    <p className="text-xs text-white/50 mt-1">Job ID: {update.job_id}</p>
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

              <div className="grid gap-4 py-4 border-y border-white/10">
                {/* Location & Job Type */}
                <div className="flex flex-wrap items-center gap-6 text-sm">
                  {update.location && (
                    <div className="flex items-center gap-2 text-white/70">
                      <FiMapPin size={16} className="text-neon-cyan" />
                      {update.location}
                    </div>
                  )}
                  {(update.job_type || update.work_mode) && (
                    <div className="flex items-center gap-2 text-white/70">
                      <FiBriefcase size={16} className="text-neon-cyan" />
                      {update.job_type && (
                        <span className="rounded-full border border-neon-cyan/30 bg-neon-cyan/10 px-2.5 py-1 text-xs font-medium text-neon-cyan">
                          {update.job_type}
                        </span>
                      )}
                      {update.work_mode && (
                        <span className="rounded-full border border-white/20 bg-white/5 px-2.5 py-1 text-xs font-medium text-white/70">
                          {update.work_mode}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Experience & Qualification */}
                {(update.experience || update.qualification) && (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {update.experience && (
                      <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
                        <FiAward size={18} className="text-amber-400 shrink-0" />
                        <div>
                          <p className="text-xs text-white/50">Experience Required</p>
                          <p className="text-sm font-semibold text-white">{update.experience}</p>
                        </div>
                      </div>
                    )}
                    {update.qualification && (
                      <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
                        <span className="text-lg">🎓</span>
                        <div>
                          <p className="text-xs text-white/50">Qualification Required</p>
                          <p className="text-sm font-semibold text-white">{update.qualification}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Employment Duration */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
                  {startDate && (
                    <div className="flex items-center gap-2">
                      <FiCalendar size={14} />
                      Started: <span className="text-white">{startDate}</span>
                    </div>
                  )}
                  {startDate && update.end_date && (
                    <span className="text-white/40">•</span>
                  )}
                  {update.end_date && (
                    <div className="flex items-center gap-2">
                      <FiCalendar size={14} />
                      Ended: <span className="text-white">{endDate}</span>
                    </div>
                  )}
                </div>
              </div>

              {update.tags && update.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {update.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm font-medium text-white/70"
                    >
                      <FiTag size={12} />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
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
              <div className="prose prose-invert max-w-none overflow-hidden">
                <div
                  className="space-y-4 text-white/70 leading-relaxed break-words overflow-x-hidden"
                  style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
                  dangerouslySetInnerHTML={{ __html: update.content }}
                />
              </div>
            )}

            {/* Apply Section */}
            <div className="mt-12 border-t border-white/10 pt-8">
              <div className="flex flex-col gap-4 sm:flex-row">
                {update.apply_url ? (
                  <a
                    href={update.apply_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-neon-cyan/30 bg-gradient-to-r from-neon-cyan/20 to-neon-cyan/10 px-6 py-3 text-sm font-semibold text-neon-cyan transition-all hover:border-neon-cyan/50 hover:from-neon-cyan/30 hover:to-neon-cyan/20"
                  >
                    🚀 Apply Now
                    <FiExternalLink size={16} />
                  </a>
                ) : (
                  <button
                    onClick={() => navigate("/jobs")}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-neon-cyan/30 bg-gradient-to-r from-neon-cyan/20 to-neon-cyan/10 px-6 py-3 text-sm font-semibold text-neon-cyan transition-all hover:border-neon-cyan/50 hover:from-neon-cyan/30 hover:to-neon-cyan/20"
                  >
                    🚀 Back to Jobs
                  </button>
                )}
                <button
                  onClick={() => navigate("/jobs")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
                >
                  ← View all updates
                </button>
              </div>
            </div>

            {/* AdSense Ad — reuses the Jobs Page unit ID. Swap for a dedicated
                "Job Detail" unit if you want separate reporting. */}
            <AdSense slot="3452130548" />
          </motion.article>
        )}
      </main>

      <JobSubscribePopup />
      <Footer />
    </div>
  );
}
