import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiDownload, FiFileText, FiLock, FiUser } from "react-icons/fi";
import Background from "../components/Background";
import Footer from "../components/Footer";
import AuthModal from "../components/AuthModal";
import { useContent } from "../lib/ContentContext";
import { useAuth } from "../lib/AuthContext";
import { supabase } from "../lib/supabase";

// Free files live in the public "media" bucket. For Supabase public URLs we
// append ?download so the browser saves the file instead of previewing it.
function downloadHref(r) {
  if (!r.fileUrl || r.fileUrl === "#") return "#";
  if (r.fileUrl.includes("/storage/v1/object/public/")) {
    const sep = r.fileUrl.includes("?") ? "&" : "?";
    return `${r.fileUrl}${sep}download=${encodeURIComponent(r.fileName || "")}`;
  }
  return r.fileUrl;
}

// Load Razorpay's checkout script once, on demand.
function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

/** Full page at /resources — shares the same chrome style as the blog pages. */
export default function ResourcesPage() {
  const { profile, resources } = useContent();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [busyId, setBusyId] = useState(null);
  const [err, setErr] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [pending, setPending] = useState(null); // resource awaiting login

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };

  // Paid flow: (login) → create order → Razorpay checkout → verify → download.
  // `force` skips the client-side login check for the post-login resume, where
  // the `user` state may not have refreshed yet (the server still enforces auth).
  const buyResource = async (r, force = false) => {
    if (!supabase || busyId) return;
    // Login is required before buying — open the sign-in modal, resume after.
    if (!user && !force) {
      setPending(r);
      setAuthOpen(true);
      return;
    }
    setErr("");
    setBusyId(r.id);
    try {
      const { data: order, error } = await supabase.functions.invoke("create-order", {
        body: { resourceId: r.id },
      });
      if (error || !order?.success)
        throw new Error(order?.error || "Could not start the payment.");

      const ok = await loadRazorpay();
      if (!ok) throw new Error("Could not load the payment gateway.");

      const rzp = new window.Razorpay({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amount,
        currency: order.currency,
        name: profile.name,
        description: order.title || r.title,
        theme: { color: "#6EE7F9" },
        modal: { ondismiss: () => setBusyId(null) },
        handler: async (resp) => {
          try {
            const { data: verify, error: vErr } = await supabase.functions.invoke(
              "verify-payment",
              {
                body: {
                  resourceId: r.id,
                  razorpay_order_id: resp.razorpay_order_id,
                  razorpay_payment_id: resp.razorpay_payment_id,
                  razorpay_signature: resp.razorpay_signature,
                  email: resp.email || null,
                },
              }
            );
            if (vErr || !verify?.success)
              throw new Error(verify?.error || "Payment verification failed.");
            // Open the short-lived signed download URL.
            window.open(verify.url, "_blank", "noopener,noreferrer");
          } catch (e) {
            setErr(e.message || "Something went wrong after payment.");
          } finally {
            setBusyId(null);
          }
        },
      });
      rzp.open();
    } catch (e) {
      setErr(e.message || "Could not start the payment.");
      setBusyId(null);
    }
  };

  return (
    <div className="relative min-h-screen">
      <Background />

      <header className="fixed inset-x-0 top-0 z-50">
        <nav className="glass mx-auto flex max-w-6xl items-center justify-between rounded-b-2xl px-6 py-4">
          <button
            onClick={goBack}
            className="flex items-center gap-1 text-sm text-white/70 transition-colors hover:text-white"
          >
            ← Back
          </button>
          <Link to="/" className="text-lg font-bold">
            <span className="gradient-text">{profile.name}</span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link
              to="/account"
              className="flex items-center gap-1.5 text-white/70 transition-colors hover:text-white"
            >
              <FiUser /> <span className="hidden sm:inline">My Library</span>
            </Link>
            {user ? (
              <button
                onClick={signOut}
                className="text-white/50 transition-colors hover:text-white"
              >
                Sign out
              </button>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="text-white/70 transition-colors hover:text-white"
              >
                Sign in
              </button>
            )}
          </div>
        </nav>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-32">
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold tracking-tight text-white sm:text-6xl"
        >
          <span className="gradient-text">Resources</span>
        </motion.h1>
        <p className="mt-3 max-w-2xl text-lg text-white/55">
          Cheat sheets, templates and notes I&rsquo;ve put together — some free,
          some premium. Grab whatever helps you build faster.
        </p>

        {err && (
          <p className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {err}
          </p>
        )}

        {(!resources || resources.length === 0) && (
          <p className="mt-12 text-white/40">Nothing here yet — check back soon.</p>
        )}

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {resources?.map((r, i) => (
            <ResourceCard
              key={(r.id ?? r.title) + "" + i}
              resource={r}
              index={i}
              busy={busyId === r.id}
              onBuy={buyResource}
            />
          ))}
        </div>
      </main>

      <Footer />

      <AuthModal
        open={authOpen}
        onClose={() => {
          setAuthOpen(false);
          setPending(null);
        }}
        onSuccess={() => {
          setAuthOpen(false);
          // Resume the purchase they clicked before logging in.
          const r = pending;
          setPending(null);
          if (r) setTimeout(() => buyResource(r, true), 0);
        }}
      />
    </div>
  );
}

function ResourceCard({ resource, index, busy, onBuy }) {
  const r = resource;
  const href = downloadHref(r);
  const disabled = href === "#";

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.08 }}
      className="glass flex flex-col rounded-3xl p-6 text-left transition-transform hover:-translate-y-1"
    >
      {r.coverImage ? (
        <img
          src={r.coverImage}
          alt=""
          className="mb-5 h-40 w-full rounded-2xl border border-white/10 object-cover"
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
      ) : (
        <div className="mb-5 flex h-40 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-5xl text-neon-cyan">
          <FiFileText />
        </div>
      )}

      {r.category && (
        <span className="mb-2 w-fit rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/70">
          {r.category}
        </span>
      )}

      <h3 className="text-xl font-bold text-white">{r.title}</h3>
      {r.description && (
        <p className="mt-2 flex-1 text-sm leading-relaxed text-white/55">
          {r.description}
        </p>
      )}

      {r.isPaid ? (
        <button
          onClick={() => onBuy(r)}
          disabled={busy}
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-btn py-3 text-sm font-semibold text-base shadow-[0_0_25px_rgba(110,231,249,0.35)] transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          <FiLock /> {busy ? "Processing…" : `Buy ₹${r.price}`}
        </button>
      ) : (
        <a
          href={href}
          download={r.fileName || true}
          aria-disabled={disabled}
          className={`mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-btn py-3 text-sm font-semibold text-base shadow-[0_0_25px_rgba(110,231,249,0.35)] transition-transform hover:scale-[1.02] ${
            disabled ? "pointer-events-none opacity-50" : ""
          }`}
        >
          <FiDownload /> {disabled ? "Coming soon" : "Download"}
        </a>
      )}
    </motion.div>
  );
}
