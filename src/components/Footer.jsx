import { useContent } from "../lib/ContentContext";

export default function Footer() {
  const { profile } = useContent();
  const firstName = profile.name.split(" ")[0].toUpperCase();
  return (
    <footer className="relative overflow-hidden px-6 pb-10 pt-20">
      {/* Giant background name — huge typography, 10% opacity, gradient, slow float */}
      <div className="pointer-events-none flex select-none justify-center">
        <h2 className="animate-footer-float gradient-text whitespace-nowrap text-[18vw] font-bold leading-none opacity-10">
          {firstName}
        </h2>
      </div>

      <div className="relative mx-auto -mt-8 flex max-w-6xl flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-sm text-white/50 sm:flex-row">
        <p>
          {/* Discreet dashboard entrance — looks like normal text to visitors. */}
          <a href="/admin" aria-label="Admin dashboard" title="Admin" className="cursor-text transition-colors hover:text-neon-cyan">©</a>{" "}
          {new Date().getFullYear()} {profile.name}. All rights reserved.
        </p>
        <p>
          Built with <span className="text-neon-cyan">React</span>,{" "}
          <span className="text-neon-purple">Tailwind</span> &{" "}
          <span className="text-neon-blue">Framer Motion</span>.
        </p>
      </div>
    </footer>
  );
}
