import { motion } from "framer-motion";
import { FiArrowUpRight } from "react-icons/fi";
import { projects } from "../data";

export default function Projects() {
  return (
    <section id="projects" className="relative px-6 py-24">
      <div className="mx-auto max-w-6xl">
        {/* Heading */}
        <div className="mb-20 text-center">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-neon-cyan"
          >
            Portfolio
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-5xl font-bold tracking-tight sm:text-7xl"
          >
            Featured <span className="gradient-text">Projects</span>
          </motion.h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-white/55">
            Explore my latest work showcasing modern web technologies and
            creative solutions.
          </p>
        </div>

        {/* Alternating large showcases */}
        <div className="space-y-24">
          {projects.map((project, i) => (
            <ProjectRow key={project.title} project={project} flip={i % 2 === 1} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectRow({ project, flip }) {
  return (
    <div className="grid items-center gap-10 md:grid-cols-2">
      {/* Image */}
      <motion.div
        initial={{ opacity: 0, x: flip ? 60 : -60 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className={`group relative overflow-hidden rounded-3xl glass ${
          flip ? "md:order-2" : ""
        }`}
      >
        <div
          className="pointer-events-none absolute inset-0 z-10 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            boxShadow: `0 0 60px -10px ${project.glow}`,
            border: `1px solid ${project.glow}55`,
          }}
        />
        <img
          src={project.image}
          alt={project.title}
          loading="lazy"
          className={`aspect-[16/11] w-full transition-transform duration-500 group-hover:scale-105 ${
            project.fit === "contain"
              ? "bg-base/60 object-contain p-3"
              : "object-cover"
          }`}
        />
      </motion.div>

      {/* Details */}
      <motion.div
        initial={{ opacity: 0, x: flip ? -60 : 60 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
        className={flip ? "md:order-1" : ""}
      >
        <span
          className="inline-block rounded-full border px-4 py-1.5 text-sm font-semibold"
          style={{
            color: project.glow,
            borderColor: `${project.glow}66`,
            background: `${project.glow}12`,
          }}
        >
          {project.category}
        </span>
        <h3 className="mt-6 text-4xl font-bold leading-tight text-white sm:text-5xl">
          {project.title}
        </h3>
        <p className="mt-5 max-w-md text-lg leading-relaxed text-white/60">
          {project.description}
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-sm text-white/70"
            >
              {tag}
            </span>
          ))}
        </div>
        <a
          href={project.link}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-btn px-6 py-3 font-semibold text-base shadow-[0_0_25px_rgba(168,85,247,0.4)] transition-transform hover:scale-105"
        >
          View Project <FiArrowUpRight className="text-lg" />
        </a>
      </motion.div>
    </div>
  );
}
