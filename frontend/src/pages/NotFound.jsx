import { useSEO } from "../hooks/useSEO";

export default function NotFound() {
  useSEO({
    title: "Page Not Found (404) - Vishal Kushwaha",
    description: "The page you're looking for doesn't exist. Navigate back to explore my portfolio.",
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-base px-6">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">Page Not Found</h1>
        <p className="text-xl text-white/80 mb-8">The page you're looking for doesn't exist. Let's get you back on track.</p>
        <a
          href="/"
          className="inline-block rounded-lg bg-gradient-btn px-6 py-3 text-white font-semibold hover:opacity-90 transition"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}
