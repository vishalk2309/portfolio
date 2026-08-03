import { useState } from "react";
import { supabase } from "../lib/supabase";

/**
 * Lets the logged-in owner change their own account password.
 * Uses supabase.auth.updateUser — it applies to whoever is currently signed in.
 */
export default function ChangePassword() {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [status, setStatus] = useState("idle"); // idle | busy
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    if (pw.length < 6) {
      setMsg("❌ Password must be at least 6 characters.");
      return;
    }
    if (pw !== pw2) {
      setMsg("❌ The two passwords don't match.");
      return;
    }
    setStatus("busy");
    const { error } = await supabase.auth.updateUser({ password: pw });
    setStatus("idle");
    if (error) {
      setMsg("❌ " + error.message);
      return;
    }
    setPw("");
    setPw2("");
    setMsg("✅ Password updated. Use it the next time you log in.");
  };

  const inputCls =
    "mt-1 w-full rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-neon-purple";

  return (
    <div className="glass max-w-md rounded-2xl p-5 sm:p-6">
      <h2 className="text-xl font-bold">🔑 Change Password</h2>
      <p className="mt-1 text-sm text-white/50">
        Sets a new password for your admin account.
      </p>

      <form onSubmit={submit} className="mt-5">
        <label className="block text-xs text-white/50">New password</label>
        <input
          type="password"
          autoComplete="new-password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          className={inputCls}
        />

        <label className="mt-4 block text-xs text-white/50">
          Confirm new password
        </label>
        <input
          type="password"
          autoComplete="new-password"
          value={pw2}
          onChange={(e) => setPw2(e.target.value)}
          className={inputCls}
        />

        {msg && (
          <p className="mt-3 rounded-lg bg-white/5 px-3 py-2 text-sm text-white/80">
            {msg}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "busy"}
          className="mt-5 rounded-lg bg-gradient-btn px-5 py-2.5 text-sm font-semibold text-base disabled:opacity-60"
        >
          {status === "busy" ? "Updating…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
