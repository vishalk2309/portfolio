import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import BlogLayout from "./BlogLayout";
import { supabase } from "../lib/supabase";

const STATUS = {
  submitted: {
    label: "Submitted",
    desc: "Received — waiting to be reviewed.",
    cls: "border-white/20 bg-white/5 text-white/70",
  },
  in_review: {
    label: "In review",
    desc: "Your post is being reviewed right now.",
    cls: "border-amber-400/30 bg-amber-500/10 text-amber-400",
  },
  published: {
    label: "Published",
    desc: "It's live on the blog! 🎉",
    cls: "border-emerald-400/30 bg-emerald-500/10 text-emerald-400",
  },
  rejected: {
    label: "Not accepted",
    desc: "This submission wasn't accepted for publishing.",
    cls: "border-red-400/30 bg-red-500/10 text-red-400",
  },
};

export default function BlogStatus() {
  const [params, setParams] = useSearchParams();
  const [id, setId] = useState(params.get("id") || "");
  const [result, setResult] = useState(null); // row | "notfound" | null
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const check = async (theId) => {
    const clean = (theId || "").trim();
    if (!clean) return;
    setLoading(true);
    setErr("");
    setResult(null);
    try {
      if (!supabase) throw new Error("Service not configured.");
      const { data, error } = await supabase.rpc("blog_submission_status", {
        p_id: clean,
      });
      if (error) throw new Error("Couldn't check that ID — is it correct?");
      const row = Array.isArray(data) ? data[0] : data;
      setResult(row || "notfound");
    } catch (e) {
      setErr(e.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const qid = params.get("id");
    if (qid) check(qid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = (e) => {
    e.preventDefault();
    setParams(id ? { id } : {});
    check(id);
  };

  const info =
    result && result !== "notfound"
      ? STATUS[result.status] || STATUS.submitted
      : null;

  return (
    <BlogLayout>
      <h1 className="font-serif text-4xl font-bold text-white sm:text-5xl">
        Track your submission
      </h1>
      <p className="mb-8 mt-2 text-white/55">
        Paste the submission ID you received after submitting your post.
      </p>

      <form onSubmit={submit} className="glass flex flex-wrap gap-3 rounded-3xl p-4">
        <input
          className="min-w-[220px] flex-1 rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-neon-purple"
          placeholder="Submission ID"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />
        <button
          type="submit"
          className="rounded-2xl bg-gradient-btn px-6 py-3 font-semibold text-base"
        >
          Check
        </button>
      </form>

      {loading && <p className="mt-6 text-white/40">Checking…</p>}
      {err && <p className="mt-6 text-red-400">{err}</p>}
      {result === "notfound" && (
        <p className="mt-6 text-white/50">
          No submission found with that ID. Double-check it and try again.
        </p>
      )}

      {info && (
        <div className="glass mt-6 rounded-3xl p-6">
          <span
            className={`inline-block rounded-full border px-3 py-1 text-sm font-semibold ${info.cls}`}
          >
            {info.label}
          </span>
          <h2 className="mt-4 text-xl font-bold text-white">{result.title}</h2>
          <p className="mt-1 text-white/60">{info.desc}</p>
          {result.published && result.slug && (
            <Link
              to={`/blog/${result.slug}`}
              className="mt-4 inline-block text-sm text-neon-cyan hover:underline"
            >
              View your published post →
            </Link>
          )}
        </div>
      )}

      <Link
        to="/blog"
        className="mt-8 inline-block text-sm text-neon-cyan hover:underline"
      >
        ← Back to all posts
      </Link>
    </BlogLayout>
  );
}
