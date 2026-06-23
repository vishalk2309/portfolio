import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { education, achievements } from "../data";

const tabs = [
  { key: "education", label: "Education", icon: "🎓", data: education },
  { key: "achievements", label: "Achievements", icon: "🏆", data: achievements },
];

export default function Experience() {
  const [active, setActive] = useState("education");
  const items = tabs.find((t) => t.key === active).data;

  return (
    <section id="experience" className="relative px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <div className="glass overflow-hidden rounded-3xl p-2">
          {/* Tabs */}
          <div className="relative grid grid-cols-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActive(t.key)}
                className={`relative z-10 flex items-center justify-center gap-2 py-4 text-lg font-semibold transition-colors ${
                  active === t.key ? "text-white" : "text-white/50"
                }`}
              >
                <span>{t.icon}</span>
                {t.label}
              </button>
            ))}
            {/* sliding underline */}
            <motion.div
              className="absolute bottom-0 h-0.5 w-1/2 rounded-full bg-gradient-btn"
              animate={{ x: active === "education" ? "0%" : "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            <div className="absolute bottom-0 h-px w-full bg-white/10" />
          </div>

          {/* Timeline */}
          <div className="relative px-2 py-10 sm:px-6">
            {/* center line */}
            <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-white/10 sm:block" />

            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
                className="space-y-6"
              >
                {items.map((item, i) => (
                  <TimelineCard key={item.title} item={item} index={i} />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

function TimelineCard({ item, index }) {
  const left = index % 2 === 0;
  return (
    <motion.div
      initial={{ opacity: 0, x: left ? -40 : 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className={`flex sm:w-1/2 ${left ? "sm:pr-8" : "sm:ml-auto sm:pl-8"}`}
    >
      <div className="relative w-full rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-white/20">
        <div className="flex items-start gap-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
            style={{ background: `${item.color}22`, border: `1px solid ${item.color}55` }}
          >
            {item.icon}
          </div>
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2 text-sm">
              <span
                className="rounded-md px-2 py-0.5 font-semibold"
                style={{ background: `${item.color}22`, color: item.color }}
              >
                {item.period}
              </span>
              <span className="text-white/40">•</span>
              <span className="text-white/60">{item.cgpa}</span>
            </div>
            <h4 className="text-lg font-bold text-white">{item.title}</h4>
            <p className="text-sm text-white/55">{item.place}</p>
            <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${item.progress}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-btn"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
