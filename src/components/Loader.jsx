import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useContent } from "../lib/ContentContext";

/**
 * Branded intro splash: reveals the name, then fades into the site.
 * Shows once per browser session.
 */
export default function Loader() {
  const { profile } = useContent();
  const [show, setShow] = useState(
    () => !sessionStorage.getItem("introSeen")
  );

  useEffect(() => {
    if (!show) return;
    // lock scroll while the loader is visible
    window.__lenis?.stop();
    document.body.style.overflow = "hidden";

    const t = setTimeout(() => {
      setShow(false);
      sessionStorage.setItem("introSeen", "1");
    }, 1900);

    return () => {
      clearTimeout(t);
      window.__lenis?.start();
      document.body.style.overflow = "";
    };
  }, [show]);

  const letters = profile.name.split("");

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-base"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <div className="text-center">
            <h1 className="flex flex-wrap justify-center text-4xl font-bold tracking-tight sm:text-6xl">
              {letters.map((ch, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.4, ease: "easeOut" }}
                  className="gradient-text"
                >
                  {ch === " " ? " " : ch}
                </motion.span>
              ))}
            </h1>

            {/* loading bar */}
            <motion.div
              className="mx-auto mt-6 h-0.5 overflow-hidden rounded-full bg-white/10"
              initial={{ width: 0 }}
              animate={{ width: 220 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <motion.div
                className="h-full bg-gradient-btn"
                initial={{ x: "-100%" }}
                animate={{ x: "0%" }}
                transition={{ delay: 0.5, duration: 1, ease: "easeInOut" }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
