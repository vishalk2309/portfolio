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
  start_date: "",
  cover_image: "",
  tags: [],
  published: false,
};

const inputCls =
  "w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-white outline-none focus:border-neon-purple";

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
      start_date: form.start_date || null,
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
          <p className="text-white/40">No updates yet. Click "New update" to create one.</p>
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
                if (editing === "new" && (!form.slug || form.slug === slugify(form.title)))
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
              <label className="mb-1 block text-sm text-white/70">Company</label>
              <input
                className={inputCls}
                value={form.company}
                onChange={(e) => set("company", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-white/70">Position</label>
              <input
                className={inputCls}
                value={form.position}
                onChange={(e) => set("position", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-white/70">Start date</label>
            <input
              type="date"
              className={inputCls}
              value={form.start_date || ""}
              onChange={(e) => set("start_date", e.target.value)}
            />
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
                    .filter(Boolean)
                )
              }
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-white/70">Cover image</label>
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
              {form.company && (
                <p className="text-sm font-semibold text-neon-cyan">{form.company}</p>
              )}
              {form.position && (
                <p className="text-xs text-white/60">{form.position}</p>
              )}
              <h1 className="text-2xl font-bold text-white">
                {form.title || "Untitled"}
              </h1>
              {form.description && (
                <p className="text-sm text-white/70">{form.description}</p>
              )}
              {form.start_date && (
                <p className="text-xs text-white/50">
                  Started: {new Date(form.start_date).toLocaleDateString()}
                </p>
              )}
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
