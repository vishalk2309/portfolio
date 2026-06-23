import { useEffect } from "react";
import Lenis from "lenis";
import Background from "./components/Background";
import CursorTrail from "./components/CursorTrail";
import CommandPalette from "./components/CommandPalette";
import FloatingThemeButton from "./components/FloatingThemeButton";
import Loader from "./components/Loader";
import ScrollProgress from "./components/ScrollProgress";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Experience from "./components/Experience";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Certificates from "./components/Certificates";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

export default function App() {
  // Lenis smooth scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    // expose for the command palette to drive smooth navigation
    window.__lenis = lenis;

    let raf;
    const loop = (time) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // Handle all link clicks:
    //  - "#section" links scroll smoothly via Lenis (same tab)
    //  - external http(s) links open in a new tab
    //  - everything else (mailto:, etc.) keeps default behaviour
    const onClick = (e) => {
      const link = e.target.closest("a");
      if (!link) return;
      const href = link.getAttribute("href") || "";

      if (href.startsWith("#")) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          lenis.scrollTo(target, { offset: -70 });
        }
        return;
      }

      if (/^https?:\/\//i.test(href)) {
        e.preventDefault();
        window.open(href, "_blank", "noopener,noreferrer");
      }
    };
    document.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("click", onClick);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="relative min-h-screen">
      <Loader />
      <ScrollProgress />
      <Background />
      <CursorTrail />
      <CommandPalette />
      <FloatingThemeButton />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Experience />
        <Skills />
        <Projects />
        <Certificates />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
