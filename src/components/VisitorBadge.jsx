import { motion, useReducedMotion } from "framer-motion";
import { useLocation } from "react-router-dom";
import LiveVisitors from "./LiveVisitors";

/**
 * Site-wide visitor badge. Mounted once at the router level so the live-viewer
 * count and total visits show on every public page (home, blog, resources,
 * account, legal) instead of only the hero.
 *
 * Mounting it once also matters for correctness: each mount opens its own
 * Realtime presence key, so two instances in one tab would double the "live"
 * number.
 *
 * Hidden on /admin — the dashboard is yours, not a visit.
 */
export default function VisitorBadge() {
  const { pathname } = useLocation();
  const reduceMotion = useReducedMotion();

  if (pathname.startsWith("/admin")) return null;

  const anim = reduceMotion
    ? { initial: false, animate: { opacity: 1, y: 0 } }
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: 1, duration: 0.6 },
      };

  return (
    <motion.div
      {...anim}
      className="fixed bottom-12 left-4 z-40 sm:bottom-14 sm:left-6"
    >
      <LiveVisitors />
    </motion.div>
  );
}
