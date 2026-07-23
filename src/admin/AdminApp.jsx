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

  return session ? <Dashboard session={session} /> : <Login />;
}

function Shell({ children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-base px-6">
      {children}
    </div>
  );
}
