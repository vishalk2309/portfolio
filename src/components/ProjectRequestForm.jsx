import { useState } from "react";
import { supabase } from "../lib/supabase";

const PROJECT_TYPES = [
  "Website",
  "Web app",
  "Landing page",
  "E-commerce",
  "API / backend",
  "Bug fix / improvement",
  "Other",
];
const BUDGETS = [
  "Under ₹10k",
  "₹10k – ₹25k",
  "₹25k – ₹50k",
  "₹50k – ₹1L",
  "₹1L+",
  "Not sure yet",
];
const TIMELINES = ["ASAP", "1–2 weeks", "~1 month", "2–3 months", "Flexible"];

const field =
  "w-full rounded-2xl border border-white/15 bg-white/[0.04] px-5 py-3.5 text-white placeholder-white/40 outline-none transition-all duration-300 focus:border-neon-purple";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ProjectRequestForm({ ownerEmail }) {
  const [f, setF] = useState({
    name: "",
    email: "",
    project_type: "",
    budget: "",
    timeline: "",
    description: "",
    tech_stack: "",
    features: "",
    additional_features: "",
    code: "",
    botcheck: false,
  });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const [otp, setOtp] = useState({ status: "idle", msg: "" }); // idle|sending|sent|error
  const [sub, setSub] = useState({ status: "idle", msg: "" }); // idle|submitting|success|error

  const emailValid = emailRe.test(f.email);
  const verified = otp.status === "sent";

  const sendCode = async () => {
    if (!emailValid) {
      setOtp({ status: "error", msg: "Enter a valid email first." });
      return;
    }
    setOtp({ status: "sending", msg: "" });
    try {
      if (!supabase) throw new Error("Service not configured.");
      const { data, error } = await supabase.functions.invoke("send-otp", {
        body: { email: f.email },
      });
      if (error || !data?.success)
        throw new Error(data?.error || "Could not send code.");
      setOtp({ status: "sent", msg: "Code sent — check your inbox (and spam)." });
    } catch (e) {
      setOtp({ status: "error", msg: e.message || "Could not send code." });
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!verified) {
      setSub({ status: "error", msg: "Verify your email — send and enter the code." });
      return;
    }
    if (!f.code.trim()) {
      setSub({ status: "error", msg: "Enter the verification code." });
      return;
    }
    setSub({ status: "submitting", msg: "" });
    try {
      if (!supabase) throw new Error("Service not configured.");
      const { data, error } = await supabase.functions.invoke(
        "submit-project-request",
        { body: f }
      );
      if (error || !data?.success)
        throw new Error(data?.error || "Something went wrong.");
      setSub({ status: "success", msg: "" });
    } catch (e) {
      setSub({ status: "error", msg: e.message || "Something went wrong." });
    }
  };

  if (sub.status === "success") {
    return (
      <div className="glass rounded-3xl p-8 text-center">
        <div className="text-4xl">✓</div>
        <h3 className="mt-3 text-xl font-bold text-white">Request received!</h3>
        <p className="mx-auto mt-2 max-w-md text-white/60">
          Thanks — I&rsquo;ll review your project and get back to you within
          24&ndash;48 hours. A confirmation is on its way to your inbox.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="glass rounded-3xl p-6 text-left sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <input
          className={field}
          placeholder="Name"
          value={f.name}
          onChange={(e) => set("name", e.target.value)}
          required
        />
        <input
          className={field}
          type="email"
          placeholder="Email"
          value={f.email}
          onChange={(e) => set("email", e.target.value)}
          required
        />
      </div>

      {/* Email verification */}
      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={sendCode}
            disabled={otp.status === "sending"}
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:border-neon-purple disabled:opacity-60"
          >
            {otp.status === "sending"
              ? "Sending…"
              : verified
              ? "Resend code"
              : "Send verification code"}
          </button>
          {(verified || otp.status === "sending") && (
            <input
              className="w-40 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-center tracking-[0.3em] text-white outline-none focus:border-neon-purple"
              placeholder="000000"
              inputMode="numeric"
              value={f.code}
              onChange={(e) =>
                set("code", e.target.value.replace(/\D/g, "").slice(0, 6))
              }
            />
          )}
        </div>
        {otp.msg && (
          <p
            className={`mt-2 text-xs ${
              otp.status === "error" ? "text-red-400" : "text-emerald-400"
            }`}
          >
            {otp.msg}
          </p>
        )}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Select
          value={f.project_type}
          onChange={(v) => set("project_type", v)}
          placeholder="Project type"
          options={PROJECT_TYPES}
        />
        <Select
          value={f.budget}
          onChange={(v) => set("budget", v)}
          placeholder="Budget"
          options={BUDGETS}
        />
        <Select
          value={f.timeline}
          onChange={(v) => set("timeline", v)}
          placeholder="Timeline"
          options={TIMELINES}
        />
      </div>

      <textarea
        className={`${field} mt-4 resize-none`}
        rows={4}
        placeholder="Project description — what are you trying to build?"
        value={f.description}
        onChange={(e) => set("description", e.target.value)}
        required
      />

      <input
        className={`${field} mt-4`}
        placeholder="Preferred tech stack (optional, e.g. React, Node, MongoDB)"
        value={f.tech_stack}
        onChange={(e) => set("tech_stack", e.target.value)}
      />

      <textarea
        className={`${field} mt-4 resize-none`}
        rows={3}
        placeholder="Key features you need"
        value={f.features}
        onChange={(e) => set("features", e.target.value)}
      />

      <textarea
        className={`${field} mt-4 resize-none`}
        rows={2}
        placeholder="Additional / nice-to-have features (optional)"
        value={f.additional_features}
        onChange={(e) => set("additional_features", e.target.value)}
      />

      {/* honeypot */}
      <input
        type="checkbox"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
        checked={f.botcheck}
        onChange={(e) => set("botcheck", e.target.checked)}
      />

      <button
        type="submit"
        disabled={sub.status === "submitting" || !verified}
        className="mt-6 w-full rounded-2xl bg-gradient-btn py-4 font-semibold text-base shadow-[0_0_25px_rgba(110,231,249,0.4)] transition-all duration-300 hover:scale-[1.02] disabled:opacity-60"
      >
        {sub.status === "submitting" ? "Submitting…" : "Submit request"}
      </button>

      {!verified && (
        <p className="mt-3 text-center text-xs text-white/40">
          Verify your email above to enable submission.
        </p>
      )}
      {sub.status === "error" && (
        <p className="mt-3 text-center text-sm text-red-400">{sub.msg}</p>
      )}
    </form>
  );
}

function Select({ value, onChange, placeholder, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${field} appearance-none ${value ? "text-white" : "text-white/40"}`}
    >
      <option value="" disabled className="bg-base text-white/60">
        {placeholder}
      </option>
      {options.map((o) => (
        <option key={o} value={o} className="bg-base text-white">
          {o}
        </option>
      ))}
    </select>
  );
}
