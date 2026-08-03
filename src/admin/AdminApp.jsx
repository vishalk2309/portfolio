import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Login from "./Login";
import Dashboard from "./Dashboard";

/**
 * Root of the /admin area. Tracks the Supabase auth session and shows the
 * login screen when logged out, the dashboard when logged in.
 */
export default function AdminApp() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    // current session on mount
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    // keep in sync on login/logout
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!supabase) {
    return (
      <Shell>
        <p className="text-white/70">
          Supabase isn't configured. Add your keys to <code>.env</code> first.
        </p>
      </Shell>
    );
  }

  if (loading) {
    return (
      <Shell>
        <p className="text-white/50">Loading…</p>
      </Shell>
    );
  }

  if (!session) return <Login />;

  // Now that visitors can sign up as buyers, a valid session is NOT enough to
  // reach the dashboard — only the owner's email may. Anything the UI misses is
  // still blocked by the owner-only RLS write policies (buyer-accounts.sql).
  const owner = (
    import.meta.env.VITE_OWNER_EMAIL || "kushwahavishal296@gmail.com"
  ).toLowerCase();
  const email = (session.user?.email || "").toLowerCase();
  if (email !== owner) {
    return (
      <Shell>
        <div className="text-center">
          <p className="text-white/80">
            You&rsquo;re signed in as <b>{email || "a visitor"}</b>, which
            isn&rsquo;t the owner account.
          </p>
          <button
            onClick={() => supabase.auth.signOut()}
            className="mt-4 rounded-lg bg-gradient-btn px-5 py-2.5 text-sm font-semibold text-base"
          >
            Sign out
          </button>
        </div>
      </Shell>
    );
  }

  return <Dashboard session={session} />;
}

function Shell({ children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-base px-6">
      {children}
    </div>
  );
}
