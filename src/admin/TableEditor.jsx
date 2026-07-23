import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

/**
 * Generic create/read/update/delete UI for one table, driven by its schema
 * entry. Handles all field types and value conversion to/from the database.
 */
export default function TableEditor({ table }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // row object, "new", or null
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  // ---- load rows -----------------------------------------------------------
  const load = async () => {
    setLoading(true);
    let q = supabase.from(table.key).select("*");
    if (table.orderBy) q = q.order(table.orderBy);
    const { data, error } = await q;
    if (error) setMsg(error.message);
    setRows(data || []);
    setLoading(false);

    // single-row tables (profile) open straight into the editor
    if (table.singleRow && data && data[0]) startEdit(data[0]);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table.key]);

  // ---- form helpers --------------------------------------------------------
  const rowToForm = (row) => {
    const f = {};
    for (const field of table.fields) {
      const v = row ? row[field.name] : undefined;
      if (field.type === "array") f[field.name] = (v || []).join(", ");
      else f[field.name] = v == null ? "" : String(v);
    }
    return f;
  };

  const startEdit = (row) => {
    setEditing(row);
    setForm(rowToForm(row));
    setMsg("");
  };
  const startNew = () => {
    setEditing("new");
    setForm(rowToForm(null));
    setMsg("");
  };
  const cancel = () => {
    setEditing(null);
    setMsg("");
  };

  const setField = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  // convert the string-based form into a typed DB payload
  const buildPayload = () => {
    const payload = {};
    for (const field of table.fields) {
      const raw = form[field.name];
      if (field.type === "array") {
        payload[field.name] = (raw || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      } else if (field.type === "number") {
        payload[field.name] = raw === "" ? null : Number(raw);
      } else {
        const t = (raw ?? "").trim();
        payload[field.name] = t === "" ? null : t;
      }
    }
    return payload;
  };

  // ---- save / delete -------------------------------------------------------
  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const payload = buildPayload();

    let error;
    if (editing === "new") {
      ({ error } = await supabase.from(table.key).insert(payload));
    } else {
      ({ error } = await supabase
        .from(table.key)
        .update(payload)
        .eq("id", editing.id));
    }
    setBusy(false);

    if (error) {
      setMsg("❌ " + error.message);
      return;
    }
    setMsg("✅ Saved. Reload your site to see it live.");
    await load();
    if (!table.singleRow) setEditing(null);
  };

  const remove = async (row) => {
    if (!confirm(`Delete this ${table.label.replace(/s$/, "")}?`)) return;
    setBusy(true);
    const { error } = await supabase.from(table.key).delete().eq("id", row.id);
    setBusy(false);
    if (error) return setMsg("❌ " + error.message);
    setMsg("🗑️ Deleted.");
    await load();
  };

  // ---- render --------------------------------------------------------------
  return (
    <div className="glass rounded-2xl p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">
          {table.icon} {table.label}
        </h2>
        {!table.singleRow && !editing && (
          <button
            onClick={startNew}
            className="rounded-lg bg-gradient-btn px-4 py-2 text-sm font-semibold text-base"
          >
            + Add new
          </button>
        )}
      </div>

      {msg && (
        <p className="mb-4 rounded-lg bg-white/5 px-3 py-2 text-sm text-white/80">
          {msg}
        </p>
      )}

      {/* Editor form */}
      {editing && (
        <form onSubmit={save} className="mb-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {table.fields.map((field) => (
              <Field
                key={field.name}
                field={field}
                value={form[field.name] ?? ""}
                onChange={(v) => setField(field.name, v)}
              />
            ))}
          </div>
          <div className="mt-5 flex gap-3">
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-gradient-btn px-5 py-2.5 text-sm font-semibold text-base disabled:opacity-60"
            >
              {busy ? "Saving…" : "Save"}
            </button>
            {!table.singleRow && (
              <button
                type="button"
                onClick={cancel}
                className="rounded-lg border border-white/15 px-5 py-2.5 text-sm text-white/70 hover:text-white"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {/* List (not shown for single-row tables) */}
      {!table.singleRow && (
        <div className="divide-y divide-white/10">
          {loading && <p className="py-4 text-sm text-white/40">Loading…</p>}
          {!loading && rows.length === 0 && (
            <p className="py-4 text-sm text-white/40">Nothing here yet.</p>
          )}
          {rows.map((row) => (
            <div
              key={row.id}
              className="flex items-center justify-between gap-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-white">
                  {row[table.listColumns[0]] || "(untitled)"}
                </p>
                {table.listColumns[1] && (
                  <p className="truncate text-sm text-white/40">
                    {row[table.listColumns[1]]}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => startEdit(row)}
                  className="rounded-md border border-white/15 px-3 py-1.5 text-sm text-white/80 hover:text-white"
                >
                  Edit
                </button>
                <button
                  onClick={() => remove(row)}
                  disabled={busy}
                  className="rounded-md border border-red-500/30 px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- single field --------------------------------------------------------
function Field({ field, value, onChange }) {
  const base =
    "w-full rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-neon-purple";
  const wrap = field.full ? "sm:col-span-2" : "";

  return (
    <div className={wrap}>
      <label className="mb-1 block text-xs text-white/50">{field.label}</label>

      {field.type === "textarea" ? (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={base + " resize-y"}
        />
      ) : field.type === "select" ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={base}
        >
          <option value="">—</option>
          {field.options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : field.type === "number" ? (
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={base}
        />
      ) : field.type === "color" ? (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000"}
            onChange={(e) => onChange(e.target.value)}
            className="h-9 w-10 shrink-0 rounded border border-white/15 bg-transparent"
          />
          <input
            type="text"
            value={value}
            placeholder="#22D3EE"
            onChange={(e) => onChange(e.target.value)}
            className={base}
          />
        </div>
      ) : field.type === "image" ? (
        <div>
          <input
            type="text"
            value={value}
            placeholder="/project1.png or https://…"
            onChange={(e) => onChange(e.target.value)}
            className={base}
          />
          {value && (
            <img
              src={value}
              alt=""
              className="mt-2 h-16 rounded border border-white/10 object-contain"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          )}
        </div>
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={base}
        />
      )}
    </div>
  );
}
