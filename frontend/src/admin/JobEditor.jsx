import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import RichTextEditor from "../components/RichTextEditor";

const slugify = (s = "") =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const EMPTY = {
  title: "",
  slug: "",
  description: "",
  content: "",
  company: "",
  position: "",
  location: "",
  job_type: "Remote",
  job_id: "",
  experience: "",
  qualification: "",
  apply_url: "",
  start_date: "",
  end_date: "",
  cover_image: "",
  tags: [],
  published: false,
};

const inputCls =
  "w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-white outline-none focus:border-neon-purple";

const notifySubscribers = async (jobId) => {
  try {
    const { data, error } = await supabase.functions.invoke(
      "notify-job-subscribers",
      {
        body: { job_id: jobId },
      },
    );
    if (error || !data?.success) {
      throw new Error(data?.error || "Could not send notifications.");
    }
    alert(`✓ Sent notifications to ${data.sent} subscribers!`);
  } catch (err) {
    alert("Error: " + (err.message || "Could not send notifications."));
  }
};

export default function JobEditor() {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("job_updates")
      .select("*")
      .order("created_at", { ascending: false });
    setUpdates(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const startNew = () => {
    setForm(EMPTY);
    setEditing("new");
    setMsg("");
  };

  const startEdit = (u) => {
    setForm({ ...EMPTY, ...u, tags: u.tags || [] });
    setEditing(u.id);
    setMsg("");
  };

  const cancel = () => {
    setEditing(null);
    setForm(EMPTY);
    setMsg("");
  };

  const save = async () => {
    if (!form.title.trim()) {
      setMsg("Title is required.");
      return;
    }
    setSaving(true);
    setMsg("");

    const payload = {
      title: form.title.trim(),
      slug: (form.slug || slugify(form.title)).trim(),
      description: form.description || null,
      content: form.content || "",
      company: form.company || null,
      position: form.position || null,
      location: form.location || null,
      job_type: form.job_type || "Remote",
      job_id: form.job_id || null,
      experience: form.experience || null,
      qualification: form.qualification || null,
      apply_url: form.apply_url || null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      cover_image: form.cover_image || null,
      tags: form.tags,
      published: form.published,
    };

    let error;
    if (editing === "new") {
      const res = await supabase
        .from("job_updates")
        .insert(payload)
        .select("id")
        .single();
      error = res.error;
    } else {
      const res = await supabase
        .from("job_updates")
        .update(payload)
        .eq("id", editing);
      error = res.error;
    }

    setSaving(false);
    if (error) {
      setMsg("Error: " + error.message);
      return;
    }

    await load();
    cancel();
  };

  const remove = async (u) => {
    if (!window.confirm(`Delete "${u.title}"? This cannot be undone.`)) return;
    await supabase.from("job_updates").delete().eq("id", u.id);
    await load();
  };

  const togglePublish = async (u) => {
    const nowPublish = !u.published;
    await supabase
      .from("job_updates")
      .update({ published: nowPublish })
      .eq("id", u.id);
    await load();
  };

  const uploadToStorage = async (file) => {
    if (!file) return null;
    setUploading(true);
    setMsg("");
    const safe = file.name.replace(/[^a-zA-Z0-9.\-]/g, "_");
    const path = `job-updates/${Date.now()}-${safe}`;
    const { error } = await supabase.storage
      .from("media")
      .upload(path, file, { upsert: false });
    setUploading(false);
    if (error) {
      setMsg("Upload failed: " + error.message);
      return null;
    }
    return supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
  };

  const uploadCover = async (file) => {
    const url = await uploadToStorage(file);
    if (url) set("cover_image", url);
  };

  if (!editing) {
    return (
      <div className="glass rounded-3xl p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            <span className="gradient-text">Job Updates</span>
          </h2>
          <button
            onClick={startNew}
            className="rounded-xl bg-gradient-btn px-4 py-2 text-sm font-semibold text-base"
          >
            + New update
          </button>
        </div>

        {loading ? (
          <p className="text-white/40">Loading…</p>
        ) : updates.length === 0 ? (
          <p className="text-white/40">
            No updates yet. Click "New update" to create one.
          </p>
        ) : (
          <div className="space-y-2">
            {updates.map((u) => (
              <div
                key={u.id}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-semibold text-white">
                      {u.title}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] ${
                        u.published
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-white/10 text-white/50"
                      }`}
                    >
                      {u.published ? "Published" : "Draft"}
                    </span>
                  </div>
                  <div className="truncate text-xs text-white/40">
                    /{u.slug}
                    {u.company ? ` · ${u.company}` : ""}
                    {u.position ? ` • ${u.position}` : ""}
                  </div>
                </div>
                <button
                  onClick={() => togglePublish(u)}
                  className="rounded-lg px-3 py-1.5 text-xs text-white/60 hover:text-white"
                >
                  {u.published ? "Unpublish" : "Publish"}
                </button>
                {u.published && (
                  <button
                    onClick={() => notifySubscribers(u.id)}
                    className="rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/25"
                  >
                    📬 Notify
                  </button>
                )}
                <button
                  onClick={() => startEdit(u)}
                  className="rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/20"
                >
                  Edit
                </button>
                <button
                  onClick={() => remove(u)}
                  className="rounded-lg px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="glass rounded-3xl p-6 sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          <span className="gradient-text">
            {editing === "new" ? "New update" : "Edit update"}
          </span>
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={cancel}
            className="rounded-xl px-4 py-2 text-sm text-white/60 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="rounded-xl bg-gradient-btn px-4 py-2 text-sm font-semibold text-base disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {msg && <p className="mb-4 text-sm text-red-400">{msg}</p>}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-white/70">Title</label>
            <input
              className={inputCls}
              value={form.title}
              onChange={(e) => {
                const v = e.target.value;
                set("title", v);
                if (
                  editing === "new" &&
                  (!form.slug || form.slug === slugify(form.title))
                )
                  set("slug", slugify(v));
              }}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-white/70">
              Slug (URL: /job/&lt;slug&gt;)
            </label>
            <input
              className={inputCls}
              value={form.slug}
              onChange={(e) => set("slug", slugify(e.target.value))}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-white/70">
                Company
              </label>
              <input
                className={inputCls}
                value={form.company}
                onChange={(e) => set("company", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-white/70">
                Position
              </label>
              <input
                className={inputCls}
                value={form.position}
                onChange={(e) => set("position", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm text-white/70">
                Location
              </label>
              <input
                className={inputCls}
                placeholder="e.g., New York, NY"
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-white/70">
                Job Type
              </label>
              <select
                className={inputCls}
                value={form.job_type}
                onChange={(e) => set("job_type", e.target.value)}
              >
                <option value="Remote" className="bg-base">
                  Remote
                </option>
                <option value="Hybrid" className="bg-base">
                  Hybrid
                </option>
                <option value="On-site" className="bg-base">
                  On-site
                </option>
                <option value="Not Specified" className="bg-base">
                  Not Specified
                </option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-white/70">Job ID</label>
              <input
                className={inputCls}
                placeholder="e.g., JOB-2026-001"
                value={form.job_id}
                onChange={(e) => set("job_id", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-white/70">
                Experience Required
              </label>
              <input
                className={inputCls}
                placeholder="e.g., 3-5 years"
                value={form.experience}
                onChange={(e) => set("experience", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-white/70">
                Qualification Required
              </label>
              <input
                className={inputCls}
                placeholder="e.g., Bachelor's in Computer Science"
                value={form.qualification}
                onChange={(e) => set("qualification", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-white/70">
              Apply URL (optional)
            </label>
            <input
              className={inputCls}
              placeholder="e.g., https://example.com/apply or mailto:jobs@example.com"
              value={form.apply_url}
              onChange={(e) => set("apply_url", e.target.value)}
            />
            <p className="mt-1 text-xs text-white/50">
              Leave empty to link to the job detail page
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-white/70">
                Start date
              </label>
              <input
                type="date"
                className={inputCls}
                value={form.start_date || ""}
                onChange={(e) => set("start_date", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-white/70">
                End date (optional)
              </label>
              <input
                type="date"
                className={inputCls}
                value={form.end_date || ""}
                onChange={(e) => set("end_date", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-white/70">
              Description (short teaser for cards)
            </label>
            <textarea
              rows={2}
              className={inputCls}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-white/70">
              Tags (comma separated - e.g., React, Node.js, Leadership)
            </label>
            <input
              className={inputCls}
              value={form.tags.join(", ")}
              onChange={(e) =>
                set(
                  "tags",
                  e.target.value
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
                )
              }
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-white/70">
              Cover image
            </label>
            <input
              className={inputCls}
              placeholder="https://… or upload"
              value={form.cover_image}
              onChange={(e) => set("cover_image", e.target.value)}
            />
            <label className="mt-2 inline-block cursor-pointer text-xs text-neon-cyan hover:underline">
              {uploading ? "Uploading…" : "↑ Upload cover"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => uploadCover(e.target.files?.[0])}
              />
            </label>
          </div>

          <div>
            <label className="mb-1 block text-sm text-white/70">
              Content (detailed update)
            </label>
            <RichTextEditor
              value={form.content}
              onChange={(html) => set("content", html)}
              onImageUpload={uploadToStorage}
              placeholder="Write your job update — format with the toolbar…"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              checked={form.published}
              onChange={(e) => set("published", e.target.checked)}
              className="rounded"
            />
            <label htmlFor="published" className="text-sm text-white/70">
              Publish this update (visible on site)
            </label>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm text-white/70">Preview</label>
          <div className="h-[600px] overflow-y-auto rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  {form.company && (
                    <p className="text-sm font-semibold text-neon-cyan">
                      {form.company}
                    </p>
                  )}
                  {form.position && (
                    <p className="text-xs text-white/60">{form.position}</p>
                  )}
                </div>
                {form.job_id && (
                  <p className="text-xs text-white/40">ID: {form.job_id}</p>
                )}
              </div>

              <h1 className="text-2xl font-bold text-white">
                {form.title || "Untitled"}
              </h1>

              {form.description && (
                <p className="text-sm text-white/70">{form.description}</p>
              )}

              <div className="flex flex-wrap gap-3 pt-3 text-xs text-white/60">
                {form.location && <span>📍 {form.location}</span>}
                {form.job_type && <span>💼 {form.job_type}</span>}
              </div>

              {(form.experience || form.qualification) && (
                <div className="flex flex-wrap gap-3 pt-2 text-xs text-white/50">
                  {form.experience && (
                    <span>📚 Experience: {form.experience}</span>
                  )}
                  {form.qualification && (
                    <span>🎓 Qualification: {form.qualification}</span>
                  )}
                </div>
              )}

              {form.apply_url && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <p className="text-xs text-white/50 mb-2">
                    Apply link: {form.apply_url}
                  </p>
                </div>
              )}

              <div className="space-y-1 border-t border-white/10 pt-3 text-xs text-white/50">
                {form.start_date && (
                  <p>
                    Started: {new Date(form.start_date).toLocaleDateString()}
                  </p>
                )}
                {form.end_date && (
                  <p>Ended: {new Date(form.end_date).toLocaleDateString()}</p>
                )}
              </div>

              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-3">
                  {form.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-medium text-white/70"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
