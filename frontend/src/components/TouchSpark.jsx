import { useEffect, useRef } from "react";

const PARTICLES = 6; // dots that burst out from each touch point
const THROTTLE_MS = 28; // min gap between sparks while dragging/scrolling

/**
 * Mobile counterpart to <CursorTrail>. Since a phone has no cursor to follow,
 * this emits a small accent-coloured spark wherever a finger touches or drags,
 * so scrolling by finger leaves a little glow on screen.
 *
 * Runs only on coarse-pointer (touch) devices; desktops keep the cursor trail.
 */
export default function TouchSpark() {
  const layerRef = useRef(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: coarse)").matches) return;
    const layer = layerRef.current;
    if (!layer) return;

    // Keep spark colours in sync with the active accent, like CursorTrail does.
    const readAccent = () => {
      const css = getComputedStyle(document.documentElement);
      return {
        from: (css.getPropertyValue("--accent-from") || "#6ee7f9").trim(),
        to: (css.getPropertyValue("--accent-to") || "#a855f7").trim(),
      };
    };
    let accent = readAccent();
    const onAccent = () => (accent = readAccent());
    window.addEventListener("accentchange", onAccent);

    const makeDot = (size, color, blur) => {
      const el = document.createElement("span");
      el.style.cssText = `position:absolute;top:0;left:0;width:${size}px;height:${size}px;border-radius:9999px;background:${color};box-shadow:0 0 ${blur}px ${color};mix-blend-mode:screen;will-change:transform,opacity;pointer-events:none;`;
      return el;
    };

    const spawn = (x, y) => {
      // central flash that blooms and fades
      const flash = makeDot(18, accent.from, 16);
      flash.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      layer.appendChild(flash);
      flash
        .animate(
          [
            { transform: `translate(${x}px, ${y}px) translate(-50%, -50%) scale(0.4)`, opacity: 0.9 },
            { transform: `translate(${x}px, ${y}px) translate(-50%, -50%) scale(1.6)`, opacity: 0 },
          ],
          { duration: 420, easing: "ease-out" }
        )
        .addEventListener("finish", () => flash.remove());

      // particles that shoot outward at even angles
      for (let i = 0; i < PARTICLES; i++) {
        const t = i / PARTICLES;
        const color = t < 0.5 ? accent.from : accent.to;
        const p = makeDot(6, color, 8);
        const angle = (Math.PI * 2 * i) / PARTICLES;
        const dist = 22 + Math.random() * 14;
        const dx = x + Math.cos(angle) * dist;
        const dy = y + Math.sin(angle) * dist;
        layer.appendChild(p);
        p
          .animate(
            [
              { transform: `translate(${x}px, ${y}px) translate(-50%, -50%) scale(1)`, opacity: 0.9 },
              { transform: `translate(${dx}px, ${dy}px) translate(-50%, -50%) scale(0.2)`, opacity: 0 },
            ],
            { duration: 480, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
          )
          .addEventListener("finish", () => p.remove());
      }
    };

    let last = 0;
    const handle = (e) => {
      const touch = e.touches && e.touches[0];
      if (!touch) return;
      const now = performance.now();
      if (now - last < THROTTLE_MS) return;
      last = now;
      spawn(touch.clientX, touch.clientY);
    };

    // passive listeners so we never interfere with native scrolling
    window.addEventListener("touchstart", handle, { passive: true });
    window.addEventListener("touchmove", handle, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handle);
      window.removeEventListener("touchmove", handle);
      window.removeEventListener("accentchange", onAccent);
    };
  }, []);

  return (
    <div
      ref={layerRef}
      className="pointer-events-none fixed inset-0 z-[60] md:hidden"
      aria-hidden="true"
    />
  );
}
