import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiSearch,
  FiArrowRight,
  FiExternalLink,
  FiCopy,
  FiCornerDownLeft,
  FiDroplet,
} from "react-icons/fi";
import { leetcode, gfg, github } from "../data";
import { useContent } from "../lib/ContentContext";
import { ACCENTS, setAccent } from "../theme";

/**
 * ⌘K / Ctrl+K command palette: jump to sections, open external links,
 * copy email. Opens on the keyboard shortcut or an "open-command-palette" event.
 */
export default function CommandPalette() {
  const { navLinks, socials, profile } = useContent();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);

  const commands = useMemo(() => {
    const go = (href) => () => {
      const lenis = window.__lenis;
      if (lenis) lenis.scrollTo(href, { offset: -70 });
      else document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    };
    const openUrl = (url) => () =>
      window.open(url, "_blank", "noopener,noreferrer");

    const nav = [{ label: "Home", href: "#home" }, ...navLinks].map((l) => ({
      group: "Go to",
      label: l.label,
      icon: FiArrowRight,
      run: go(l.href),
    }));

    const links = [
      ...socials
        .filter((s) => /^https?:/.test(s.href))
        .map((s) => ({
          group: "Links",
          label: s.label,
          icon: FiExternalLink,
          run: openUrl(s.href),
        })),
      {
        group: "Links",
        label: "LeetCode profile",
        icon: FiExternalLink,
        run: openUrl(leetcode.profileUrl),
      },
      {
        group: "Links",
        label: "GeeksforGeeks profile",
        icon: FiExternalLink,
        run: openUrl(gfg.profileUrl),
      },
      {
        group: "Links",
        label: "GitHub profile",
        icon: FiExternalLink,
        run: openUrl(`https://github.com/${github.username}`),
      },
      ...(profile.resumeUrl && profile.resumeUrl !== "#"
        ? [
            {
              group: "Links",
              label: "Open Resume",
              icon: FiExternalLink,
              run: openUrl(profile.resumeUrl),
            },
          ]
        : []),
    ];

    const actions = [
      {
        group: "Actions",
        label: `Copy email (${profile.email})`,
        icon: FiCopy,
        run: () => {
          navigator.clipboard?.writeText(profile.email);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
          return true; // keep palette open briefly
        },
      },
    ];

    const themes = Object.entries(ACCENTS).map(([key, a]) => ({
      group: "Theme",
      label: `Accent: ${a.label}`,
      icon: FiDroplet,
      run: () => setAccent(key),
    }));

    return [...nav, ...links, ...actions, ...themes];
  }, [navLinks, socials, profile]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => c.label.toLowerCase().includes(q));
  }, [query, commands]);

  // Global open shortcut + custom event
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-command-palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-command-palette", onOpen);
    };
  }, []);

  // Reset + focus when opening
  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => setActive(0), [query]);

  const runIndex = (i) => {
    const cmd = filtered[i];
    if (!cmd) return;
    const keepOpen = cmd.run();
    if (!keepOpen) setOpen(false);
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") return setOpen(false);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % Math.max(1, filtered.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      runIndex(active);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          <motion.div
            initial={{ y: -20, scale: 0.97, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: -10, scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.18 }}
            onMouseDown={(e) => e.stopPropagation()}
            className="glass relative w-full max-w-xl overflow-hidden rounded-2xl shadow-2xl"
          >
            {/* search */}
            <div className="flex items-center gap-3 border-b border-white/10 px-4">
              <FiSearch className="text-white/50" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Type a command or search…"
                className="w-full bg-transparent py-4 text-white outline-none placeholder:text-white/40"
              />
              <kbd className="rounded border border-white/15 px-1.5 py-0.5 text-xs text-white/40">
                ESC
              </kbd>
            </div>

            {/* results */}
            <ul
              data-lenis-prevent
              className="max-h-[50vh] overflow-y-auto overscroll-contain p-2"
            >
              {filtered.length === 0 && (
                <li className="px-3 py-6 text-center text-sm text-white/40">
                  No results
                </li>
              )}
              {filtered.map((cmd, i) => {
                const showGroup =
                  i === 0 || filtered[i - 1].group !== cmd.group;
                return (
                  <li key={cmd.label}>
                    {showGroup && (
                      <div className="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-white/30">
                        {cmd.group}
                      </div>
                    )}
                    <button
                      onMouseEnter={() => setActive(i)}
                      onClick={() => runIndex(i)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                        active === i
                          ? "bg-white/10 text-white"
                          : "text-white/70"
                      }`}
                    >
                      <cmd.icon className="shrink-0 text-neon-cyan" />
                      <span className="flex-1">{cmd.label}</span>
                      {active === i && (
                        <FiCornerDownLeft className="text-white/30" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>

            {copied && (
              <div className="border-t border-white/10 px-4 py-2 text-xs text-emerald-400">
                ✓ Email copied to clipboard
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
