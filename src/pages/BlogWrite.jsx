import { useState } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import BlogLayout from "./BlogLayout";
import { supabase } from "../lib/supabase";

const field =
  "w-full rounded-2xl border border-white/15 bg-white/[0.04] px-5 py-3.5 text-white placeholder-white/40 outline-none transition-all duration-300 focus:border-neon-purple";

export default function BlogWrite() {
  const [f, setF] = useState({
    author_name: "",
    author_email: "",
    author_date: new Date().toISOString().slice(0, 10), // today, yyyy-mm-dd
    title: "",
    tags: "",
    content: "",
    code: "",
    botcheck: false,
  });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const [preview, setPreview] = useState(false);
  const [state, setState] = useState({ status: "idle", msg: "" }); // idle|sending|success|error
  const [otp, setOtp] = useState({ status: "idle", msg: "" }); // idle|sending|sent|error

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.author_email);
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
        body: { email: f.author_email },
      });
      if (error || !data?.success)
        throw new Error(data?.error || "Could not send code.");
      setOtp({ status: "sent", msg: "Code sent — check your inbox (and spam)." });
    } catch (err) {
      setOtp({ status: "error", msg: err.message || "Could not send code." });
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!f.author_name.trim() || !f.title.trim() || f.content.trim().length < 30) {
      setState({
        status: "error",
        msg: "Add your name, a title, and a bit more content.",
      });
      return;
    }
    if (!verified || !f.code.trim()) {
      setState({
        status: "error",
        msg: "Verify your email — send and enter the code.",
      });
      return;
    }
    setState({ status: "sending", msg: "" });
    try {
      if (!supabase) throw new Error("Service not configured.");
      const { data, error } = await supabase.functions.invoke("submit-blog", {
        body: {
          ...f,
          tags: f.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        },
      });
      if (error || !data?.success)
        throw new Error(data?.error || "Something went wrong.");
      setState({ status: "success", msg: "" });
    } catch (err) {
      setState({ status: "error", msg: err.message || "Something went wrong." });
    }
  };

  if (state.status === "success") {
    return (
      <BlogLayout>
        <div className="glass rounded-3xl p-8 text-center">
          <div className="text-4xl">✓</div>
          <h1 className="mt-3 font-serif text-3xl font-bold text-white">
            Thanks for your post!
          </h1>
          <p className="mx-auto mt-2 max-w-md text-white/60">
            Your submission was received. It&rsquo;ll appear on the blog once
            it&rsquo;s been reviewed and approved.
          </p>
          <Link
            to="/blog"
            className="mt-6 inline-block text-sm text-neon-cyan hover:underline"
          >
            ← Back to all posts
          </Link>
        </div>
      </BlogLayout>
    );
  }

  return (
    <BlogLayout>
      <h1 className="font-serif text-4xl font-bold text-white sm:text-5xl">
        Write a post
      </h1>
      <p className="mb-8 mt-2 text-white/55">
        Share something with the community. Posts are reviewed before they go
        live.
      </p>

      <form onSubmit={submit} className="glass rounded-3xl p-6 text-left sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            className={field}
            placeholder="Your name"
            value={f.author_name}
            onChange={(e) => set("author_name", e.target.value)}
            required
          />
          <input
            className={field}
            type="email"
            placeholder="Your email"
            value={f.author_email}
            onChange={(e) => set("author_email", e.target.value)}
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

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-white/60">Date</label>
            <input
              className={field}
              type="date"
              value={f.author_date}
              onChange={(e) => set("author_date", e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-white/60">
              Tags (comma separated)
            </label>
            <input
              className={field}
              placeholder="e.g. React, Career"
              value={f.tags}
              onChange={(e) => set("tags", e.target.value)}
            />
          </div>
        </div>

        <input
          className={`${field} mt-4`}
          placeholder="Post title"
          value={f.title}
          onChange={(e) => set("title", e.target.value)}
          required
        />

        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between">
            <label className="text-sm text-white/60">Content (Markdown)</label>
            <button
              type="button"
              onClick={() => setPreview((p) => !p)}
              className="text-xs text-neon-cyan hover:underline"
            >
              {preview ? "← Edit" : "Preview →"}
            </button>
          </div>
          {preview ? (
            <div className="min-h-[280px] rounded-2xl border border-white/10 bg-white/[0.03] p-5 blog-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {f.content || "_Nothing to preview yet._"}
              </ReactMarkdown>
            </div>
          ) : (
            <textarea
              className={`${field} resize-none font-mono text-sm`}
              rows={14}
              placeholder={"# My heading\n\nWrite your post in **markdown**…"}
              value={f.content}
              onChange={(e) => set("content", e.target.value)}
            />
          )}
        </div>

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
          disabled={state.status === "sending" || !verified}
          className="mt-6 w-full rounded-2xl bg-gradient-btn py-4 font-semibold text-base transition-all duration-300 hover:scale-[1.02] disabled:opacity-60"
        >
          {state.status === "sending" ? "Submitting…" : "Submit for review"}
        </button>

        {!verified && (
          <p className="mt-3 text-center text-xs text-white/40">
            Verify your email above to enable submission.
          </p>
        )}
        {state.status === "error" && (
          <p className="mt-3 text-center text-sm text-red-400">{state.msg}</p>
        )}
      </form>
    </BlogLayout>
  );
}
