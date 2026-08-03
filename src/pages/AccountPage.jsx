import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiDownload, FiLogOut } from "react-icons/fi";
import Background from "../components/Background";
import Footer from "../components/Footer";
import AuthModal from "../components/AuthModal";
import { useContent } from "../lib/ContentContext";
import { useAuth } from "../lib/AuthContext";
import { supabase } from "../lib/supabase";

/** /account — a buyer's library of purchased resources with re-download. */
export default function AccountPage() {
  const { profile, resources } = useContent();
  const { user, ready, signOut } = useAuth();
  const navigate = useNavigate();

  // Map resource id → resource (so we can list a purchased resource's files).
  const resMap = useMemo(() => {
    const m = {};
    (resources || []).forEach((r) => {
      if (r.id != null) m[r.id] = r;
    });
    return m;
  }, [resources]);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [err, setErr] = useState("");

  // Load this user's purchases (RLS returns only their own).
  useEffect(() => {
    if (!ready) return;
    if (!user) {
      setLoading(false);
      setAuthOpen(true);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("purchases")
        .select("id, created_at, resource_id, resources(title, category, file_name)")
        .order("created_at", { ascending: false });
      if (cancelled) return;
      // De-duplicate by resource (keep the most recent purchase of each).
      const seen = new Set();
      const unique = [];
      for (const p of data || []) {
        if (!p.resource_id || seen.has(p.resource_id)) continue;
        seen.add(p.resource_id);
        unique.push(p);
      }
      setItems(unique);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, ready]);

  // `body` is either { resourceId } (single-file) or { fileId } (one file of a
  // folder). `key` uniquely identifies the clicked button for the busy state.
  const download = async (body, key) => {
    setErr("");
    setBusyId(key);
    try {
      const { data, error } = await supabase.functions.invoke("get-download", {
        body,
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

  return (
    <div className="relative min-h-screen">
      <Background />

      <header className="fixed inset-x-0 top-0 z-50">
        <nav className="glass mx-auto flex max-w-5xl items-center justify-between rounded-b-2xl px-6 py-4">
          <Link to="/resources" className="text-sm text-white/70 hover:text-white">
            ← Resources
          </Link>
          <Link to="/" className="text-lg font-bold">
            <span className="gradient-text">{profile.name}</span>
          </Link>
          {user ? (
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white"
            >
              <FiLogOut /> Sign out
            </button>
          ) : (
            <span className="w-16" />
          )}
        </nav>
      </header>

      <main className="relative z-10 mx-auto max-w-5xl px-6 pb-24 pt-32">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          My <span className="gradient-text">Library</span>
        </h1>
        {user && (
          <p className="mt-2 text-white/55">Signed in as {user.email}</p>
        )}

        {err && (
          <p className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {err}
          </p>
        )}

        {!user && ready && !authOpen && (
          <div className="mt-10">
            <p className="text-white/55">Sign in to see your purchases.</p>
            <button
              onClick={() => setAuthOpen(true)}
              className="mt-4 rounded-full bg-gradient-btn px-6 py-2.5 text-sm font-semibold text-base"
            >
              Sign in
            </button>
          </div>
        )}

        {user && loading && <p className="mt-10 text-white/40">Loading…</p>}

        {user && !loading && items.length === 0 && (
          <div className="mt-10">
            <p className="text-white/55">You haven&rsquo;t purchased anything yet.</p>
            <Link
              to="/resources"
              className="mt-4 inline-block rounded-full border border-white/15 bg-white/5 px-6 py-2.5 text-sm font-semibold text-white hover:scale-105"
            >
              Browse resources
            </Link>
          </div>
        )}

        {user && !loading && items.length > 0 && (
          <div className="mt-10 grid gap-4">
            {items.map((p) => {
              const res = resMap[p.resource_id];
              const files = res?.files || [];
              return (
                <div key={p.id} className="glass rounded-2xl p-5">
                  <div className="mb-1">
                    <p className="font-semibold text-white">
                      {p.resources?.title || res?.title || "Resource"}
                    </p>
                    {(p.resources?.category || res?.category) && (
                      <p className="text-sm text-white/40">
                        {p.resources?.category || res?.category}
                      </p>
                    )}
                  </div>

                  {files.length > 0 ? (
                    // Folder — one download per file.
                    <div className="mt-3 flex flex-col gap-2">
                      {files.map((f) => {
                        const key = `f${f.id}`;
                        return (
                          <button
                            key={f.id}
                            onClick={() => download({ fileId: f.id }, key)}
                            disabled={busyId === key}
                            className="inline-flex items-center justify-between gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:opacity-60"
                          >
                            <span className="truncate">{f.label || "File"}</span>
                            <FiDownload className="shrink-0 text-neon-cyan" />
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    // Single-file resource.
                    <button
                      onClick={() => download({ resourceId: p.resource_id }, `r${p.resource_id}`)}
                      disabled={busyId === `r${p.resource_id}`}
                      className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-btn px-5 py-2.5 text-sm font-semibold text-base disabled:opacity-60"
                    >
                      <FiDownload />
                      {busyId === `r${p.resource_id}` ? "Preparing…" : "Download"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />

      <AuthModal
        open={authOpen}
        onClose={() => {
          setAuthOpen(false);
          if (!user) navigate("/resources");
        }}
        onSuccess={() => setAuthOpen(false)}
      />
    </div>
  );
}
