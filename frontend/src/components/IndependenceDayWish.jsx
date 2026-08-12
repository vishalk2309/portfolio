import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const IndependenceDayWish = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [confetti, setConfetti] = useState([]);

  // Check if today is Independence Day
  const isIndependenceDay = () => {
    const today = new Date();
    return today.getMonth() === 7 && today.getDate() === 12;
  };

  // Generate confetti particles
  useEffect(() => {
    if (!isIndependenceDay()) {
      setIsVisible(false);
      return;
    }

    const generateConfetti = () => {
      const colors = ["bg-amber-500", "bg-white", "bg-green-500"];
      const newConfetti = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 3 + Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
      }));
      setConfetti(newConfetti);
    };

    generateConfetti();

    // Auto-hide after Independence Day
    const timer = setTimeout(
      () => {
        const tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
        if (tomorrow.getMonth() !== 7 || tomorrow.getDate() !== 15) {
          setIsVisible(false);
        }
      },
      24 * 60 * 60 * 1000,
    ); // 24 hours

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  // Patriotic quotes
  const quotes = [
    {
      text: "Freedom is not given, it is taken.",
      author: "Netaji Subhas Chandra Bose",
    },
    {
      text: "Swaraj is my birthright, and I shall have it.",
      author: "Bal Gangadhar Tilak",
    },
    {
      text: "In a day, when you don't come across any problems - you can be sure that you are not on the right path.",
      author: "Swami Vivekananda",
    },
  ];

  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const flagVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section className="relative px-6 py-12 md:py-16 overflow-hidden">
      {/* Tricolor Gradient Background */}
      <div className="absolute inset-0 -z-20">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-600/10 via-white/5 to-green-600/10" />
      </div>

      {/* Confetti Animation */}
      <div className="fixed inset-0 -z-30 pointer-events-none overflow-hidden">
        {confetti.map((piece) => (
          <motion.div
            key={piece.id}
            className={`absolute rounded-full ${piece.color} opacity-80`}
            style={{
              width: piece.size,
              height: piece.size,
              left: `${piece.left}%`,
              top: "-10px",
            }}
            animate={{
              y: window.innerHeight + 20,
              rotate: 360,
              opacity: [0.8, 0],
            }}
            transition={{
              duration: piece.duration,
              delay: piece.delay,
              ease: "easeIn",
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <motion.div
        className="mx-auto max-w-4xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Top Tricolor Accent Bar */}
        <motion.div
          className="mb-8 h-1 bg-gradient-to-r from-amber-600 via-white to-green-600 rounded-full"
          variants={itemVariants}
        />

        {/* Flag Section */}
        <motion.div
          className="mb-8 flex justify-center"
          variants={flagVariants}
        >
          <img
            src="https://www.crossed-flag-pins.com/animated-flag-gif/gifs/India_240-animated-flag-gifs.gif"
            alt="Indian Flag"
            className="h-32 md:h-40 w-auto drop-shadow-lg hover:scale-110 transition-transform duration-300"
            style={{
              mixBlendMode: 'screen',
              filter: 'brightness(1.2) contrast(1.1)',
            }}
            loading="lazy"
          />
        </motion.div>

        {/* Main Message */}
        <motion.h1
          className="text-4xl md:text-6xl font-bold text-center mb-4"
          variants={itemVariants}
        >
          <span className="bg-gradient-to-r from-amber-600 via-white to-green-600 bg-clip-text text-transparent">
            Happy Independence Day!
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          className="text-lg md:text-2xl text-center text-white/80 mb-8"
          variants={itemVariants}
        >
          Celebrating the spirit of freedom — 15th August 🇮🇳
        </motion.p>

        {/* Decorative Elements */}
        <motion.div
          className="flex justify-center gap-6 mb-8 text-4xl md:text-5xl"
          variants={itemVariants}
        >
          <motion.span
            animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🎆
          </motion.span>
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ✨
          </motion.span>
          <motion.span
            animate={{ y: [0, -10, 0], rotate: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
          >
            🎊
          </motion.span>
        </motion.div>

        {/* Patriotic Quote */}
        <motion.div
          className="glass rounded-xl p-6 md:p-8 border border-white/10 mb-8 max-w-2xl mx-auto"
          variants={itemVariants}
        >
          <p className="text-center text-lg md:text-xl text-white/90 italic mb-3">
            "{randomQuote.text}"
          </p>
          <p className="text-center text-sm md:text-base text-white/60">
            — {randomQuote.author}
          </p>

          {/* Quote Tricolor Accent */}
          <div className="mt-4 flex gap-1 justify-center">
            <div className="h-1 w-8 bg-amber-600 rounded-full" />
            <div className="h-1 w-8 bg-white rounded-full" />
            <div className="h-1 w-8 bg-green-600 rounded-full" />
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div className="text-center" variants={itemVariants}>
          <p className="text-white/70 text-sm md:text-base max-w-xl mx-auto">
            On this auspicious day, we celebrate the courage and sacrifice of
            our freedom fighters who paved the way for a free India. Let us
            continue to build a stronger, more inclusive nation.
          </p>
        </motion.div>

        {/* Bottom Tricolor Accent Bar */}
        <motion.div
          className="mt-8 h-1 bg-gradient-to-r from-green-600 via-white to-amber-600 rounded-full"
          variants={itemVariants}
        />
      </motion.div>

      {/* Ashoka Chakra Background Elements */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, linear: true }}
          className="absolute top-1/4 right-1/4 w-32 h-32 border-4 border-green-600/10 rounded-full"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, linear: true }}
          className="absolute bottom-1/3 left-1/4 w-40 h-40 border-4 border-amber-600/10 rounded-full"
        />
      </div>
    </section>
  );
};

export default IndependenceDayWish;
