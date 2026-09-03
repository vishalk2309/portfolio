import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiBell, FiX } from "react-icons/fi";
import { useSubscribe } from "../hooks/useSubscribe";

const readKey = (k) => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};

const writeKey = (k, v) => {
  try {
    localStorage.setItem(k, v);
  } catch {
    /* private mode — ignore */
  }
};

// Shared shell for the small corner subscribe popups (jobs, resources).
// Shows once per browser: dismissing or subscribing keeps it hidden.
// Note: the blog popup is a separate, older component (SubscribePopup.jsx).
export default function SubscribePopupBase({
  submit,
  storageKey,
  title,
  blurb,
  doneText,
  delay = 8000,
}) {
  const [open, setOpen] = useState(false);
  const { email, setEmail, status, msg, subscribe } = useSubscribe({
    submit,
    storageKey,
  });

  useEffect(() => {
    if (readKey(storageKey)) return;
    const t = setTimeout(() => setOpen(true), delay);
    return () => clearTimeout(t);
  }, [delay, storageKey]);

  const dismiss = () => {
    writeKey(storageKey, "dismissed");
    setOpen(false);
  };

  // Let the success state read for a beat, then close.
  useEffect(() => {
    if (status !== "done") return;
    const t = setTimeout(() => setOpen(false), 2500);
    return () => clearTimeout(t);
  }, [status]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={{ duration: 0.25 }}
          className="fixed bottom-4 right-4 z-[60] w-[min(20rem,calc(100vw-2rem))]"
          role="dialog"
          aria-label={title}
        >
          <div className="glass relative overflow-hidden rounded-2xl border border-neon-cyan/25 bg-base/95 p-4 shadow-2xl backdrop-blur-xl">
            <button
              onClick={dismiss}
              className="absolute right-2 top-2 rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              <FiX size={16} />
            </button>

            {status === "done" ? (
              <div className="flex items-center gap-3 pr-6">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-400/20">
                  <FiBell className="text-emerald-400" size={16} />
                </div>
                <p className="text-sm font-semibold text-emerald-300">
                  {doneText}
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 pr-6">
                  <FiBell size={16} className="shrink-0 text-neon-cyan" />
                  <p className="text-sm font-bold text-white">{title}</p>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-white/55">
                  {blurb}
                </p>

                <form onSubmit={subscribe} className="mt-3 flex gap-2">
                  <input
                    type="email"
                    placeholder="you@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white placeholder-white/40 outline-none transition-all focus:border-neon-cyan/50 focus:bg-white/10"
                  />
                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="shrink-0 rounded-xl border border-neon-cyan/30 bg-neon-cyan/15 px-3 py-2 text-sm font-semibold text-neon-cyan transition-all hover:bg-neon-cyan/25 disabled:opacity-60"
                  >
                    {status === "sending" ? "…" : "Join"}
                  </button>
                </form>

                {status === "error" && (
                  <p className="mt-2 text-xs text-red-400">{msg}</p>
                )}
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
