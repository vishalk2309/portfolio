import { motion } from 'framer-motion';

export default function IndependenceDaySection() {
  // Show only on August 15th
  const today = new Date();
  const isIndependenceDay = true; // Temporarily set to true for testing

  //const isIndependenceDay = today.getMonth() === 7 && today.getDate() === 15;

  if (!isIndependenceDay) return null;

  return (
    <section className="relative px-6 py-24 overflow-hidden">
      {/* Tricolor accent bars */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-600 via-white to-green-600" />
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-green-600 via-white to-amber-600" />

      <div className="mx-auto max-w-4xl">
        {/* Main Celebration Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Animated Flags */}
          <div className="mb-8 flex justify-center gap-4 text-6xl">
            <motion.span
              animate={{ rotateZ: [-5, 5, -5], y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🇮🇳
            </motion.span>
            <motion.span
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-7xl"
            >
              ✨
            </motion.span>
            <motion.span
              animate={{ rotateZ: [5, -5, 5], y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            >
              🇮🇳
            </motion.span>
          </div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold mb-4"
          >
            <span className="bg-gradient-to-r from-amber-400 via-white to-green-400 bg-clip-text text-transparent">
              Happy Independence Day
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-2xl md:text-3xl text-white/80 mb-8"
          >
            77 Years of Freedom 🇮🇳
          </motion.p>

          {/* Wishes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="glass rounded-2xl p-8 md:p-12 border border-white/10 mb-12"
          >
            <p className="text-xl md:text-2xl text-white mb-6 leading-relaxed">
              On this special day, I celebrate the spirit of freedom, unity, and progress that defines our nation.
            </p>
            <p className="text-lg md:text-xl text-white/70 mb-6">
              Wishing everyone a day filled with pride, joy, and inspiration.
            </p>

            {/* Tricolor divider */}
            <div className="flex gap-2 justify-center mb-6">
              <div className="h-1 w-12 bg-amber-600 rounded-full" />
              <div className="h-1 w-12 bg-white rounded-full" />
              <div className="h-1 w-12 bg-green-600 rounded-full" />
            </div>

            <p className="text-white font-semibold italic">
              "Jai Hind! 🇮🇳"
            </p>
          </motion.div>

          {/* Celebration Elements */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex justify-center gap-6 flex-wrap mb-8"
          >
            <div className="text-4xl">🎆</div>
            <div className="text-4xl">🎉</div>
            <div className="text-4xl">🇮🇳</div>
            <div className="text-4xl">🎊</div>
            <div className="text-4xl">🌟</div>
          </motion.div>

          {/* Extra Quote */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-white/60 text-sm md:text-base"
          >
            "In freedom, we find strength. In unity, we find power. In India, we find home."
          </motion.p>
        </motion.div>
      </div>

      {/* Animated background - Tricolor glows */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <motion.div
          animate={{ opacity: [0.1, 0.25, 0.1] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-1/4 right-1/4 w-40 h-40 bg-amber-600 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-green-600 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ opacity: [0.05, 0.15, 0.05] }}
          transition={{ duration: 6, repeat: Infinity, delay: 2 }}
          className="absolute top-1/2 left-1/3 w-32 h-32 bg-white rounded-full blur-3xl"
        />
      </div>
    </section>
  );
}
