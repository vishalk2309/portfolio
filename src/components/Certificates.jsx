import { useRef } from "react";
import { motion } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { FaGraduationCap, FaRegCalendarAlt } from "react-icons/fa";
import { certificates } from "../data";

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
          className="flex gap-6 overflow-x-auto scroll-smooth px-2 pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
      className="group relative w-[300px] shrink-0"
    >
      <div
        className="overflow-hidden rounded-3xl transition-transform duration-300 group-hover:-translate-y-2"
        style={{
          background: cert.color,
          boxShadow: `0 25px 60px -20px ${cert.color}`,
        }}
      >
        {/* Certificate sheet */}
        <div className="relative m-3 mb-0 rounded-t-2xl bg-[#f1efe9] px-6 pb-16 pt-6 text-center">
          <div className="mx-auto mb-4 flex items-center justify-center gap-2 text-[#9a9488]">
            <span className="h-px w-12 bg-[#cfc9bd]" />
            <span className="text-lg">❦</span>
            <span className="h-px w-12 bg-[#cfc9bd]" />
          </div>
          <div
            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full text-xs font-bold text-white shadow-inner"
            style={{ background: "#7c1f1f" }}
          >
            ❀
          </div>
          <h3
            className="text-3xl tracking-wide text-[#2a2a35]"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            CERTIFICATE
          </h3>
        </div>

        {/* Colored info area */}
        <div className="relative -mt-10 px-6 pb-6 pt-12 text-center text-white">
          <h4 className="text-xl font-bold leading-snug">{cert.title}</h4>
          <div className="mt-4 flex flex-col items-center gap-2 text-sm text-white/90">
            <span className="flex items-center gap-2">
              <FaGraduationCap /> {cert.issuer}
            </span>
            <span className="flex items-center gap-2">
              <FaRegCalendarAlt /> {cert.date}
            </span>
          </div>
          <a
            href={cert.link}
            className="mt-5 inline-block rounded-xl border border-white/40 bg-white/15 px-5 py-2 text-sm font-semibold backdrop-blur-sm transition-colors hover:bg-white/25"
          >
            View Certificate
          </a>
        </div>
      </div>
    </motion.div>
  );
}
