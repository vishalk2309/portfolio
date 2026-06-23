import { useEffect, useRef } from "react";

const COUNT = 8; // number of trailing dots

/**
 * A glowing comet-style trail that follows the cursor with lag.
 * Each dot eases toward the one ahead of it, so a tail streams out
 * behind the pointer whenever the mouse moves.
 */
export default function CursorTrail() {
  const dotsRef = useRef([]);

  useEffect(() => {
    // Skip on touch / coarse-pointer devices.
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const points = Array.from({ length: COUNT }, () => ({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    }));
    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let visible = false;

    const onMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (!visible) {
        visible = true;
        dotsRef.current.forEach((d) => d && (d.style.opacity = ""));
      }
    };
    const onLeave = () => {
      visible = false;
      dotsRef.current.forEach((d) => d && (d.style.opacity = "0"));
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerout", onLeave);

    let raf;
    const animate = () => {
      let leadX = mouse.x;
      let leadY = mouse.y;
      points.forEach((p, i) => {
        // each dot chases the point ahead; head chases the mouse
        p.x += (leadX - p.x) * 0.35;
        p.y += (leadY - p.y) * 0.35;
        leadX = p.x;
        leadY = p.y;

        const el = dotsRef.current[i];
        if (el) {
          const scale = 1 - i / COUNT; // taper toward the tail
          el.style.transform = `translate(${p.x}px, ${p.y}px) translate(-50%, -50%) scale(${scale})`;
        }
      });
      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerout", onLeave);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] hidden md:block">
      {Array.from({ length: COUNT }).map((_, i) => {
        const t = i / COUNT;
        const size = 22 - t * 16; // 22px head -> ~6px tail
        // cyan -> purple gradient along the tail
        const hue = 190 + t * 90;
        return (
          <span
            key={i}
            ref={(el) => (dotsRef.current[i] = el)}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: size,
              height: size,
              borderRadius: "9999px",
              background: `hsl(${hue} 95% 65%)`,
              opacity: 0.85 - t * 0.5,
              filter: "blur(1px)",
              boxShadow: `0 0 ${14 - t * 8}px hsl(${hue} 95% 65%)`,
              mixBlendMode: "screen",
              willChange: "transform",
            }}
          />
        );
      })}
    </div>
  );
}
