import { useState } from "react";
import { supabase } from "../lib/supabase";
import { TABLES } from "./schema";
import TableEditor from "./TableEditor";

export default function Dashboard({ session }) {
  const [activeKey, setActiveKey] = useState(TABLES[0].key);
  const active = TABLES.find((t) => t.key === activeKey);

  const logout = () => supabase.auth.signOut();

  return (
    <div className="min-h-screen bg-base text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 md:flex-row md:px-6 md:py-10">
        {/* Sidebar */}
        <aside className="md:w-60 md:shrink-0">
          <div className="glass rounded-2xl p-4">
            <h1 className="px-2 text-lg font-bold">
              <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="truncate px-2 pt-1 text-xs text-white/40">
              {session.user.email}
            </p>

            <nav className="mt-4 space-y-1">
              {TABLES.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveKey(t.key)}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    activeKey === t.key
                      ? "bg-white/10 text-white"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  <span>{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </nav>

            <div className="mt-4 border-t border-white/10 pt-4">
              <a
                href="/"
                className="block rounded-lg px-3 py-2 text-sm text-white/60 hover:text-white"
              >
                ↗ View site
              </a>
              <button
                onClick={logout}
                className="mt-1 block w-full rounded-lg px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10"
              >
                Log out
              </button>
            </div>
          </div>
        </aside>

        {/* Main editor */}
        <main className="min-w-0 flex-1">
          <TableEditor key={active.key} table={active} />
        </main>
      </div>
    </div>
  );
}
