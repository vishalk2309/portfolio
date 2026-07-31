import { Link, useNavigate } from "react-router-dom";
import Background from "../components/Background";
import Footer from "../components/Footer";
import SubscribePopup from "../components/SubscribePopup";
import { useContent } from "../lib/ContentContext";

/** Shared chrome for the /blog pages: background, a slim header, and footer. */
export default function BlogLayout({ children }) {
  const { profile } = useContent();
  const navigate = useNavigate();

  // Go back to wherever the visitor came from; fall back to the blog index.
  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/blog");
  };

  return (
    <div className="relative min-h-screen">
      <Background />

      <header className="fixed inset-x-0 top-0 z-50">
        <nav className="glass mx-auto flex max-w-4xl items-center justify-between rounded-b-2xl px-6 py-4">
          <button
            onClick={goBack}
            className="flex items-center gap-1 text-sm text-white/70 transition-colors hover:text-white"
          >
            ← Back
          </button>
          <Link to="/" className="text-lg font-bold">
            <span className="gradient-text">{profile.name}</span>
          </Link>
          <Link
            to="/"
            className="hidden text-sm text-white/70 transition-colors hover:text-white sm:inline"
          >
            Portfolio
          </Link>
        </nav>
      </header>

      <main className="relative z-10 mx-auto max-w-4xl px-6 pb-24 pt-28">
        {children}
      </main>

      <Footer />
      <SubscribePopup />
    </div>
  );
}
