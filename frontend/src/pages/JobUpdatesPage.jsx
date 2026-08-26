import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowLeft } from "react-icons/fi";
import Background from "../components/Background";
import Footer from "../components/Footer";
import JobUpdateCard from "../components/JobUpdateCard";
import JobUpdatesSubscribe from "../components/JobUpdatesSubscribe";
import { useJobUpdates } from "../hooks/useJobUpdates";
import { useSEO } from "../hooks/useSEO";
import { useStructuredData } from "../hooks/useStructuredData";

export default function JobUpdatesPage() {
  const navigate = useNavigate();
  const { updates, status } = useJobUpdates();
  const [selectedTag, setSelectedTag] = useState(null);

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
          <button
            onClick={goBack}
            className="flex items-center gap-1 text-sm text-white/70 transition-colors hover:text-white"
          >
            <FiArrowLeft size={16} /> Back
          </button>
          <span className="text-lg font-bold">
            <span className="gradient-text">Job Updates</span>
          </span>
          <div className="w-16" />
        </nav>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-32">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            <span className="gradient-text">Career Journey</span>
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-white/55">
            Follow my professional growth, career milestones, and exciting opportunities I've encountered along the way.
          </p>
        </motion.div>

        {allTags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTag(null)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
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
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
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
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((update, i) => (
              <motion.div
                key={update.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: Math.min(i, 6) * 0.05 }}
              >
                <JobUpdateCard update={update} />
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-16">
          <JobUpdatesSubscribe />
        </div>
      </main>

      <Footer />
    </div>
  );
}
