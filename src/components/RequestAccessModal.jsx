import { useEffect, useState } from "react";
import { FiLock, FiX } from "react-icons/fi";
import { supabase } from "../lib/supabase";

/**
 * Asks for a name + reason, then opens an access request through the
 * request-access Edge Function (which emails the owner for approval).
 *
 * `onDone(status)` fires after a successful submit so the resources page can
 * flip the card to "pending" without a reload.
 */
export default function RequestAccessModal({
  open,
  resource,
  defaultName = "",
  onClose,
  onDone,
}) {
  const [name, setName] = useState(defaultName);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  // Reset between openings so a previous error or draft doesn't linger.
  useEffect(() => {
    if (open) {
      setName(defaultName);
      setReason("");
      setErr("");
      setBusy(false);
    }
  }, [open, defaultName]);

  // Escape closes, matching the auth modal.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    if (!reason.trim()) {
      setErr("Please say what you need this for.");
      return;
    }
    setErr("");
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("request-access", {
        body: {
          resourceId: resource?.id,
          reason: reason.trim(),
          name: name.trim(),
        },
      });
      if (error || !data?.success) {
        // Surface the function's own reason when it sent one.
        let m = data?.error;
        if (!m && error?.context?.json) {
          try {
            m = (await error.context.json())?.error;
          } catch {
            /* ignore */
          }
        }
        throw new Error(m || "Could not send your request.");
      }
      onDone?.(data.status || "pending");
    } catch (e2) {
      setErr(e2.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Request access to ${resource?.title || "this resource"}`}
        className="glass relative w-full max-w-md rounded-3xl p-6"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-white/40 transition-colors hover:text-white"
        >
          <FiX />
        </button>

        <div className="mb-1 flex items-center gap-2 text-neon-cyan">
          <FiLock />
          <span className="text-xs font-semibold uppercase tracking-wide">
            Request access
          </span>
        </div>
        <h2 className="text-xl font-bold text-white">{resource?.title}</h2>
        <p className="mt-2 text-sm text-white/55">
          This one is shared on request. Tell me a little about why you need it
          and I&rsquo;ll get back to you by email.
        </p>

        <form onSubmit={submit} className="mt-5 flex flex-col gap-3">
          <label className="text-sm">
            <span className="text-white/60">Your name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Optional"
              className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-white placeholder-white/30 outline-none focus:border-neon-cyan/50"
            />
          </label>

          <label className="text-sm">
            <span className="text-white/60">
              What do you need it for? <span className="text-neon-cyan">*</span>
            </span>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              maxLength={1000}
              required
              placeholder="e.g. I'm preparing for my DBMS semester exam and these notes would really help."
              className="mt-1 w-full resize-y rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-white placeholder-white/30 outline-none focus:border-neon-cyan/50"
            />
          </label>

          {err && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
              {err}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-1 rounded-2xl bg-gradient-btn py-3 text-sm font-semibold text-base shadow-[0_0_25px_rgba(110,231,249,0.35)] transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            {busy ? "Sending…" : "Send request"}
          </button>
        </form>
      </div>
    </div>
  );
}
