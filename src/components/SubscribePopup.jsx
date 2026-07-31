import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const DISMISS_KEY = "blog-sub-dismissed";
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** A one-time popup on blog pages inviting the visitor to subscribe by email. */
export default function SubscribePopup() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | done | error
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      /* ignore */
    }
    if (dismissed) return;
    const t = setTimeout(() => setShow(true), 2500);
    return () => clearTimeout(t);
  }, []);

  const remember = () => {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  const close = () => {
    setShow(false);
    remember();
  };

  const subscribe = async (e) => {
    e.preventDefault();
    if (!emailRe.test(email)) {
      setStatus("error");
      setMsg("Enter a valid email.");
      return;
    }
    setStatus("sending");
    setMsg("");
    try {
      if (!supabase) throw new Error("Service not configured.");
      const { data, error } = await supabase.functions.invoke("subscribe-blog", {
        body: { email },
      });
      if (error || !data?.success)
        throw new Error(data?.error || "Could not subscribe.");
      setStatus("done");
      remember();
      setTimeout(() => setShow(false), 2600);
    } catch (err) {
      setStatus("error");
      setMsg(err.message || "Could not subscribe.");
    }
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[90] w-[calc(100%-2rem)] max-w-sm">
      <div className="glass relative rounded-2xl p-5 shadow-2xl">
        <button
          onClick={close}
          aria-label="Dismiss"
          className="absolute right-3 top-2 text-xl leading-none text-white/40 hover:text-white"
        >
          ×
        </button>

        {status === "done" ? (
          <div className="text-center">
            <div className="text-3xl">✓</div>
            <p className="mt-2 font-semibold text-white">You&rsquo;re subscribed!</p>
            <p className="mt-1 text-sm text-white/60">
              We&rsquo;ll email you when a new post goes live.
            </p>
          </div>
        ) : (
          <form onSubmit={subscribe}>
            <h3 className="pr-6 text-lg font-bold text-white">
              Get new posts by email
            </h3>
            <p className="mt-1 text-sm text-white/60">
              Want a heads-up when a new blog goes live? Subscribe below.
            </p>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-3 w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-white outline-none focus:border-neon-purple"
            />
            <div className="mt-3 flex gap-2">
              <button
                type="submit"
                disabled={status === "sending"}
                className="flex-1 rounded-xl bg-gradient-btn py-2.5 text-sm font-semibold text-base disabled:opacity-60"
              >
                {status === "sending" ? "Subscribing…" : "Subscribe"}
              </button>
              <button
                type="button"
                onClick={close}
                className="rounded-xl px-3 py-2.5 text-sm text-white/60 hover:text-white"
              >
                No thanks
              </button>
            </div>
            {status === "error" && (
              <p className="mt-2 text-xs text-red-400">{msg}</p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
