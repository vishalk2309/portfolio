import { useRef } from "react";
import { motion } from "framer-motion";
import { FiChevronLeft, FiChevronRight, FiExternalLink } from "react-icons/fi";
import { FaGraduationCap, FaRegCalendarAlt } from "react-icons/fa";
import { certificates, profile } from "../data";

export default function Certificates() {
  const trackRef = useRef(null);

  const scroll = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 360, behavior: "smooth" });
  };

  return (
    <section id="certificates" className="relative px-6 py-24">
      <div className="mx-auto max-w-6xl text-center">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-5xl font-bold tracking-tight sm:text-7xl"
        >
          Premium <span className="gradient-text">Certificates</span>
        </motion.h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-white/55">
          Each certificate presented in an elegant envelope design — hover to
          reveal the certificate.
        </p>
      </div>

      <div className="relative mx-auto mt-14 max-w-6xl">
        {/* Arrows */}
        <button
          aria-label="Previous"
          onClick={() => scroll(-1)}
          className="absolute -left-3 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full glass text-xl text-white transition-transform hover:scale-110 sm:-left-5"
        >
          <FiChevronLeft />
        </button>
        <button
          aria-label="Next"
          onClick={() => scroll(1)}
          className="absolute -right-3 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full glass text-xl text-white transition-transform hover:scale-110 sm:-right-5"
        >
          <FiChevronRight />
        </button>

        {/* Track */}
        <div
          ref={trackRef}
          className="flex gap-6 overflow-x-auto scroll-smooth px-2 pb-10 pt-24 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {certificates.map((cert, i) => (
            <CertCard key={cert.title} cert={cert} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CertCard({ cert, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.08 }}
      style={{ scrollSnapAlign: "start" }}
      className="group relative z-0 h-[420px] w-[300px] shrink-0 hover:z-30"
    >
      {/* Certificate sheet — slides UP out of the pocket on hover */}
      <div className="absolute inset-x-4 top-0 z-0 rounded-2xl bg-[#f1efe9] px-5 pb-32 pt-5 text-center shadow-[0_14px_34px_-12px_rgba(0,0,0,0.65)] transition-transform duration-500 ease-out group-hover:-translate-y-[88px]">
        <div className="mx-auto mb-3 flex items-center justify-center gap-2 text-[#9a9488]">
          <span className="h-px w-10 bg-[#cfc9bd]" />
          <span>❦</span>
          <span className="h-px w-10 bg-[#cfc9bd]" />
        </div>
        <div
          className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full text-white shadow-inner"
          style={{ background: "#7c1f1f" }}
        >
          ❀
        </div>
        <h3
          className="text-2xl leading-none tracking-wide text-[#2a2a35]"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          CERTIFICATE
        </h3>
        <p className="mt-1.5 text-[11px] font-semibold tracking-[0.3em] text-[#8a8478]">
          OF ACHIEVEMENT
        </p>
        <p className="mt-4 text-[9px] tracking-[0.2em] text-[#9a9488]">
          THIS CERTIFICATE IS PRESENTED TO
        </p>
        <p
          className="mt-1 text-lg font-semibold text-[#2a2a35]"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          {profile.name}
        </p>
      </div>

      {/* Colored pocket (front) */}
      <div
        className="absolute inset-x-0 bottom-0 z-10 flex h-[60%] flex-col items-center px-6 pb-6 pt-10 text-center text-white"
        style={{
          background: cert.color,
          borderRadius: "42% 42% 24px 24px / 26% 26% 24px 24px",
          boxShadow: `0 25px 60px -22px ${cert.color}`,
        }}
      >
        <h4 className="text-xl font-bold leading-snug">{cert.title}</h4>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-white/90">
          <span className="flex items-center gap-1.5">
            <FaGraduationCap /> {cert.issuer}
          </span>
          <span className="opacity-50">•</span>
          <span className="flex items-center gap-1.5">
            <FaRegCalendarAlt /> {cert.date}
          </span>
        </div>
        <a
          href={cert.link}
          className="mt-auto inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/15 px-6 py-2 text-sm font-semibold backdrop-blur-sm transition-colors hover:bg-white/25"
        >
          View <FiExternalLink />
        </a>
      </div>
    </motion.div>
  );
}
