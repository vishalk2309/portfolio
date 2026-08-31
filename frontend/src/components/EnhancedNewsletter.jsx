import { useState } from "react";
import { FiMail, FiCheck, FiAlertCircle } from "react-icons/fi";
import { supabase } from "../lib/supabase";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EnhancedNewsletter() {
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
      const { data, error } = await supabase.functions.invoke("subscribe-blog", {
        body: { email },
      });
      if (error || !data?.success)
        throw new Error(data?.error || "Could not subscribe.");
      setStatus("done");
      setEmail("");
      setTimeout(() => {
        setStatus("idle");
        setEmail("");
      }, 3000);
    } catch (err) {
      setStatus("error");
      setMsg(err.message || "Could not subscribe.");
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-neon-cyan/10 to-neon-purple/10 border border-white/10 p-8 sm:p-12">
      <div className="absolute inset-0 opacity-20" />
      <div className="relative">
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-btn flex items-center justify-center">
            <FiMail className="text-white text-lg" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">Stay Updated</h3>
            <p className="text-white/60 mt-1">
              Get weekly insights, new posts, and occasional resources straight to your inbox.
            </p>
          </div>
        </div>

        {status === "done" ? (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-400/10 border border-emerald-400/20">
            <FiCheck className="text-emerald-400 flex-shrink-0" />
            <div>
              <p className="font-semibold text-emerald-400">Subscribed!</p>
              <p className="text-sm text-emerald-300">
                Check your email for the welcome message.
              </p>
            </div>
          </div>
        ) : (
          <>
            <form onSubmit={subscribe} className="flex flex-col gap-3 mb-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === "sending"}
                  className="flex-1 rounded-full border border-white/15 bg-white/[0.04] px-5 py-3 text-white placeholder-white/40 outline-none focus:border-neon-cyan disabled:opacity-50 transition-all"
                />
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="rounded-full bg-gradient-btn px-8 py-3 font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60 whitespace-nowrap"
                >
                  {status === "sending" ? "Subscribing…" : "Subscribe"}
                </button>
              </div>
              {status === "error" && (
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <FiAlertCircle className="flex-shrink-0" />
                  {msg}
                </div>
              )}
            </form>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10">
              <div className="text-center">
                <div className="text-2xl font-bold text-neon-cyan">✍️</div>
                <p className="text-xs text-white/60 mt-2">Weekly posts</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-neon-purple">🚀</div>
                <p className="text-xs text-white/60 mt-2">New projects</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-rose-400">💡</div>
                <p className="text-xs text-white/60 mt-2">Resources</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
