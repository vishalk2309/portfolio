import { useEffect, useRef } from "react";

const COUNT = 8; // number of trailing dots

// hex -> {r,g,b}
function hexToRgb(hex) {
  let h = (hex || "").trim().replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
const mix = (a, b, t) => ({
  r: Math.round(a.r + (b.r - a.r) * t),
  g: Math.round(a.g + (b.g - a.g) * t),
  b: Math.round(a.b + (b.b - a.b) * t),
});

/**
 * A glowing comet-style trail that follows the cursor with lag.
 * Dot colors are interpolated from the active accent (--accent-from → --accent-to).
 */
export default function CursorTrail() {
  const dotsRef = useRef([]);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const points = Array.from({ length: COUNT }, () => ({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    }));
    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let visible = false;

    // recolor dots from the current accent variables
    const applyColors = () => {
      const css = getComputedStyle(document.documentElement);
      const from = hexToRgb(css.getPropertyValue("--accent-from") || "#6ee7f9");
      const to = hexToRgb(css.getPropertyValue("--accent-to") || "#a855f7");
      dotsRef.current.forEach((el, i) => {
        if (!el) return;
        const t = i / COUNT;
        const c = mix(from, to, t);
        const color = `rgb(${c.r}, ${c.g}, ${c.b})`;
        el.style.background = color;
        el.style.boxShadow = `0 0 ${14 - t * 8}px ${color}`;
      });
    };
    applyColors();
    window.addEventListener("accentchange", applyColors);

    const onMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (!visible) {
        visible = true;
        dotsRef.current.forEach((d, i) => {
          if (d) d.style.opacity = String(0.85 - (i / COUNT) * 0.5);
        });
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
        p.x += (leadX - p.x) * 0.35;
        p.y += (leadY - p.y) * 0.35;
        leadX = p.x;
        leadY = p.y;
        const el = dotsRef.current[i];
        if (el) {
          const scale = 1 - i / COUNT;
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
      window.removeEventListener("accentchange", applyColors);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] hidden md:block">
      {Array.from({ length: COUNT }).map((_, i) => {
        const t = i / COUNT;
        const size = 22 - t * 16;
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
              opacity: 0.85 - t * 0.5,
              filter: "blur(1px)",
              mixBlendMode: "screen",
              willChange: "transform",
            }}
          />
        );
      })}
    </div>
  );
}
