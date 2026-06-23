import { useEffect, useRef, useState } from "react";

/**
 * Full-screen animated background:
 *  - Aurora: large blurred gradient circles slowly drifting (purple / blue / cyan)
 *  - Particles: subtle floating dots on a canvas
 *  - Mouse light: radial gradient that follows the cursor (mix-blend: screen)
 */
export default function Background() {
  const canvasRef = useRef(null);
  const [pointer, setPointer] = useState({ x: -500, y: -500 });

  // Mouse-following spotlight
  useEffect(() => {
    const handle = (e) => setPointer({ x: e.clientX, y: e.clientY });
    window.addEventListener("pointermove", handle);
    return () => window.removeEventListener("pointermove", handle);
  }, []);

  // Floating particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const count = Math.min(90, Math.floor((canvas.width * canvas.height) / 18000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.8 + 0.4,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        a: Math.random() * 0.5 + 0.2,
      }));
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(174, 200, 255, ${p.a})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Aurora gradient circles */}
      <div className="absolute -left-40 -top-40 h-[40rem] w-[40rem] rounded-full bg-neon-purple/20 blur-[120px] animate-aurora1" />
      <div className="absolute right-[-10rem] top-20 h-[36rem] w-[36rem] rounded-full bg-neon-blue/20 blur-[120px] animate-aurora2" />
      <div className="absolute bottom-[-12rem] left-1/3 h-[38rem] w-[38rem] rounded-full bg-neon-cyan/20 blur-[120px] animate-aurora3" />

      {/* Particles */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* Mouse-following spotlight */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(600px circle at ${pointer.x}px ${pointer.y}px, rgba(110,231,249,0.10), transparent 45%)`,
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
}
