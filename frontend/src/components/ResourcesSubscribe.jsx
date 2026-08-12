import { useState } from "react";
import { supabase } from "../lib/supabase";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ResourcesSubscribe() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | done | error
  const [msg, setMsg] = useState("");

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
      const { data, error } = await supabase.functions.invoke("subscribe-resources", {
        body: { email },
      });
      if (error || !data?.success)
        throw new Error(data?.error || "Could not subscribe.");
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setMsg(err.message || "Could not subscribe.");
    }
  };

  return (
    <div className="glass rounded-3xl p-6 sm:p-8">
      {status === "done" ? (
        <p className="text-center font-semibold text-emerald-400">
          ✓ You&rsquo;re subscribed! We&rsquo;ll email you when new resources are
          added.
        </p>
      ) : (
        <>
          <h3 className="text-xl font-bold text-white">Get Resource Updates</h3>
          <p className="mt-1 text-sm text-white/60">
            Subscribe to be notified when new resources are added — no spam.
          </p>
          <form onSubmit={subscribe} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-neon-purple"
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className="rounded-xl bg-gradient-btn px-6 py-3 font-semibold text-base transition-transform hover:scale-[1.02] disabled:opacity-60"
            >
              {status === "sending" ? "Subscribing…" : "Subscribe"}
            </button>
          </form>
          {status === "error" && (
            <p className="mt-2 text-sm text-red-400">{msg}</p>
          )}
        </>
      )}
    </div>
  );
}
