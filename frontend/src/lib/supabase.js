import { createClient } from "@supabase/supabase-js";

// Vite exposes env vars prefixed with VITE_ to the browser.
// These live in .env (local) and in your host's env settings (production).
const url = import.meta.env.VITE_SUPABASE_URL;
// Supports both the new "publishable" key (sb_publishable_…) and the legacy anon key.
const anonKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY;

// If the keys aren't set yet, `supabase` is null and the app quietly falls
// back to the static content in src/data.js — so the site never breaks.
export const supabase = url && anonKey ? createClient(url, anonKey) : null;
