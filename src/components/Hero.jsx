import { Suspense, lazy } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useContent } from "../lib/ContentContext";
import Magnetic from "./Magnetic";
import LiveVisitors from "./LiveVisitors";

// Lazy-load the WebGL cube so three.js ships as its own chunk.
const HeroCube = lazy(() => import("./HeroCube"));

export default function Hero() {
  const { profile, socials } = useContent();
  const reduceMotion = useReducedMotion();

  // When the user prefers reduced motion, render everything in its final
  // state instead of animating it in.
  const fade = ({ initial, animate, transition }) =>
    reduceMotion ? { initial: false, animate } : { initial, animate, transition };
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
          {...fade({
            initial: { opacity: 0, scale: 0.8 },
            animate: { opacity: 1, scale: 1 },
            transition: { duration: 1, ease: "easeOut" },
          })}
          className="font-serif text-5xl font-bold leading-[1.05] tracking-tight text-ink drop-shadow-[0_2px_20px_rgba(30,30,30,0.12)] sm:text-7xl md:text-8xl"
        >
          {profile.name}
        </motion.h1>

        {/* Subtitle — slides up, delay 300ms */}
        <motion.p
          {...fade({
            initial: { opacity: 0, y: 30 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.7, delay: 0.3, ease: "easeOut" },
          })}
          className="mx-auto mt-6 max-w-2xl text-lg font-medium text-white/60 sm:text-2xl md:text-3xl"
        >
          {profile.role}
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          {...fade({
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.7, delay: 0.55 },
          })}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Magnetic>
            <a
              href="#contact"
              className="inline-block rounded-full bg-ink px-8 py-3.5 font-semibold text-base text-paper shadow-[0_8px_24px_-8px_rgba(30,30,30,0.4)] transition-transform hover:scale-105"
            >
              Contact Me
            </a>
          </Magnetic>
          <Magnetic>
            <a
              href={profile.resumeUrl}
              download="Vishal_Resume.pdf"
              className="inline-block rounded-full border border-white/20 bg-white/5 px-8 py-3.5 font-semibold text-white backdrop-blur-md transition-transform hover:scale-105"
            >
              My Resume
            </a>
          </Magnetic>
        </motion.div>

        {/* Social icons */}
        <motion.div
          {...fade({
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            transition: { delay: 0.8 },
          })}
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

      {/* Live viewers badge — pinned to the bottom-left */}
      <motion.div
        {...fade({
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: 1, duration: 0.6 },
        })}
        className="absolute bottom-4 left-4 z-10 sm:bottom-8 sm:left-6"
      >
        <LiveVisitors />
      </motion.div>

      {/* Scroll cue — hidden on mobile where vertical space is tight */}
      <motion.div
        {...fade({
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { delay: 1.2 },
        })}
        className="absolute bottom-2 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1.5 sm:flex"
      >
        <div className="flex h-7 w-4 items-start justify-center rounded-full border border-white/30 p-1">
          <motion.div
            animate={{ y: [0, 7, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="h-1.5 w-0.5 rounded-full bg-neon-cyan"
          />
        </div>
        <span className="text-[10px] text-white/40">Scroll</span>
      </motion.div>
    </section>
  );
}
