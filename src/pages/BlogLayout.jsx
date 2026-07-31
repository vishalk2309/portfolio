import { Link } from "react-router-dom";
import Background from "../components/Background";
import Footer from "../components/Footer";
import { useContent } from "../lib/ContentContext";

/** Shared chrome for the /blog pages: background, a slim header, and footer. */
export default function BlogLayout({ children }) {
  const { profile } = useContent();
  return (
    <div className="relative min-h-screen">
      <Background />

      <header className="fixed inset-x-0 top-0 z-50">
        <nav className="glass mx-auto flex max-w-4xl items-center justify-between rounded-b-2xl px-6 py-4">
          <Link to="/" className="text-lg font-bold">
            <span className="gradient-text">{profile.name}</span>
          </Link>
          <Link
            to="/"
            className="text-sm text-white/70 transition-colors hover:text-white"
          >
            ← Portfolio
          </Link>
        </nav>
      </header>

      <main className="relative z-10 mx-auto max-w-4xl px-6 pb-24 pt-28">
        {children}
      </main>

      <Footer />
    </div>
  );
}
