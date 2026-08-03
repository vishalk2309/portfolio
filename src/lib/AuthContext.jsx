import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase";

/**
 * Tracks the current Supabase Auth session for the PUBLIC site (buyers).
 * The same session also powers the owner's admin login — the admin area
 * additionally checks the email against the owner allowlist.
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setReady(true);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setUser(s?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const value = {
    user,
    ready,
    signOut: () => supabase?.auth.signOut(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Safe default if used outside a provider — never throws.
export function useAuth() {
  return (
    useContext(AuthContext) || { user: null, ready: true, signOut: () => {} }
  );
}
