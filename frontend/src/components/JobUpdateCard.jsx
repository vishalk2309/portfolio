import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiBriefcase, FiCalendar } from "react-icons/fi";

export default function JobUpdateCard({ update }) {
  const startDate = update.start_date
    ? new Date(update.start_date).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5 }}
      className="glass group relative flex flex-col rounded-3xl p-6 transition-all hover:border-neon-cyan/30"
    >
      {update.cover_image && (
        <img
          src={update.cover_image}
          alt={update.title}
          className="mb-5 h-40 w-full rounded-2xl border border-white/10 object-cover"
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
      )}

      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          {update.company && (
            <p className="text-sm font-semibold text-neon-cyan">{update.company}</p>
          )}
          {update.position && (
            <p className="text-xs text-white/60">{update.position}</p>
          )}
        </div>
        <FiBriefcase className="shrink-0 text-white/40" size={20} />
      </div>

      <h3 className="text-lg font-bold text-white">{update.title}</h3>

      {update.description && (
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/60">
          {update.description}
        </p>
      )}

      {update.tags && update.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {update.tags.slice(0, 3).map((tag, i) => (
            <span
              key={i}
              className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-medium text-white/70"
            >
              {tag}
            </span>
          ))}
          {update.tags.length > 3 && (
            <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-medium text-white/50">
              +{update.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {startDate && (
        <div className="mt-4 flex items-center gap-2 text-xs text-white/50">
          <FiCalendar size={14} />
          {startDate}
        </div>
      )}

      <Link
        to={`/job/${update.slug}`}
        className="mt-4 inline-flex items-center gap-2 rounded-xl border border-neon-cyan/30 bg-neon-cyan/5 px-4 py-2 text-sm font-semibold text-neon-cyan transition-colors hover:border-neon-cyan/50 hover:bg-neon-cyan/10"
      >
        Read update →
      </Link>
    </motion.div>
  );
}
