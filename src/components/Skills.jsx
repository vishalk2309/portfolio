import { useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import { playgroundSkills } from "../data";

export default function Skills() {
  const sceneRef = useRef(null);
  const cardRefs = useRef([]);
  // Smaller cards on phones so all 15 fit comfortably.
  const [CARD] = useState(() =>
    typeof window !== "undefined" && window.innerWidth < 640 ? 78 : 116
  );

  useEffect(() => {
    const container = sceneRef.current;
    if (!container) return;

    const { Engine, World, Bodies, Body, Mouse, MouseConstraint, Composite } =
      Matter;

    // Container may not be measured on the very first tick — fall back sanely.
    let width = container.clientWidth || container.offsetWidth || 1000;
    let height = container.clientHeight || 600;

    const engine = Engine.create();
    engine.gravity.y = 1;
    const world = engine.world;

    const wallOpts = { isStatic: true };
    const t = 400; // wall thickness

    const makeWalls = (w, h) => [
      Bodies.rectangle(w / 2, h + t / 2, w + t * 2, t, wallOpts), // floor
      Bodies.rectangle(w / 2, -t / 2, w + t * 2, t, wallOpts), // ceiling
      Bodies.rectangle(-t / 2, h / 2, t, h + t * 2, wallOpts), // left
      Bodies.rectangle(w + t / 2, h / 2, t, h + t * 2, wallOpts), // right
    ];

    let walls = makeWalls(width, height);
    World.add(world, walls);

    // Seed cards INSIDE the arena (upper area) so they're visible immediately,
    // then gravity drops them into a pile.
    const bodies = playgroundSkills.map((_, i) => {
      const x = CARD / 2 + 20 + Math.random() * Math.max(1, width - CARD - 40);
      const y = CARD / 2 + 20 + Math.random() * Math.max(1, height * 0.45);
      const body = Bodies.rectangle(x, y, CARD, CARD, {
        restitution: 0.5,
        friction: 0.35,
        frictionAir: 0.012,
        chamfer: { radius: 22 },
      });
      Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.3);
      return body;
    });
    World.add(world, bodies);

    // Drag + throw
    const mouse = Mouse.create(container);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.2, render: { visible: false } },
    });
    World.add(world, mouseConstraint);
    // keep page scroll working while hovering the arena
    if (mouse.mousewheel) {
      mouse.element.removeEventListener("wheel", mouse.mousewheel);
      mouse.element.removeEventListener("DOMMouseScroll", mouse.mousewheel);
    }

    // Position DOM cards from physics bodies.
    const render = () => {
      for (let i = 0; i < bodies.length; i++) {
        const b = bodies[i];
        const el = cardRefs.current[i];
        if (!el) continue;
        el.style.transform = `translate(${b.position.x - CARD / 2}px, ${
          b.position.y - CARD / 2
        }px) rotate(${b.angle}rad)`;
      }
    };
    render(); // initial paint so nothing sits at (0,0)

    // Manual rAF loop (more reliable than Runner across StrictMode remounts).
    let rafId;
    let last = performance.now();
    let started = false;

    const loop = (now) => {
      const dt = Math.min(32, now - last);
      last = now;
      Engine.update(engine, dt);
      render();
      rafId = requestAnimationFrame(loop);
    };

    const start = () => {
      if (started) return;
      started = true;
      last = performance.now();
      rafId = requestAnimationFrame(loop);
    };

    // Start when the arena scrolls into view (and immediately if already visible).
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) start();
      },
      { threshold: 0.05 }
    );
    io.observe(container);
    // Safety net: start shortly after mount even if IO is slow to fire.
    const fallback = setTimeout(start, 600);

    const onResize = () => {
      const w = container.clientWidth || width;
      const h = container.clientHeight || height;
      World.remove(world, walls);
      walls = makeWalls(w, h);
      World.add(world, walls);
      width = w;
      height = h;
    };
    window.addEventListener("resize", onResize);

    return () => {
      io.disconnect();
      clearTimeout(fallback);
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      Composite.clear(world, false);
      Engine.clear(engine);
    };
  }, [CARD]);

  return (
    <section
      id="skills"
      className="relative flex min-h-screen flex-col px-6 py-16"
    >
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-4xl font-bold tracking-tight sm:text-6xl">
          Skills <span className="gradient-text">Playground</span>
        </h2>
        <p className="mt-4 text-center text-lg text-white/55">
          Drag, throw, and watch them bounce. Nothing escapes!
        </p>
      </div>

      {/* Physics arena — fills the remaining viewport height */}
      <div
        ref={sceneRef}
        className="relative mx-auto mt-10 w-full max-w-7xl flex-1 min-h-[420px] overflow-hidden rounded-3xl"
      >
        {playgroundSkills.map((skill, i) => (
          <div
            key={skill.name}
            ref={(el) => (cardRefs.current[i] = el)}
            className="absolute left-0 top-0 flex cursor-grab select-none flex-col items-center justify-center gap-1.5 rounded-2xl shadow-2xl active:cursor-grabbing sm:gap-2 sm:rounded-3xl"
            style={{
              width: CARD,
              height: CARD,
              background: skill.bg,
              color: skill.fg,
              willChange: "transform",
            }}
          >
            {skill.img ? (
              <img
                src={skill.img}
                alt={skill.name}
                draggable={false}
                style={{
                  width: CARD * 0.36,
                  height: CARD * 0.36,
                  objectFit: "contain",
                }}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <skill.Icon style={{ fontSize: CARD * 0.3 }} />
            )}
            <span
              className="font-bold"
              style={{ fontSize: Math.max(10, CARD * 0.11) }}
            >
              {skill.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
