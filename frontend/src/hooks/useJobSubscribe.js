import { useState } from "react";
import { supabase } from "../lib/supabase";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POPUP_KEY = "job_subscribe_popup";

// Shared subscribe logic for the inline form and the popup.
export function useJobSubscribe() {
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

      const { error } = await supabase
        .from("job_subscribers")
        .insert({ email, is_active: true })
        .select();

      if (error) {
        // Already subscribed once — reactivate instead of failing.
        if (error.code === "23505") {
          const { error: updateError } = await supabase
            .from("job_subscribers")
            .update({ is_active: true, unsubscribed_at: null })
            .eq("email", email);

          if (updateError) throw new Error("Could not subscribe.");
        } else {
          throw new Error(error.message || "Could not subscribe.");
        }
      }

      // Don't nag someone who already signed up.
      try {
        localStorage.setItem(POPUP_KEY, "subscribed");
      } catch {
        /* private mode — ignore */
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
