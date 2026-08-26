import { useState } from "react";
import { motion } from "framer-motion";
import { useContent } from "../lib/ContentContext";
import { supabase } from "../lib/supabase";
import ProjectRequestForm from "./ProjectRequestForm";

export default function Contact() {
  const { profile, socials } = useContent();
  // status: idle | sending | success | error
  const [status, setStatus] = useState("idle");
  const [tab, setTab] = useState("hi"); // "hi" | "project"

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);
    const payload = {
      name: data.get("name"),
      email: data.get("email"),
      message: data.get("message"),
      botcheck: Boolean(data.get("botcheck")), // honeypot
    };

    setStatus("sending");
    try {
      if (!supabase) throw new Error("Contact service not configured");
      // Calls the `send-contact` Edge Function, which emails me AND sends the
      // visitor an automated confirmation reply.
      const { data: res, error } = await supabase.functions.invoke(
        "send-contact",
        { body: payload }
      );
      if (error || !res?.success) throw new Error("Send failed");
      setStatus("success");
      form.reset();
      setTimeout(() => setStatus("idle"), 4000);
    } catch {
      setStatus("error");
    }
  };

  const btnLabel = {
    idle: "Send Message",
    sending: "Sending…",
    success: "✓ Message Sent!",
    error: "Failed — try again",
  }[status];

  return (
    <section id="contact" className="relative px-6 py-24">
      <div className="mx-auto max-w-3xl text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-5xl font-bold leading-tight tracking-tight text-white sm:text-7xl"
        >
          Let's Build Something{" "}
          <span className="gradient-text">Epic Together</span>
        </motion.h2>

        <p className="mt-8 text-lg text-white/55">Get in touch directly:</p>
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
          <a
            href={`mailto:${profile.email}`}
            className="font-mono text-lg text-neon-cyan transition-colors hover:text-white"
          >
            {profile.email}
          </a>
          <span className="hidden sm:inline text-white/30">•</span>
          {socials.find(s => s.label === "WhatsApp") && (
            <a
              href={socials.find(s => s.label === "WhatsApp").href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-green-500/20 border border-green-500/50 px-4 py-2 text-sm font-semibold text-green-400 transition-all hover:bg-green-500/30 hover:border-green-500"
            >
              💬 WhatsApp
            </a>
          )}
        </div>

        {/* Socials */}
        <div className="mt-8 flex items-center justify-center gap-6 text-2xl text-white/70">
          {socials.map(({ Icon, href, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              className="transition-all duration-300 hover:scale-110 hover:text-neon-cyan"
            >
              <Icon />
            </a>
          ))}
        </div>

        {/* Tabs */}
        <div className="mt-12 flex justify-center">
          <div className="glass inline-flex gap-1 rounded-full p-1">
            {[
              { key: "hi", label: "Say Hi" },
              { key: "project", label: "Request a Project" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                  tab === t.key
                    ? "bg-white text-[rgb(var(--c-base))]"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {tab === "project" ? (
          <motion.div
            key="project"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-6"
          >
            <ProjectRequestForm ownerEmail={profile.email} />
          </motion.div>
        ) : (
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="glass mt-6 rounded-3xl p-6 text-left sm:p-8"
          >
          <div className="grid gap-5 sm:grid-cols-2">
            <Input name="name" type="text" placeholder="Name" />
            <Input name="email" type="email" placeholder="Email" />
          </div>
          <textarea
            name="message"
            required
            rows={5}
            placeholder="Message"
            className="mt-5 w-full resize-none rounded-2xl border border-white/15 bg-white/[0.04] px-5 py-4 text-white placeholder-white/40 outline-none transition-all duration-300 focus:border-neon-purple focus:shadow-[0_0_25px_-5px_rgba(168,85,247,0.7)]"
          />

          {/* honeypot — hidden from humans, catches bots */}
          <input
            type="checkbox"
            name="botcheck"
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
            aria-hidden="true"
          />

          <button
            type="submit"
            disabled={status === "sending"}
            className="mt-6 w-full rounded-2xl bg-gradient-btn py-4 font-semibold text-base shadow-[0_0_25px_rgba(110,231,249,0.4)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] disabled:opacity-70"
          >
            {btnLabel}
          </button>

            {status === "error" && (
              <p className="mt-3 text-center text-sm text-red-400">
                Something went wrong. Email me directly at {profile.email}.
              </p>
            )}
          </motion.form>
        )}
      </div>
    </section>
  );
}

function Input({ name, type, placeholder }) {
  return (
    <input
      name={name}
      type={type}
      required
      placeholder={placeholder}
      className="w-full rounded-2xl border border-white/15 bg-white/[0.04] px-5 py-4 text-white placeholder-white/40 outline-none transition-all duration-300 focus:border-neon-purple focus:shadow-[0_0_25px_-5px_rgba(168,85,247,0.7)]"
    />
  );
}
