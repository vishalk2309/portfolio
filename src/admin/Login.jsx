import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | error
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setStatus("error");
    }
    // on success, onAuthStateChange in AdminApp swaps to the dashboard
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-base px-6">
      <form
        onSubmit={handleSubmit}
        className="glass w-full max-w-sm rounded-3xl p-8"
      >
        <h1 className="text-2xl font-bold text-white">
          Dashboard <span className="gradient-text">Login</span>
        </h1>
        <p className="mt-2 text-sm text-white/50">
          Sign in to edit your portfolio content.
        </p>

        <label className="mt-6 block text-sm text-white/70">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-neon-purple"
        />

        <label className="mt-4 block text-sm text-white/70">Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-neon-purple"
        />

        {status === "error" && (
          <p className="mt-3 text-sm text-red-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={status === "sending"}
          className="mt-6 w-full rounded-xl bg-gradient-btn py-3 font-semibold text-base disabled:opacity-70"
        >
          {status === "sending" ? "Signing in…" : "Sign in"}
        </button>

        <Link
          to="/"
          className="mt-4 block text-center text-sm text-white/40 hover:text-white"
        >
          ← Back to portfolio
        </Link>
      </form>
    </div>
  );
}
