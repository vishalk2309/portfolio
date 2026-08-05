import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

/**
 * The signed-in visitor's own access requests, as a resource_id → status map
 * ("pending" | "approved" | "declined"). RLS returns only their own rows.
 *
 * Used by /resources to label each request-only card, and by /account to list
 * what they've been granted.
 */
export function useAccessRequests(user) {
  const [statuses, setStatuses] = useState({});
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // Bumped on unmount and on every new load, so a slow response from a previous
  // user (or an unmounted component) can't overwrite current state.
  const runId = useRef(0);

  const load = useCallback(async () => {
    const run = ++runId.current;
    if (!supabase || !user) {
      setStatuses({});
      setRows([]);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("access_requests")
      .select("id, resource_id, status, note, created_at, decided_at")
      .order("created_at", { ascending: false });
    if (run !== runId.current) return; // superseded
    const map = {};
    for (const r of data || []) {
      if (r.resource_id != null) map[r.resource_id] = r.status;
    }
    setStatuses(map);
    setRows(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
    return () => {
      runId.current++; // invalidate whatever is still in flight
    };
  }, [load]);

  // Optimistic local update so a card can flip to "pending" immediately.
  const setStatus = useCallback((resourceId, status) => {
    setStatuses((s) => ({ ...s, [resourceId]: status }));
  }, []);

  return { statuses, rows, loading, reload: load, setStatus };
}
