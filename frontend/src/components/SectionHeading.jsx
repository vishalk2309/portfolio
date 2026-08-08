import { motion } from "framer-motion";

export default function SectionHeading({ eyebrow, title }) {
  return (
    <div className="mb-14 text-center">
      {eyebrow && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-neon-cyan"
        >
          {eyebrow}
        </motion.p>
      )}
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-bold tracking-tight sm:text-5xl"
      >
        <span className="gradient-text">{title}</span>
      </motion.h2>
    </div>
  );
}
