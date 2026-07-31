import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import RichTextEditor from "../components/RichTextEditor";
import BlogContent from "../components/BlogContent";

const slugify = (s = "") =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const EMPTY = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  cover_image: "",
  tags: [],
  published: false,
  author_name: "",
  author_email: "",
  author_date: "",
};

const inputCls =
  "w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-white outline-none focus:border-neon-purple";

/** Dedicated blog authoring screen: list posts + markdown editor w/ live preview. */
export default function BlogEditor() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // "new" | post.id | null
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("blogs")
      .select("*")
      .order("created_at", { ascending: false });
    setPosts(data || []);
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
  const startEdit = (p) => {
    setForm({ ...EMPTY, ...p, tags: p.tags || [] });
    setEditing(p.id);
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
      excerpt: form.excerpt || null,
      content: form.content || "",
      cover_image: form.cover_image || null,
      tags: form.tags,
      published: form.published,
      author_name: form.author_name || null,
      author_email: form.author_email || null,
      author_date: form.author_date || null,
    };
    const { error } =
      editing === "new"
        ? await supabase.from("blogs").insert(payload)
        : await supabase.from("blogs").update(payload).eq("id", editing);
    setSaving(false);
    if (error) {
      setMsg("Error: " + error.message);
      return;
    }
    await load();
    cancel();
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    await supabase.from("blogs").delete().eq("id", p.id);
    await load();
  };

  const togglePublish = async (p) => {
    await supabase
      .from("blogs")
      .update({ published: !p.published })
      .eq("id", p.id);
    await load();
  };

  // Uploads a file to the media bucket and returns its public URL (or null).
  const uploadToStorage = async (file) => {
    if (!file) return null;
    setUploading(true);
    setMsg("");
    const safe = file.name.replace(/[^a-zA-Z0-9.\-]/g, "_");
    const path = `blog/${Date.now()}-${safe}`;
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

  // ---- list view ----------------------------------------------------------
  if (!editing) {
    return (
      <div className="glass rounded-3xl p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            <span className="gradient-text">Blog</span>
          </h2>
          <button
            onClick={startNew}
            className="rounded-xl bg-gradient-btn px-4 py-2 text-sm font-semibold text-base"
          >
            + New post
          </button>
        </div>

        {loading ? (
          <p className="text-white/40">Loading…</p>
        ) : posts.length === 0 ? (
          <p className="text-white/40">No posts yet. Click “New post” to write one.</p>
        ) : (
          <div className="space-y-2">
            {posts.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-semibold text-white">
                      {p.title}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] ${
                        p.published
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-white/10 text-white/50"
                      }`}
                    >
                      {p.published ? "Published" : "Draft"}
                    </span>
                  </div>
                  <div className="truncate text-xs text-white/40">
                    /{p.slug}
                    {p.author_name ? ` · by ${p.author_name}` : ""}
                  </div>
                </div>
                <button
                  onClick={() => togglePublish(p)}
                  className="rounded-lg px-3 py-1.5 text-xs text-white/60 hover:text-white"
                >
                  {p.published ? "Unpublish" : "Publish"}
                </button>
                <button
                  onClick={() => startEdit(p)}
                  className="rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/20"
                >
                  Edit
                </button>
                <button
                  onClick={() => remove(p)}
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

  // ---- editor view --------------------------------------------------------
  return (
    <div className="glass rounded-3xl p-6 sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          <span className="gradient-text">
            {editing === "new" ? "New post" : "Edit post"}
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
        {/* Left: fields + markdown */}
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-white/70">Title</label>
            <input
              className={inputCls}
              value={form.title}
              onChange={(e) => {
                const v = e.target.value;
                set("title", v);
                // keep slug in sync until the user hand-edits it
                if (editing === "new" && (!form.slug || form.slug === slugify(form.title)))
                  set("slug", slugify(v));
              }}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-white/70">
              Slug (URL: /blog/&lt;slug&gt;)
            </label>
            <input
              className={inputCls}
              value={form.slug}
              onChange={(e) => set("slug", slugify(e.target.value))}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-white/70">
              Excerpt (short summary for cards)
            </label>
            <textarea
              rows={2}
              className={inputCls}
              value={form.excerpt}
              onChange={(e) => set("excerpt", e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-white/70">
              Tags (comma separated)
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

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm text-white/70">Author name</label>
              <input
                className={inputCls}
                value={form.author_name}
                onChange={(e) => set("author_name", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-white/70">Author email</label>
              <input
                className={inputCls}
                value={form.author_email}
                onChange={(e) => set("author_email", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-white/70">Author date</label>
              <input
                type="date"
                className={inputCls}
                value={form.author_date || ""}
                onChange={(e) => set("author_date", e.target.value)}
              />
            </div>
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
            <label className="mb-1 block text-sm text-white/70">Content</label>
            <RichTextEditor
              value={form.content}
              onChange={(html) => set("content", html)}
              onImageUpload={uploadToStorage}
              placeholder="Write your post — format with the toolbar…"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-white/70">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => set("published", e.target.checked)}
            />
            Published (visible on the site)
          </label>
        </div>

        {/* Right: live preview */}
        <div>
          <label className="mb-1 block text-sm text-white/70">Preview</label>
          <div className="h-[600px] overflow-y-auto rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <h1 className="mb-2 font-serif text-2xl font-bold text-white">
              {form.title || "Untitled"}
            </h1>
            <BlogContent content={form.content || ""} />
          </div>
        </div>
      </div>
    </div>
  );
}
