import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useContent } from "../lib/ContentContext";

/**
 * Profile photo in the centre with tech icons orbiting around it.
 * Everything scales from the measured container width, so it never
 * overflows on small screens.
 */
export default function OrbitPhoto() {
  const { orbitSkills, profile } = useContent();
  const ref = useRef(null);
  const [size, setSize] = useState(420);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setSize(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const iconSize = Math.max(34, size * 0.12);
  const radius = size / 2 - iconSize / 2 - 4; // keep icons inside the box
  const photo = size * 0.5;

  return (
    <div
      ref={ref}
      className="relative mx-auto flex aspect-square w-full max-w-[440px] items-center justify-center"
    >
      {/* Orbit guide ring */}
      <div
        className="absolute rounded-full border border-white/10"
        style={{ width: radius * 2, height: radius * 2 }}
      />
      <div
        className="absolute rounded-full border border-neon-cyan/10 blur-sm"
        style={{ width: radius * 2, height: radius * 2 }}
      />

      {/* Rotating ring carrying the icons */}
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
      >
        {orbitSkills.map((skill, i) => {
          const angle = (i / orbitSkills.length) * Math.PI * 2;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          return (
            <div
              key={skill.name}
              className="absolute left-1/2 top-1/2"
              style={{ transform: `translate(${x}px, ${y}px)` }}
            >
              {/* counter-rotate so icons stay upright */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
                className="flex items-center justify-center rounded-full glass shadow-lg transition-transform hover:scale-125"
                style={{
                  width: iconSize,
                  height: iconSize,
                  marginLeft: -iconSize / 2,
                  marginTop: -iconSize / 2,
                  boxShadow: `0 0 22px -6px ${skill.color}`,
                }}
                title={skill.name}
              >
                <skill.Icon
                  style={{ color: skill.color, fontSize: iconSize * 0.46 }}
                />
              </motion.div>
            </div>
          );
        })}
      </motion.div>

      {/* Centre photo */}
      <div
        className="relative overflow-hidden rounded-full border-2 border-neon-cyan/60 shadow-[0_0_45px_-8px_rgba(110,231,249,0.6)]"
        style={{ width: photo, height: photo }}
      >
        <img
          src={profile.photo}
          alt={profile.name}
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
