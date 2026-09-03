import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowLeft, FiGrid, FiList, FiMoon, FiSun, FiHome } from "react-icons/fi";
import Background from "../components/Background";
import Footer from "../components/Footer";
import JobUpdateCard from "../components/JobUpdateCard";
import JobUpdatesSubscribe from "../components/JobUpdatesSubscribe";
import JobSubscribePopup from "../components/JobSubscribePopup";
import AdSense from "../components/AdSense";
import { useJobUpdates } from "../hooks/useJobUpdates";
import { useSEO } from "../hooks/useSEO";
import { useStructuredData } from "../hooks/useStructuredData";
import { applyMode, getMode } from "../theme";

export default function JobUpdatesPage() {
  const navigate = useNavigate();
  const { updates, status } = useJobUpdates();
  const [selectedTag, setSelectedTag] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [mode, setMode] = useState(getMode());

  const toggleTheme = () => {
    const newMode = mode === "light" ? "dark" : "light";
    applyMode(newMode);
    setMode(newMode);
  };

  useSEO({
    title: "Job Updates & Career Journey - Vishal Kushwaha",
    description: "Follow my career journey and job updates. Explore my professional milestones, new positions, and career growth in software development.",
    canonical: "https://www.vishalworks.co.in/jobs",
  });

  // Add structured data for better SEO
  useStructuredData(
    updates && updates.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Career Journey & Job Updates',
          description: 'A collection of professional career updates and job milestones',
          url: 'https://www.vishalworks.co.in/jobs',
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: updates.slice(0, 10).map((update, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              item: {
                '@type': 'NewsArticle',
                headline: update.title,
                description: update.description || update.title,
                url: `https://www.vishalworks.co.in/job/${update.slug}`,
                datePublished: update.created_at,
                author: {
                  '@type': 'Person',
                  name: 'Vishal Kushwaha',
                },
                ...(update.cover_image && { image: update.cover_image }),
              },
            })),
          },
        }
      : null
  );

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };

  const allTags = Array.from(
    new Set((updates || []).flatMap((u) => u.tags || []))
  ).sort();

  const filtered =
    selectedTag && updates
      ? updates.filter((u) => u.tags?.includes(selectedTag))
      : updates;

  return (
    <div className="relative min-h-screen">
      <Background />

      <header className="fixed inset-x-0 top-0 z-50">
        <nav className="glass mx-auto flex max-w-6xl items-center justify-between rounded-b-2xl px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={goBack}
              className="flex items-center gap-1 text-sm text-white/70 transition-colors hover:text-white"
              title="Go back"
            >
              <FiArrowLeft size={16} /> Back
            </button>
            <span className="text-white/30">•</span>
            <Link
              to="/"
              className="flex items-center gap-1 text-sm text-white/70 transition-colors hover:text-white hover:text-neon-cyan"
              title="Return to portfolio"
            >
              <FiHome size={16} /> Portfolio
            </Link>
          </div>
          <span className="text-lg font-bold">
            <span className="gradient-text">Job Updates</span>
          </span>
          <button
            onClick={toggleTheme}
            className="text-white/70 transition-colors hover:text-white"
            aria-label="Toggle theme"
          >
            {mode === "light" ? <FiMoon size={18} /> : <FiSun size={18} />}
          </button>
        </nav>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-32">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Job Updates & <span className="gradient-text">Career Journey</span>
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-white/55">
            Follow my professional growth, career milestones, and exciting opportunities I've encountered along the way.
          </p>
        </motion.div>

        {/* Subscribe — kept above the fold so it's actually seen */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-6"
        >
          <JobUpdatesSubscribe compact />
        </motion.div>

        {/* View Toggle - Top Right */}
        <div className="mt-8 flex justify-end">
          <div className="flex items-center gap-2 glass rounded-full p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-full transition-colors ${
                viewMode === "grid"
                  ? "bg-neon-cyan/20 text-neon-cyan"
                  : "text-white/60 hover:text-white"
              }`}
              aria-label="Grid view"
            >
              <FiGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-full transition-colors ${
                viewMode === "list"
                  ? "bg-neon-cyan/20 text-neon-cyan"
                  : "text-white/60 hover:text-white"
              }`}
              aria-label="List view"
            >
              <FiList size={18} />
            </button>
          </div>
        </div>

        {/* Tags - Scrollable */}
        {allTags.length > 0 && (
          <div className="mt-4 overflow-x-auto pb-2">
            <div className="flex gap-2 whitespace-nowrap">
              <button
                onClick={() => setSelectedTag(null)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors shrink-0 ${
                  selectedTag === null
                    ? "border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan"
                    : "glass border-white/15 text-white/70 hover:text-white"
                }`}
              >
                All ({updates?.length || 0})
              </button>
              {allTags.map((tag) => {
                const count = (updates || []).filter((u) =>
                  u.tags?.includes(tag)
                ).length;
                return (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors shrink-0 ${
                      selectedTag === tag
                        ? "border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan"
                        : "glass border-white/15 text-white/70 hover:text-white"
                    }`}
                  >
                    {tag} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {status === "loading" && (
          <p className="mt-12 text-white/40">Loading updates…</p>
        )}

        {status === "ready" && (!filtered || filtered.length === 0) && (
          <p className="mt-12 text-white/40">
            {selectedTag
              ? `No updates with "${selectedTag}" tag yet.`
              : "No updates yet — check back soon."}
          </p>
        )}

        {filtered && filtered.length > 0 && (
          <div className={`mt-12 ${
            viewMode === "grid"
              ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              : "space-y-4"
          }`}>
            {filtered.map((update, i) => (
              <motion.div
                key={update.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: Math.min(i, 6) * 0.05 }}
              >
                <JobUpdateCard update={update} viewMode={viewMode} />
              </motion.div>
            ))}
          </div>
        )}

        {/* AdSense Ad */}
        <AdSense slot="3452130548" />
      </main>

      <JobSubscribePopup />
      <Footer />
    </div>
  );
}
