import { motion, useScroll, useSpring } from "framer-motion";

/** Thin gradient bar at the very top showing scroll progress. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.2,
  });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[95] h-[3px] origin-left bg-gradient-btn"
    />
  );
}
