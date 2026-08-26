import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowRight, FiSearch } from "react-icons/fi";
import { useContent } from "../lib/ContentContext";
import AccentDots from "./AccentDots";

const openPalette = () =>
  window.dispatchEvent(new Event("open-command-palette"));

export default function Navbar() {
  const { navLinks, profile } = useContent();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState("home");

  // Blog is its own page now: point any "Blog" nav link at /blog (route).
  // We also guarantee the Resources and Blog links exist (before Contact)
  // even if they're not in the nav_links table yet — this stops them from
  // flashing in from data.js and then disappearing once Supabase responds.
  const links = useMemo(() => {
    let mapped = navLinks.map((l) =>
      l.href === "#blog" || l.label.toLowerCase() === "blog"
        ? { ...l, href: "/blog" }
        : l
    );

    // Resources — its own page (route). Inject before Blog/Contact if missing.
    if (!mapped.some((l) => l.href === "/resources")) {
      const res = { label: "Resources", href: "/resources" };
      const at = mapped.findIndex(
        (l) => l.href === "/blog" || l.href === "#contact"
      );
      mapped =
        at === -1
          ? [...mapped, res]
          : [...mapped.slice(0, at), res, ...mapped.slice(at)];
    }

    // Blog — inject before Contact if missing.
    if (!mapped.some((l) => l.href === "/blog")) {
      const blog = { label: "Blog", href: "/blog" };
      const ci = mapped.findIndex((l) => l.href === "#contact");
      mapped =
        ci === -1
          ? [...mapped, blog]
          : [...mapped.slice(0, ci), blog, ...mapped.slice(ci)];
    }

    // Job Updates — inject before Blog/Contact if missing.
    if (!mapped.some((l) => l.href === "/jobs")) {
      const jobs = { label: "Jobs", href: "/jobs" };
      const at = mapped.findIndex(
        (l) => l.href === "/blog" || l.href === "#contact"
      );
      mapped =
        at === -1
          ? [...mapped, jobs]
          : [...mapped.slice(0, at), jobs, ...mapped.slice(at)];
    }

    return mapped;
  }, [navLinks]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Highlight the nav link for the section currently in view
  useEffect(() => {
    const ids = ["home", ...links.map((l) => l.href.slice(1))];
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveId(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, [links]);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass shadow-[0_8px_30px_-12px_rgba(30,30,30,0.15)]"
          : "bg-transparent border-b border-transparent"
      }`}
      style={{
        backgroundImage:
          "linear-gradient(to right, rgb(217, 164, 65) 0%, rgb(217, 164, 65) 33.33%, white 33.33%, white 66.66%, rgb(34, 197, 94) 66.66%, rgb(34, 197, 94) 100%)",
        backgroundPosition: "bottom",
        backgroundRepeat: "repeat-x",
        backgroundSize: "100% 4px",
      }}
    >
      <nav className="mx-auto w-full flex max-w-6xl items-center justify-between gap-6 px-4 sm:px-6 py-3 sm:py-4">
        {/* Logo */}
        <a href="#home" className="shrink-0 text-xl font-bold tracking-tight">
          <span className="gradient-text">{profile.name}</span>
        </a>

        {/* Desktop Navigation Links - Center */}
        <ul className="hidden flex-1 items-center justify-center gap-6 md:flex">
          {links.map((link) => {
            const isActive = activeId === link.href.slice(1);
            const cls = `nav-link text-sm font-medium transition-colors hover:text-white whitespace-nowrap ${
              isActive ? "nav-link-active text-white" : "text-white/75"
            }`;
            return (
              <li key={link.href}>
                {link.href.startsWith("/") ? (
                  <Link to={link.href} className={cls}>
                    {link.label}
                  </Link>
                ) : (
                  <a href={link.href} className={cls}>
                    {link.label}
                  </a>
                )}
              </li>
            );
          })}
        </ul>

        {/* Right side items */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* Accent theme dots (desktop) */}
          <div className="hidden sm:block">
            <AccentDots size={16} />
          </div>

          {/* ⌘K command palette trigger */}
          <button
            onClick={openPalette}
            aria-label="Open command palette"
            className="flex shrink-0 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs text-white/60 transition-colors hover:text-white"
          >
            <FiSearch size={16} />
            <kbd className="hidden sm:inline text-xs">⌘K</kbd>
          </button>

          {/* Let's Talk - Desktop only */}
          <a
            href="#contact"
            className="hidden items-center gap-2 shrink-0 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(168,85,247,0.25)] backdrop-blur-md transition-transform hover:scale-105 lg:inline-flex"
          >
            <FiArrowRight size={16} className="text-neon-cyan" /> Let's Talk
          </a>

          {/* Mobile menu toggle */}
          <button
            aria-label="Toggle menu"
            onClick={() => setOpen((o) => !o)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg glass md:hidden"
          >
            <div className="space-y-1.5">
              <span
                className={`block h-0.5 w-5 bg-white transition-transform ${
                  open ? "translate-y-2 rotate-45" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-5 bg-white transition-opacity ${
                  open ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-5 bg-white transition-transform ${
                  open ? "-translate-y-2 -rotate-45" : ""
                }`}
              />
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <motion.ul
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="glass flex flex-col gap-1 px-6 pb-4 md:hidden"
        >
          {links.map((link) => (
            <li key={link.href}>
              {link.href.startsWith("/") ? (
                <Link
                  to={link.href}
                  onClick={() => setOpen(false)}
                  className="block py-2 text-white/80 hover:text-white"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block py-2 text-white/80 hover:text-white"
                >
                  {link.label}
                </a>
              )}
            </li>
          ))}
        </motion.ul>
      )}
    </motion.header>
  );
}
