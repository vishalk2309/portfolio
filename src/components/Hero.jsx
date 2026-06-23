import { Suspense, lazy } from "react";
import { motion } from "framer-motion";
import { profile, socials } from "../data";
import Magnetic from "./Magnetic";

// Lazy-load the WebGL cube so three.js ships as its own chunk.
const HeroCube = lazy(() => import("./HeroCube"));

export default function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-24"
    >
      {/* 3D floating cube behind the name */}
      <div className="pointer-events-none absolute left-1/2 top-[14%] h-[55vh] w-[55vh] -translate-x-1/2 opacity-90">
        <Suspense fallback={null}>
          <HeroCube />
        </Suspense>
      </div>

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {/* Name — fade in + scale 0.8 -> 1, 1s ease out */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-5xl font-bold leading-[1.05] tracking-tight text-white drop-shadow-[0_4px_40px_rgba(0,0,0,0.6)] sm:text-7xl md:text-8xl"
        >
          {profile.name}
        </motion.h1>

        {/* Subtitle — slides up, delay 300ms */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          className="mx-auto mt-6 max-w-2xl text-lg font-medium text-white/60 sm:text-2xl md:text-3xl"
        >
          {profile.role}
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Magnetic>
            <a
              href="#contact"
              className="inline-block rounded-full bg-white px-8 py-3.5 font-semibold text-base shadow-[0_0_30px_rgba(255,255,255,0.25)] transition-transform hover:scale-105"
            >
              Contact Me
            </a>
          </Magnetic>
          <Magnetic>
            <a
              href={profile.resumeUrl}
              className="inline-block rounded-full border border-white/20 bg-white/5 px-8 py-3.5 font-semibold text-white backdrop-blur-md transition-transform hover:scale-105"
            >
              My Resume
            </a>
          </Magnetic>
        </motion.div>

        {/* Social icons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 flex items-center justify-center gap-6 text-2xl text-white/45"
        >
          {socials.slice(0, 3).map(({ Icon, href, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              className="transition-colors hover:text-neon-cyan"
            >
              <Icon />
            </a>
          ))}
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
      >
        <div className="flex h-9 w-5 items-start justify-center rounded-full border border-white/30 p-1">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="h-2 w-1 rounded-full bg-neon-cyan"
          />
        </div>
        <span className="text-xs text-white/40">Scroll</span>
      </motion.div>
    </section>
  );
}
