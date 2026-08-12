import { useState } from "react";
import { supabase } from "../lib/supabase";
import { FiBell, FiArrowRight } from "react-icons/fi";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ResourcesSubscribe() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
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
      setEmail("");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      setStatus("error");
      setMsg(err.message || "Could not subscribe.");
    }
  };

  if (status === "done") {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-emerald-400/30 bg-gradient-to-r from-emerald-400/10 to-emerald-500/5 px-6 py-8 sm:px-8 sm:py-10">
        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="relative flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-400/20">
            <FiBell className="text-emerald-400" size={20} />
          </div>
          <div>
            <p className="text-lg font-semibold text-emerald-300">
              ✓ You&rsquo;re all set!
            </p>
            <p className="text-sm text-emerald-300/70">
              We&rsquo;ll email you when new resources are added.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-neon-cyan/20 bg-gradient-to-br from-neon-cyan/10 via-blue-500/5 to-transparent p-6 sm:p-8">
      <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-neon-cyan/10 blur-3xl" />
      <div className="absolute -left-12 -bottom-12 h-32 w-32 rounded-full bg-blue-500/10 blur-2xl" />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="flex items-center gap-2 text-xl font-bold text-white">
              <FiBell size={24} className="text-neon-cyan" />
              Stay Updated
            </h3>
            <p className="mt-2 text-sm text-white/60">
              Get notified when new resources are added to help you build faster.
            </p>
          </div>
        </div>

        <form onSubmit={subscribe} className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white placeholder-white/40 outline-none transition-all focus:border-neon-cyan/50 focus:bg-white/10 focus:ring-1 focus:ring-neon-cyan/20"
          />
          <button
            type="submit"
            disabled={status === "sending"}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl border border-neon-cyan/30 bg-gradient-to-r from-neon-cyan/20 to-neon-cyan/10 px-6 py-3 font-semibold text-neon-cyan transition-all hover:border-neon-cyan/50 hover:from-neon-cyan/30 hover:to-neon-cyan/20 disabled:opacity-60"
          >
            {status === "sending" ? (
              "Subscribing…"
            ) : (
              <>
                Subscribe
                <FiArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {status === "error" && (
          <p className="mt-3 text-sm text-red-400">{msg}</p>
        )}
      </div>
    </div>
  );
}
