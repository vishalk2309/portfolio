import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiBookmark,
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiFileText,
  FiGrid,
  FiList,
  FiLock,
  FiSearch,
  FiUnlock,
  FiUser,
  FiX,
} from "react-icons/fi";
import Background from "../components/Background";
import Footer from "../components/Footer";
import AuthModal from "../components/AuthModal";
import ResourceRulesBanner from "../components/ResourceRulesBanner";
import RequestAccessModal from "../components/RequestAccessModal";
import { useAccessRequests } from "../hooks/useAccessRequests";
import { useBookmarks } from "../hooks/useBookmarks";
import { useContent } from "../lib/ContentContext";
import { useAuth } from "../lib/AuthContext";
import { supabase } from "../lib/supabase";

// Resources loaded from data.js have no `id`, so bookmarks key off the title
// as a fallback — stable enough to survive a reload.
const bookmarkKey = (r) => String(r?.id ?? r?.title ?? "");

const SORTS = [
  { value: "default", label: "Default order" },
  { value: "name-asc", label: "Name (A → Z)" },
  { value: "name-desc", label: "Name (Z → A)" },
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "price-asc", label: "Free first" },
  { value: "price-desc", label: "Premium first" },
];

// A resource is one of three tiers. `accessType` is authoritative; fall back to
// the legacy boolean for content coming from data.js or a pre-migration DB.
const tierOf = (r) => r.accessType || (r.isPaid ? "paid" : "free");
// Ranks the tiers for the free-first / premium-first sorts.
const TIER_RANK = { free: 0, request: 1, paid: 2 };

const VIEW_KEY = "resourcesView";

// Spelled out rather than built as `line-clamp-${n}` so Tailwind's scanner can
// actually find these class names in the source.
const CLAMP = { 2: "line-clamp-2", 3: "line-clamp-3" };

// Free files live in the public "media" bucket. For Supabase public URLs we
// append ?download so the browser saves the file instead of previewing it.
function hrefFor(url, name) {
  if (!url || url === "#") return "#";
  if (url.includes("/storage/v1/object/public/")) {
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}download=${encodeURIComponent(name || "")}`;
  }
  return url;
}
const downloadHref = (r) => hrefFor(r.fileUrl, r.fileName);

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
  const [ownedIds, setOwnedIds] = useState(() => new Set()); // resources the user bought

  // ---- browse controls (search / sort / view / bookmarks) -----------------
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("default");
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);
  const [view, setView] = useState(() => {
    try {
      return localStorage.getItem(VIEW_KEY) === "list" ? "list" : "grid";
    } catch {
      return "grid";
    }
  });
  const { ids: bookmarkIds, toggle: toggleBookmark } = useBookmarks();

  // Request-only resources: this visitor's own request status per resource.
  const {
    statuses: requestStatus,
    reload: reloadRequests,
    setStatus: setRequestStatus,
  } = useAccessRequests(user);
  const [requestFor, setRequestFor] = useState(null); // resource in the modal
  const [pendingRequest, setPendingRequest] = useState(null); // awaiting login

  // Remember the layout they picked for their next visit.
  useEffect(() => {
    try {
      localStorage.setItem(VIEW_KEY, view);
    } catch {
      /* storage blocked — the choice just won't persist */
    }
  }, [view]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = (resources || []).filter((r) => {
      if (onlyBookmarked && !bookmarkIds.has(bookmarkKey(r))) return false;
      if (!q) return true;
      // Match the resource's own text plus the names of files inside a folder.
      const haystack = [
        r.title,
        r.description,
        r.category,
        r.fileName,
        ...(r.files || []).map((f) => f.label),
      ];
      return haystack.some((s) => s && String(s).toLowerCase().includes(q));
    });

    const byName = (a, b) =>
      String(a.title || "").localeCompare(String(b.title || ""), undefined, {
        sensitivity: "base",
      });
    const time = (r) => (r.createdAt ? new Date(r.createdAt).getTime() || 0 : 0);
    // Group by tier (free → on request → paid) rather than by raw price, so
    // request-only items don't get lumped in with the free ones by a null price.
    const tierRank = (r) => TIER_RANK[tierOf(r)] ?? 0;
    const amount = (r) => (Number(r.price) > 0 ? Number(r.price) : 0);

    switch (sort) {
      case "name-asc":
        return [...list].sort(byName);
      case "name-desc":
        return [...list].sort((a, b) => byName(b, a));
      case "newest":
        return [...list].sort((a, b) => time(b) - time(a));
      case "oldest":
        return [...list].sort((a, b) => time(a) - time(b));
      case "price-asc":
        return [...list].sort(
          (a, b) =>
            tierRank(a) - tierRank(b) || amount(a) - amount(b) || byName(a, b)
        );
      case "price-desc":
        return [...list].sort(
          (a, b) =>
            tierRank(b) - tierRank(a) || amount(b) - amount(a) || byName(a, b)
        );
      default:
        return list; // already in the admin's sort_order
    }
  }, [resources, query, sort, onlyBookmarked, bookmarkIds]);

  const bookmarkedCount = (resources || []).filter((r) =>
    bookmarkIds.has(bookmarkKey(r))
  ).length;
  const filtering = query.trim() !== "" || onlyBookmarked;

  // Load which resources the logged-in user already owns (RLS returns only
  // their own purchases), so we can show Download instead of Buy.
  useEffect(() => {
    if (!supabase || !user) {
      setOwnedIds(new Set());
      return;
    }
    let cancelled = false;
    supabase
      .from("purchases")
      .select("resource_id")
      .then(({ data }) => {
        if (!cancelled)
          setOwnedIds(new Set((data || []).map((p) => p.resource_id)));
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };

  // Download a resource the user already owns.
  const downloadOwned = async (r) => {
    if (busyId) return;
    // A folder has many files → send them to their library to pick each one.
    if (r.files && r.files.length > 0) {
      navigate("/account");
      return;
    }
    setErr("");
    setBusyId(r.id);
    try {
      const { data, error } = await supabase.functions.invoke("get-download", {
        body: { resourceId: r.id },
      });
      if (error || !data?.success)
        throw new Error(data?.error || "Could not prepare the download.");
      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch (e) {
      setErr(e.message || "Something went wrong.");
    } finally {
      setBusyId(null);
    }
  };

  // Request-only flow: (login) → reason form → owner approves → My Library.
  // `force` mirrors buyResource: skip the client-side login check when resuming
  // straight after a sign-in, where `user` may not have refreshed yet.
  const requestAccess = (r, force = false) => {
    if (!user && !force) {
      setPendingRequest(r);
      setAuthOpen(true);
      return;
    }
    setErr("");
    setRequestFor(r);
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
      if (error || !order?.success) {
        // Surface the real reason from the function's response when possible.
        let m = order?.error;
        if (!m && error?.context?.json) {
          try {
            m = (await error.context.json())?.error;
          } catch {
            /* ignore */
          }
        }
        throw new Error(m || "Could not start the payment.");
      }

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
            // Payment done — send them to their library, which lists every
            // file of the resource (works for single files and folders).
            navigate("/account");
          } catch (e) {
            setErr(e.message || "Something went wrong after payment.");
          } finally {
            setBusyId(null);
          }
        },
      });
      // Surface a real failure (declined card, etc.) to the user.
      rzp.on("payment.failed", (resp) => {
        setErr(
          resp?.error?.description || "Payment failed. Please try again."
        );
        setBusyId(null);
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

        <div className="mt-8">
          <ResourceRulesBanner />
        </div>

        {err && (
          <p className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {err}
          </p>
        )}

        {/* ---- search / sort / bookmarks / layout ---- */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <label className="glass relative flex min-w-[13rem] flex-1 items-center gap-2 rounded-2xl px-4 py-2.5">
            <FiSearch className="shrink-0 text-white/40" />
            <span className="sr-only">Search resources by name</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name…"
              className="w-full bg-transparent text-sm text-white placeholder-white/35 outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label="Clear the search"
                className="shrink-0 text-white/40 transition-colors hover:text-white"
              >
                <FiX />
              </button>
            )}
          </label>

          <label className="glass flex items-center gap-2 rounded-2xl px-4 py-2.5">
            <span className="text-xs uppercase tracking-wide text-white/40">
              Sort
            </span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort resources"
              className="bg-transparent text-sm text-white outline-none"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value} className="bg-base text-white">
                  {s.label}
                </option>
              ))}
            </select>
          </label>

          <button
            onClick={() => setOnlyBookmarked((v) => !v)}
            aria-pressed={onlyBookmarked}
            className={`flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-medium transition-colors ${
              onlyBookmarked
                ? "border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan"
                : "glass text-white/70 hover:text-white"
            }`}
          >
            <FiBookmark className={onlyBookmarked ? "fill-current" : ""} />
            Saved
            <span className="text-xs text-white/40">({bookmarkedCount})</span>
          </button>

          <div className="glass flex items-center gap-1 rounded-2xl p-1">
            {[
              { key: "grid", Icon: FiGrid, label: "Grid view" },
              { key: "list", Icon: FiList, label: "List view" },
            ].map(({ key, Icon, label }) => (
              <button
                key={key}
                onClick={() => setView(key)}
                aria-label={label}
                aria-pressed={view === key}
                title={label}
                className={`rounded-xl p-2.5 transition-colors ${
                  view === key
                    ? "bg-white/15 text-white"
                    : "text-white/40 hover:text-white"
                }`}
              >
                <Icon />
              </button>
            ))}
          </div>
        </div>

        {!!resources?.length && (
          <p className="mt-4 text-sm text-white/40">
            {visible.length} of {resources.length}{" "}
            {resources.length === 1 ? "resource" : "resources"}
            {onlyBookmarked && " · saved only"}
          </p>
        )}

        {(!resources || resources.length === 0) && (
          <p className="mt-12 text-white/40">Nothing here yet — check back soon.</p>
        )}

        {/* Filters matched nothing — offer a way back rather than a blank grid. */}
        {!!resources?.length && visible.length === 0 && filtering && (
          <div className="mt-12 text-white/50">
            <p>
              {onlyBookmarked && !query.trim()
                ? "You haven't saved any resources yet — tap the bookmark icon on a card."
                : `No resources match “${query.trim()}”.`}
            </p>
            <button
              onClick={() => {
                setQuery("");
                setOnlyBookmarked(false);
              }}
              className="mt-3 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              Clear filters
            </button>
          </div>
        )}

        <div
          className={
            view === "grid"
              ? "mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              : "mt-8 flex flex-col gap-4"
          }
        >
          {visible.map((r, i) => (
            <ResourceCard
              key={bookmarkKey(r) + "" + i}
              resource={r}
              index={i}
              view={view}
              busy={busyId === r.id}
              owned={ownedIds.has(r.id)}
              bookmarked={bookmarkIds.has(bookmarkKey(r))}
              onToggleBookmark={() => toggleBookmark(bookmarkKey(r))}
              requestStatus={requestStatus[r.id]}
              onRequestAccess={requestAccess}
              onBuy={buyResource}
              onDownloadOwned={downloadOwned}
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
          setPendingRequest(null);
        }}
        onSuccess={() => {
          setAuthOpen(false);
          // Resume whichever action they clicked before logging in.
          const buy = pending;
          const ask = pendingRequest;
          setPending(null);
          setPendingRequest(null);
          if (buy) setTimeout(() => buyResource(buy, true), 0);
          else if (ask) setTimeout(() => requestAccess(ask, true), 0);
        }}
      />

      <RequestAccessModal
        open={!!requestFor}
        resource={requestFor}
        defaultName={user?.user_metadata?.name || ""}
        onClose={() => setRequestFor(null)}
        onDone={(status) => {
          // Flip the card immediately, then re-read from the DB to be sure.
          if (requestFor?.id != null) setRequestStatus(requestFor.id, status);
          setRequestFor(null);
          reloadRequests();
        }}
      />
    </div>
  );
}

/**
 * Description text cut to `lines`, with a Read more / Show less toggle that
 * only appears when the text is genuinely being cut off — so short blurbs don't
 * get a pointless button. Overflow is re-measured on resize, since how many
 * lines a description takes depends on the card's width.
 */
function ClampedText({ text, lines = 3, className = "" }) {
  const ref = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // While expanded the box fits its content by definition, so there's nothing
    // to measure — keep the last known answer so the toggle doesn't vanish.
    if (expanded) return;
    const measure = () => setOverflowing(el.scrollHeight > el.clientHeight + 1);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text, lines, expanded]);

  return (
    <div className={className}>
      <p ref={ref} className={expanded ? "" : CLAMP[lines] || CLAMP[3]}>
        {text}
      </p>
      {overflowing && (
        <button
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
          className="mt-1 text-xs font-semibold text-neon-cyan transition-opacity hover:opacity-75"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}

/** Save/unsave toggle — a filled icon means saved. */
function BookmarkButton({ bookmarked, onToggle, title }) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={bookmarked}
      aria-label={
        bookmarked ? `Remove ${title} from saved` : `Save ${title} for later`
      }
      title={bookmarked ? "Remove from saved" : "Save for later"}
      className={`rounded-full border p-2 backdrop-blur transition-colors ${
        bookmarked
          ? "border-neon-cyan/50 bg-neon-cyan/15 text-neon-cyan"
          : "border-white/15 bg-black/25 text-white/60 hover:text-white"
      }`}
    >
      <FiBookmark className={bookmarked ? "fill-current" : ""} />
    </button>
  );
}

function ResourceCard({
  resource,
  index,
  view = "grid",
  busy,
  owned,
  bookmarked,
  onToggleBookmark,
  requestStatus,
  onRequestAccess,
  onBuy,
  onDownloadOwned,
}) {
  const r = resource;
  const href = downloadHref(r);
  const disabled = href === "#";
  // A paid item is only buyable if it actually has a positive price.
  const priceValid = r.price != null && Number(r.price) > 0;
  // Free "folder" files (each has a public URL).
  const freeFiles = (r.files || []).filter((f) => f.fileUrl);
  const list = view === "list";
  const tier = tierOf(r);
  const gated = tier === "request";

  const cover = r.coverImage ? (
    <img
      src={r.coverImage}
      alt=""
      className={
        list
          ? "h-24 w-24 shrink-0 rounded-2xl border border-white/10 object-cover sm:h-28 sm:w-40"
          : "h-40 w-full rounded-2xl border border-white/10 object-cover"
      }
      onError={(e) => (e.currentTarget.style.display = "none")}
    />
  ) : (
    <div
      className={`flex shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-neon-cyan ${
        list ? "h-24 w-24 text-3xl sm:h-28 sm:w-40" : "h-40 w-full text-5xl"
      }`}
    >
      <FiFileText />
    </div>
  );

  // In list view the actions sit in their own right-hand column, so they don't
  // need the top margin that separates them from the description in a card.
  const gap = list ? "" : "mt-5";
  const primaryBtn = `${gap} inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-btn py-3 text-sm font-semibold text-base shadow-[0_0_25px_rgba(110,231,249,0.35)] transition-transform hover:scale-[1.02]`;

  const actions = gated ? (
    // ---- request-only: the button reflects where their request stands ----
    requestStatus === "approved" ? (
      <button
        onClick={() => onDownloadOwned(r)}
        disabled={busy}
        className={`${primaryBtn} disabled:opacity-60`}
      >
        <FiUnlock /> {busy ? "Preparing…" : "Download (Granted)"}
      </button>
    ) : requestStatus === "pending" ? (
      <button
        disabled
        title="I'll email you once I've reviewed it"
        className={`${gap} inline-flex w-full cursor-default items-center justify-center gap-2 rounded-2xl border border-amber-400/30 bg-amber-400/10 py-3 text-sm font-semibold text-amber-300`}
      >
        <FiClock /> Request pending
      </button>
    ) : requestStatus === "declined" ? (
      <div className={`${gap} flex flex-col gap-2`}>
        <span className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 py-2.5 text-sm font-medium text-white/50">
          Request declined
        </span>
        <button
          onClick={() => onRequestAccess(r)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
        >
          Ask again
        </button>
      </div>
    ) : (
      <button onClick={() => onRequestAccess(r)} className={primaryBtn}>
        <FiLock /> Request access
      </button>
    )
  ) : r.isPaid && owned ? (
    // Already purchased → let them download instead of buying again.
    <button
      onClick={() => onDownloadOwned(r)}
      disabled={busy}
      className={`${primaryBtn} disabled:opacity-60`}
    >
      <FiDownload /> {busy ? "Preparing…" : "Download (Owned)"}
    </button>
  ) : r.isPaid && priceValid ? (
    <button
      onClick={() => onBuy(r)}
      disabled={busy}
      className={`${primaryBtn} disabled:opacity-60`}
    >
      <FiLock /> {busy ? "Processing…" : `Buy ₹${r.price}`}
    </button>
  ) : r.isPaid && !priceValid ? (
    // Marked paid but no valid price set → don't render a broken "₹null".
    <button
      disabled
      className={`${gap} inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 py-3 text-sm font-semibold text-white/50`}
    >
      <FiLock /> Unavailable
    </button>
  ) : freeFiles.length > 0 ? (
    // Free "folder" — list every file to download.
    <div className={`${gap} flex flex-col gap-2`}>
      {freeFiles.map((f) => (
        <a
          key={f.id}
          href={hrefFor(f.fileUrl, f.label)}
          download={f.label || true}
          className="inline-flex items-center justify-between gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
        >
          <span className="truncate">{f.label || "File"}</span>
          <FiDownload className="shrink-0 text-neon-cyan" />
        </a>
      ))}
    </div>
  ) : (
    <a
      href={href}
      download={r.fileName || true}
      aria-disabled={disabled}
      className={`${primaryBtn} ${disabled ? "pointer-events-none opacity-50" : ""}`}
    >
      <FiDownload /> {disabled ? "Coming soon" : "Download"}
    </a>
  );

  // Category chip, plus a tier chip for request-only items so it's obvious
  // before clicking that this one isn't an instant download.
  const tags = (r.category || gated) && (
    <span className="flex flex-wrap items-center gap-2">
      {r.category && (
        <span className="w-fit rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/70">
          {r.category}
        </span>
      )}
      {gated && (
        <span
          className={`flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
            requestStatus === "approved"
              ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
              : "border-neon-cyan/40 bg-neon-cyan/10 text-neon-cyan"
          }`}
        >
          {requestStatus === "approved" ? (
            <>
              <FiCheckCircle /> Access granted
            </>
          ) : (
            <>
              <FiLock /> On request
            </>
          )}
        </span>
      )}
    </span>
  );

  // ---- list view: thumbnail | text | actions, side by side ----
  if (list) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.4, delay: Math.min(index, 6) * 0.05 }}
        className="glass flex flex-col gap-5 rounded-3xl p-5 text-left sm:flex-row sm:items-center"
      >
        {cover}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {tags}
              <h3 className="mt-1.5 text-lg font-bold text-white">{r.title}</h3>
            </div>
            <div className="shrink-0 sm:hidden">
              <BookmarkButton
                bookmarked={bookmarked}
                onToggle={onToggleBookmark}
                title={r.title}
              />
            </div>
          </div>
          {r.description && (
            <ClampedText
              text={r.description}
              lines={2}
              className="mt-1.5 text-sm leading-relaxed text-white/55"
            />
          )}
        </div>

        <div className="flex shrink-0 items-center gap-3 sm:w-56">
          <div className="hidden shrink-0 sm:block">
            <BookmarkButton
              bookmarked={bookmarked}
              onToggle={onToggleBookmark}
              title={r.title}
            />
          </div>
          <div className="min-w-0 flex-1">{actions}</div>
        </div>
      </motion.div>
    );
  }

  // ---- grid view (default card) ----
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.08 }}
      className="glass relative flex flex-col rounded-3xl p-6 text-left transition-transform hover:-translate-y-1"
    >
      <div className="absolute right-4 top-4 z-10">
        <BookmarkButton
          bookmarked={bookmarked}
          onToggle={onToggleBookmark}
          title={r.title}
        />
      </div>

      <div className="mb-5">{cover}</div>

      {tags && <div className="mb-2">{tags}</div>}

      <h3 className="text-xl font-bold text-white">{r.title}</h3>
      {r.description && (
        <ClampedText
          text={r.description}
          lines={3}
          className="mt-2 text-sm leading-relaxed text-white/55"
        />
      )}

      {/* The description used to be flex-1 to push the buttons down, but a
          stretched box breaks the clamp overflow measurement — mt-auto keeps
          them pinned to the card's bottom edge instead. */}
      <div className="mt-auto">{actions}</div>
    </motion.div>
  );
}
