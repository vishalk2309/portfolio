import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

/**
 * Bulk-upload many files (or a whole folder) into ONE resource in a single
 * action. Each file becomes a row in `resource_files`. Free resources store a
 * public "media" URL; paid ones store a private "paid-resources" path.
 */
export default function FolderUpload() {
  const [resources, setResources] = useState([]);
  const [resourceId, setResourceId] = useState("");
  const [rows, setRows] = useState([]); // { name, status } per file
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const folderRef = useRef(null);

  // "webkitdirectory" isn't a standard React prop — set it on the DOM element.
  useEffect(() => {
    if (folderRef.current) {
      folderRef.current.setAttribute("webkitdirectory", "");
      folderRef.current.setAttribute("directory", "");
    }
  }, []);

  useEffect(() => {
    supabase
      .from("resources")
      .select("id, title, is_paid")
      .order("sort_order")
      .then(({ data }) => setResources(data || []));
  }, []);

  const selected = resources.find((r) => String(r.id) === String(resourceId));
  const isPaid = !!selected?.is_paid;
  const bucket = isPaid ? "paid-resources" : "media";

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = ""; // allow re-selecting
    if (!files.length) return;
    if (!selected) {
      setMsg("❌ Pick a resource first.");
      return;
    }

    setBusy(true);
    setMsg("");
    // seed the progress list
    setRows(files.map((f) => ({ name: f.webkitRelativePath || f.name, status: "…" })));

    // find current max sort_order so new files append after existing ones
    const { data: existing } = await supabase
      .from("resource_files")
      .select("sort_order")
      .eq("resource_id", selected.id)
      .order("sort_order", { ascending: false })
      .limit(1);
    let order = (existing?.[0]?.sort_order || 0) + 1;

    let ok = 0;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const label = file.webkitRelativePath || file.name;
      try {
        const safe = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const path = `${Date.now()}-${i}-${safe}`;
        const up = await supabase.storage
          .from(bucket)
          .upload(path, file, { cacheControl: "3600", upsert: false });
        if (up.error) throw up.error;

        const row = {
          resource_id: selected.id,
          label,
          sort_order: order++,
        };
        if (isPaid) {
          row.file_path = path;
        } else {
          row.file_url = supabase.storage.from(bucket).getPublicUrl(path).data
            .publicUrl;
        }
        const ins = await supabase.from("resource_files").insert(row);
        if (ins.error) throw ins.error;

        ok++;
        setRows((rs) =>
          rs.map((r, idx) => (idx === i ? { ...r, status: "✅" } : r))
        );
      } catch (err) {
        setRows((rs) =>
          rs.map((r, idx) =>
            idx === i ? { ...r, status: "❌ " + (err.message || "failed") } : r
          )
        );
      }
    }

    setBusy(false);
    setMsg(`Done — ${ok}/${files.length} file(s) added to "${selected.title}".`);
  };

  return (
    <div className="glass rounded-2xl p-5 sm:p-6">
      <h2 className="text-xl font-bold">📁 Folder Upload</h2>
      <p className="mt-1 text-sm text-white/50">
        Add many files to one resource at once. Files go to the{" "}
        <b>{bucket}</b> bucket based on whether the resource is paid.
      </p>

      {/* Resource picker */}
      <label className="mt-5 block text-xs text-white/50">
        Add files to which resource?
      </label>
      <select
        value={resourceId}
        onChange={(e) => setResourceId(e.target.value)}
        className="mt-1 w-full rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-neon-purple"
      >
        <option value="">— choose a resource —</option>
        {resources.map((r) => (
          <option key={r.id} value={r.id}>
            {r.title || "(untitled)"} {r.is_paid ? "· paid 🔒" : "· free"} (#{r.id})
          </option>
        ))}
      </select>

      {selected && (
        <p className="mt-2 text-xs text-white/40">
          These files will be treated as{" "}
          <b>{isPaid ? "PAID (private)" : "FREE (public)"}</b>, matching the
          resource.
        </p>
      )}

      {/* Uploaders */}
      <div className="mt-5 flex flex-wrap gap-3">
        <label
          className={`cursor-pointer rounded-lg border border-white/15 px-4 py-2 text-sm text-white/80 hover:text-white ${
            !selected || busy ? "pointer-events-none opacity-50" : ""
          }`}
        >
          📁 Select a folder
          <input
            ref={folderRef}
            type="file"
            multiple
            disabled={!selected || busy}
            onChange={handleFiles}
            className="hidden"
          />
        </label>
        <label
          className={`cursor-pointer rounded-lg border border-white/15 px-4 py-2 text-sm text-white/80 hover:text-white ${
            !selected || busy ? "pointer-events-none opacity-50" : ""
          }`}
        >
          🗎 Select files
          <input
            type="file"
            multiple
            disabled={!selected || busy}
            onChange={handleFiles}
            className="hidden"
          />
        </label>
      </div>

      {msg && (
        <p className="mt-4 rounded-lg bg-white/5 px-3 py-2 text-sm text-white/80">
          {msg}
        </p>
      )}

      {/* Per-file progress */}
      {rows.length > 0 && (
        <ul className="mt-4 space-y-1 text-sm">
          {rows.map((r, i) => (
            <li key={i} className="flex items-center justify-between gap-3">
              <span className="truncate text-white/70">{r.name}</span>
              <span className="shrink-0 text-white/50">{r.status}</span>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-5 text-xs text-white/40">
        Tip: “Select a folder” uploads every file inside it. Re-running appends
        more files to the same resource. Manage/rename them under 🗂️ Resource
        Files.
      </p>
    </div>
  );
}
