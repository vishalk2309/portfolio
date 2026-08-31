import { motion } from "framer-motion";

export default function AchievementBadges() {
  const achievements = [
    {
      id: 1,
      icon: "🌟",
      title: "GitHub Star",
      description: "Repository received a star",
      unlocked: true,
      progress: 1,
      total: 1,
    },
    {
      id: 2,
      icon: "📝",
      title: "Blogger",
      description: "Published 5+ blog posts",
      unlocked: true,
      progress: 8,
      total: 5,
    },
    {
      id: 3,
      icon: "🔥",
      title: "Streak Master",
      description: "30-day GitHub contribution streak",
      unlocked: true,
      progress: 45,
      total: 30,
    },
    {
      id: 4,
      icon: "💎",
      title: "Expert",
      description: "Mastered a technology stack",
      unlocked: true,
      progress: 1,
      total: 1,
    },
    {
      id: 5,
      icon: "🚀",
      title: "Builder",
      description: "Shipped 10+ projects",
      unlocked: true,
      progress: 12,
      total: 10,
    },
    {
      id: 6,
      icon: "👥",
      title: "Community",
      description: "100+ followers reached",
      unlocked: true,
      progress: 250,
      total: 100,
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-white mb-2">Achievements</h3>
        <p className="text-white/60">Milestones and accomplishments unlocked</p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid grid-cols-2 sm:grid-cols-3 gap-4"
      >
        {achievements.map((badge) => (
          <motion.div
            key={badge.id}
            variants={item}
            className={`glass rounded-2xl p-4 text-center transition-all hover:bg-white/10 ${
              badge.unlocked ? "cursor-pointer hover:scale-105" : "opacity-50"
            }`}
          >
            <div className="text-4xl mb-2">{badge.icon}</div>
            <h4 className="font-bold text-white text-sm mb-1">{badge.title}</h4>
            <p className="text-xs text-white/60 mb-3">{badge.description}</p>

            {badge.unlocked && (
              <div className="flex items-center justify-center gap-2">
                <div className="text-xs text-neon-cyan font-semibold">
                  {badge.progress}/{badge.total}
                </div>
                <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple transition-all duration-500"
                    style={{
                      width: `${(badge.progress / badge.total) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {badge.unlocked && (
              <div className="mt-2 text-xs text-emerald-400 font-semibold">
                ✓ Unlocked
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>

      <div className="glass rounded-xl p-4 bg-gradient-to-r from-neon-cyan/5 to-neon-purple/5 border border-white/10">
        <p className="text-sm text-white/70">
          <span className="font-semibold text-neon-cyan">6 of 6 badges unlocked!</span>
          <br />
          Keep coding and building to unlock more achievements.
        </p>
      </div>
    </div>
  );
}
