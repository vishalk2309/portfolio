import { useState } from "react";
import { supabase } from "../lib/supabase";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const JOBS_POPUP_KEY = "job_subscribe_popup";
export const RESOURCES_POPUP_KEY = "resources_subscribe_popup";

// Jobs: write straight to the table, reactivating a past unsubscribe.
export async function submitJobSubscribe(email) {
  const { error } = await supabase
    .from("job_subscribers")
    .insert({ email, is_active: true })
    .select();

  if (!error) return;

  // Already subscribed once — flip them back on instead of failing.
  if (error.code === "23505") {
    const { error: updateError } = await supabase
      .from("job_subscribers")
      .update({ is_active: true, unsubscribed_at: null })
      .eq("email", email);
    if (updateError) throw new Error("Could not subscribe.");
    return;
  }

  throw new Error(error.message || "Could not subscribe.");
}

// Resources: goes through an edge function (it also sends a welcome email).
export async function submitResourcesSubscribe(email) {
  const { data, error } = await supabase.functions.invoke(
    "subscribe-resources",
    { body: { email } },
  );
  if (error || !data?.success) {
    throw new Error(data?.error || "Could not subscribe.");
  }
}

// Shared email/status plumbing for the inline forms and the corner popups.
// `submit` does the backend call; `storageKey` suppresses the popup once
// someone has signed up.
export function useSubscribe({ submit, storageKey }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [msg, setMsg] = useState("");

  const subscribe = async (e) => {
    e?.preventDefault();
    if (!emailRe.test(email)) {
      setStatus("error");
      setMsg("Enter a valid email.");
      return;
    }
    setStatus("sending");
    setMsg("");
    try {
      if (!supabase) throw new Error("Service not configured.");
      await submit(email);

      if (storageKey) {
        try {
          localStorage.setItem(storageKey, "subscribed");
        } catch {
          /* private mode — ignore */
        }
      }

      setStatus("done");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMsg(err.message || "Could not subscribe.");
    }
  };

  return { email, setEmail, status, setStatus, msg, subscribe };
}
