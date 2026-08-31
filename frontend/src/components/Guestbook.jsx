import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiSend, FiHeart } from "react-icons/fi";
import { supabase } from "../lib/supabase";

export default function Guestbook() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      if (!supabase) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("guestbook")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (!error && data) {
        setMessages(data);
      }
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.message.trim()) return;

    setSubmitting(true);
    try {
      if (!supabase) throw new Error("Service not configured");

      const { error } = await supabase.from("guestbook").insert([
        {
          name: formData.name,
          message: formData.message,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      setFormData({ name: "", message: "" });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);

      // Refresh messages
      fetchMessages();
    } catch (err) {
      console.error("Failed to submit message:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-white mb-2">Guestbook</h3>
        <p className="text-white/60">
          Leave a message! Let me know what you think about my work.
        </p>
      </div>

      {/* Submit Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass rounded-2xl p-6"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Your name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={submitting}
            className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-neon-cyan/50 disabled:opacity-50"
          />

          <textarea
            placeholder="Share your thoughts..."
            value={formData.message}
            onChange={(e) =>
              setFormData({ ...formData, message: e.target.value })
            }
            disabled={submitting}
            rows="3"
            className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-neon-cyan/50 disabled:opacity-50 resize-none"
          />

          <div className="flex items-center justify-between">
            <p className="text-xs text-white/40">
              Your message will be displayed publicly
            </p>
            <button
              type="submit"
              disabled={submitting || !formData.name.trim() || !formData.message.trim()}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-btn px-6 py-2.5 font-semibold text-white transition-transform hover:scale-105 disabled:opacity-50"
            >
              <FiSend size={16} />
              {submitting ? "Sending..." : "Send"}
            </button>
          </div>

          {submitted && (
            <p className="text-sm text-emerald-400">
              ✓ Message posted! Thank you for signing the guestbook.
            </p>
          )}
        </form>
      </motion.div>

      {/* Messages Display */}
      <div className="space-y-3">
        <p className="text-sm text-white/60">
          {messages.length} {messages.length === 1 ? "message" : "messages"} so far
        </p>

        {loading && <p className="text-white/40">Loading messages...</p>}

        {!loading && messages.length === 0 && (
          <p className="text-white/40 text-center py-8">
            No messages yet. Be the first to sign!
          </p>
        )}

        <div className="grid gap-3">
          {messages.map((msg, idx) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass rounded-xl p-4 border border-white/5 hover:border-white/10 transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-white">{msg.name}</h4>
                <span className="text-neon-cyan text-sm">
                  {new Date(msg.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">{msg.message}</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-white/40">
                <FiHeart size={12} />
                <span>Message saved</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
