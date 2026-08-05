import { useCallback, useEffect, useState } from "react";

/**
 * Bookmarks for resources, kept in localStorage so a visitor can save items
 * without signing in (resources are browsable while logged out).
 *
 * Keys are stringified resource ids. Every hook instance listens for the
 * custom `bookmarks:change` event so multiple mounted components stay in sync
 * within the tab, and for `storage` so other tabs do too.
 */

const STORAGE_KEY = "resourceBookmarks";
const CHANGE_EVENT = "bookmarks:change";

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(arr) ? arr.map(String) : []);
  } catch {
    // Private mode / corrupted value — start empty rather than crashing.
    return new Set();
  }
}

function write(set) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch {
    /* storage full or blocked — the in-memory state still works */
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useBookmarks() {
  const [ids, setIds] = useState(read);

  useEffect(() => {
    const sync = () => setIds(read());
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const toggle = useCallback((id) => {
    if (id == null) return;
    const next = read();
    const key = String(id);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    write(next);
    setIds(next);
  }, []);

  const isBookmarked = useCallback((id) => ids.has(String(id)), [ids]);

  const clear = useCallback(() => {
    const empty = new Set();
    write(empty);
    setIds(empty);
  }, []);

  return { ids, count: ids.size, toggle, isBookmarked, clear };
}
