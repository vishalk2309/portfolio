import { useState } from "react";
import { motion } from "framer-motion";
import { profile, socials } from "../data";

export default function Contact() {
  // status: idle | sending | success | error
  const [status, setStatus] = useState("idle");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);
    data.append("access_key", profile.web3formsKey);
    data.append("subject", `Portfolio message from ${data.get("name") || "visitor"}`);
    data.append("from_name", "Portfolio Contact Form");

    setStatus("sending");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: data,
      });
      const json = await res.json();
      if (json.success) {
        setStatus("success");
        form.reset();
        setTimeout(() => setStatus("idle"), 4000);
      } else {
        setStatus("error");
      }
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
        <a
          href={`mailto:${profile.email}`}
          className="mt-2 inline-block font-mono text-lg text-neon-cyan transition-colors hover:text-white"
        >
          {profile.email}
        </a>

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

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass mt-12 rounded-3xl p-6 text-left sm:p-8"
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
