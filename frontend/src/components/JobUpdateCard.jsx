import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiBriefcase, FiCalendar, FiMapPin, FiAward, FiArrowRight } from "react-icons/fi";

export default function JobUpdateCard({ update }) {
  const startDate = update.start_date
    ? new Date(update.start_date).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : null;

  const endDate = update.end_date
    ? new Date(update.end_date).toLocaleDateString("en-US", {
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
          {update.job_id && (
            <p className="text-xs text-white/40">ID: {update.job_id}</p>
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

      <div className="mt-3 space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-xs text-white/50">
          {update.location && (
            <span className="flex items-center gap-1">
              <FiMapPin size={12} />
              {update.location}
            </span>
          )}
          {update.job_type && (
            <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5">
              {update.job_type}
            </span>
          )}
        </div>

        {(update.experience || update.qualification) && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-white/50">
            {update.experience && (
              <span className="flex items-center gap-1">
                <FiAward size={12} />
                {update.experience}
              </span>
            )}
            {update.qualification && (
              <span className="flex items-center gap-1">
                📚 {update.qualification}
              </span>
            )}
          </div>
        )}
      </div>

      {update.tags && update.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
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

      <div className="mt-4 flex items-center gap-4 text-xs text-white/50 border-t border-white/10 pt-3">
        {startDate && (
          <div className="flex items-center gap-1">
            <FiCalendar size={12} />
            {startDate}
          </div>
        )}
        {endDate && (
          <div className="flex items-center gap-1">
            - {endDate}
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        {update.apply_url ? (
          <a
            href={update.apply_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-neon-cyan/30 bg-gradient-to-r from-neon-cyan/20 to-neon-cyan/10 px-4 py-2 text-sm font-semibold text-neon-cyan transition-all hover:border-neon-cyan/50 hover:from-neon-cyan/30 hover:to-neon-cyan/20"
          >
            🚀 Apply
            <FiArrowRight size={14} />
          </a>
        ) : (
          <Link
            to={`/job/${update.slug}`}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-neon-cyan/30 bg-gradient-to-r from-neon-cyan/20 to-neon-cyan/10 px-4 py-2 text-sm font-semibold text-neon-cyan transition-all hover:border-neon-cyan/50 hover:from-neon-cyan/30 hover:to-neon-cyan/20"
          >
            🚀 Apply
            <FiArrowRight size={14} />
          </Link>
        )}
        <Link
          to={`/job/${update.slug}`}
          className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:text-white"
        >
          Details
        </Link>
      </div>
    </motion.div>
  );
}
