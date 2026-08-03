import { useState } from "react";
import { supabase } from "../lib/supabase";

/**
 * Passwordless email-OTP login/signup. Step 1: enter email → Supabase emails a
 * 6-digit code. Step 2: enter the code → logged in (account created on first
 * use). Calls onSuccess() when a session is established.
 *
 * NOTE: for the code (rather than a magic link) to arrive, the Supabase
 * "Magic Link" email template must include the {{ .Token }} variable.
 */
export default function AuthModal({ open, onClose, onSuccess }) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState("email"); // email | code
  const [status, setStatus] = useState("idle"); // idle | busy
  const [err, setErr] = useState("");

  if (!open) return null;

  const sendCode = async (e) => {
    e.preventDefault();
    if (!supabase) return;
    setStatus("busy");
    setErr("");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    });
    setStatus("idle");
    if (error) return setErr(error.message);
    setStep("code");
  };

  const verify = async (e) => {
    e.preventDefault();
    if (!supabase) return;
    setStatus("busy");
    setErr("");
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: "email",
    });
    setStatus("idle");
    if (error) return setErr(error.message);
    onSuccess?.();
    onClose?.();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="glass w-full max-w-sm rounded-3xl p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            {step === "email" ? "Sign in" : "Enter code"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-white/50 hover:text-white"
          >
            ✕
          </button>
        </div>
        <p className="mb-6 text-sm text-white/50">
          {step === "email"
            ? "We'll email you a 6-digit code — no password needed."
            : `Enter the code we sent to ${email}.`}
        </p>

        {step === "email" ? (
          <form onSubmit={sendCode}>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-neon-purple"
            />
            {err && <p className="mt-3 text-sm text-red-400">{err}</p>}
            <button
              type="submit"
              disabled={status === "busy"}
              className="mt-5 w-full rounded-xl bg-gradient-btn py-3 font-semibold text-base disabled:opacity-70"
            >
              {status === "busy" ? "Sending…" : "Send code"}
            </button>
          </form>
        ) : (
          <form onSubmit={verify}>
            <input
              inputMode="numeric"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-center text-lg tracking-[0.4em] text-white outline-none focus:border-neon-purple"
            />
            {err && <p className="mt-3 text-sm text-red-400">{err}</p>}
            <button
              type="submit"
              disabled={status === "busy"}
              className="mt-5 w-full rounded-xl bg-gradient-btn py-3 font-semibold text-base disabled:opacity-70"
            >
              {status === "busy" ? "Verifying…" : "Verify & continue"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setErr("");
              }}
              className="mt-3 w-full text-center text-sm text-white/40 hover:text-white"
            >
              ← Use a different email
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
