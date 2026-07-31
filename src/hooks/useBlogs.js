import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

/** List of published posts, newest first. */
export function useBlogs() {
  const [state, setState] = useState({ posts: [], status: "loading" });

  useEffect(() => {
    if (!supabase) {
      setState({ posts: [], status: "error" });
      return;
    }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("blogs")
        .select(
          "id,title,slug,excerpt,cover_image,tags,created_at,author_name,author_date,likes"
        )
        .eq("published", true)
        .order("created_at", { ascending: false });
      if (cancelled) return;
      setState(
        error
          ? { posts: [], status: "error" }
          : { posts: data || [], status: "ready" }
      );
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

/** A single published post by slug. */
export function useBlogPost(slug) {
  const [state, setState] = useState({ post: null, status: "loading" });

  useEffect(() => {
    if (!supabase || !slug) {
      setState({ post: null, status: "error" });
      return;
    }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();
      if (cancelled) return;
      if (error) setState({ post: null, status: "error" });
      else if (!data) setState({ post: null, status: "notfound" });
      else setState({ post: data, status: "ready" });
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return state;
}
