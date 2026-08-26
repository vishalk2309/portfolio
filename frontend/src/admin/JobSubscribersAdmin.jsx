import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { FiTrash2, FiDownload } from "react-icons/fi";

export default function JobSubscribersAdmin() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("job_subscribers")
      .select("*")
      .order("subscribed_at", { ascending: false });
    setSubscribers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    if (!window.confirm("Remove this subscriber?")) return;
    setDeleting(id);
    await supabase.from("job_subscribers").delete().eq("id", id);
    await load();
    setDeleting(null);
  };

  const exportCSV = () => {
    const csv = [
      ["Email", "Subscribed At", "Status"],
      ...subscribers.map((sub) => [
        sub.email,
        new Date(sub.subscribed_at).toLocaleString(),
        sub.is_active ? "Active" : "Unsubscribed",
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `job-subscribers-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass rounded-3xl p-6 sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            <span className="gradient-text">Job Update Subscribers</span>
          </h2>
          <p className="mt-1 text-sm text-white/60">
            {subscribers.filter((s) => s.is_active).length} active subscribers
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 rounded-xl bg-gradient-btn px-4 py-2 text-sm font-semibold text-base"
        >
          <FiDownload size={16} />
          Export CSV
        </button>
      </div>

      {loading ? (
        <p className="text-white/40">Loading…</p>
      ) : subscribers.length === 0 ? (
        <p className="text-white/40">
          No subscribers yet. Share the /jobs page to get subscribers.
        </p>
      ) : (
        <div className="space-y-2">
          <div className="hidden grid-cols-4 gap-4 rounded-lg bg-white/5 px-4 py-3 text-xs font-semibold text-white/70 md:grid">
            <span>Email</span>
            <span>Subscribed</span>
            <span>Status</span>
            <span>Action</span>
          </div>

          {subscribers.map((sub) => (
            <div
              key={sub.id}
              className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-4 md:grid md:grid-cols-4 md:gap-4"
            >
              <div>
                <p className="text-xs text-white/40 md:hidden">Email</p>
                <p className="truncate text-sm font-medium text-white">
                  {sub.email}
                </p>
              </div>

              <div>
                <p className="text-xs text-white/40 md:hidden">Subscribed</p>
                <p className="text-sm text-white/70">
                  {new Date(sub.subscribed_at).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className="text-xs text-white/40 md:hidden">Status</p>
                <span
                  className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                    sub.is_active
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-red-500/15 text-red-400"
                  }`}
                >
                  {sub.is_active ? "Active" : "Unsubscribed"}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => remove(sub.id)}
                  disabled={deleting === sub.id}
                  className="rounded-lg p-2 text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
