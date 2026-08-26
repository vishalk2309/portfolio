import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function useJobUpdates(draft = false) {
  const [updates, setUpdates] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    if (!supabase) {
      setStatus("error");
      return;
    }

    let query = supabase
      .from("job_updates")
      .select("*")
      .order("created_at", { ascending: false });

    if (!draft) {
      query = query.eq("published", true);
    }

    query.then(({ data, error }) => {
      if (error) {
        console.error("Failed to load job updates:", error);
        setStatus("error");
      } else {
        setUpdates(data || []);
        setStatus("ready");
      }
    });
  }, [draft]);

  return { updates, status };
}
