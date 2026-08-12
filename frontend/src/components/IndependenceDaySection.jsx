import { motion } from 'framer-motion';
import SectionHeading from './SectionHeading';

export default function IndependenceDaySection() {
  // Show only on August 15th
  const today = new Date();
  const isIndependenceDay = today.getMonth() === 7 && today.getDate() === 15;

  if (!isIndependenceDay) return null;

  const cards = [
    {
      emoji: '🎓',
      title: 'Mentoring Future Developers',
      description: 'Helping aspiring developers from India grow their careers in tech',
      stat: '100+ mentees supported',
      color: 'amber',
    },
    {
      emoji: '💻',
      title: 'Open Source Contributions',
      description: 'Building tools and libraries used by Indian developers',
      stat: '15+ projects',
      color: 'green',
    },
    {
      emoji: '🌍',
      title: 'Community Initiatives',
      description: 'Supporting local tech communities and coding bootcamps',
      stat: '5 communities',
      color: 'cyan',
    },
    {
      emoji: '🚀',
      title: 'Indian Companies',
      description: 'Working with Cognizant and contributing to India\'s tech growth',
      stat: '3+ years',
      color: 'purple',
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      amber: 'hover:border-amber-600/50 text-amber-400',
      green: 'hover:border-green-600/50 text-green-400',
      cyan: 'hover:border-cyan-500/50 text-cyan-400',
      purple: 'hover:border-purple-600/50 text-purple-400',
    };
    return colors[color] || colors.amber;
  };

  return (
    <section className="relative px-6 py-24">
      {/* Tricolor accent bar at top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 via-white to-green-600" />

      <div className="mx-auto max-w-6xl">
        {/* Section Heading */}
        <SectionHeading
          eyebrow="🇮🇳 August 15"
          title="Tech for India"
          subtitle="Contributing to India's growing tech ecosystem"
        />

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {cards.map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -5 }}
              className={`glass rounded-2xl p-6 border border-white/10 transition ${getColorClasses(
                card.color
              )}`}
            >
              <div className="text-4xl mb-3">{card.emoji}</div>
              <h3 className="text-lg font-semibold mb-2 text-white">{card.title}</h3>
              <p className="text-sm text-white/60 mb-4">{card.description}</p>
              <div className={`text-xs font-semibold ${getColorClasses(card.color).split(' ')[1]}`}>
                {card.stat}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quote Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass rounded-2xl p-8 border border-white/10 text-center max-w-3xl mx-auto mb-12"
        >
          <p className="text-xl md:text-2xl font-semibold mb-4 text-white">
            "In a nation of 1.4 billion people, I'm proud to be a developer building solutions that matter."
          </p>
          <p className="text-white/60 mb-6">— Building with pride, for India</p>

          {/* Tricolor border accent */}
          <div className="h-1 bg-gradient-to-r from-amber-600 via-white to-green-600 rounded-full" />
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center"
        >
          <h3 className="text-2xl font-bold mb-4 text-white">Let's build together</h3>
          <p className="text-white/60 mb-6 max-w-xl mx-auto">
            Interested in collaborating on projects that make an impact in the Indian tech ecosystem?
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="#contact"
              className="px-6 py-3 rounded-lg bg-gradient-btn hover:opacity-90 transition font-semibold text-base text-white shadow-lg"
            >
              Let's Collaborate
            </a>
            <a
              href="https://github.com/vishalk2309"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-lg border border-white/20 hover:bg-white/5 transition font-semibold text-white"
            >
              View Open Source
            </a>
          </div>
        </motion.div>
      </div>

      {/* Animated background elements */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <motion.div
          animate={{ opacity: [0.05, 0.15, 0.05] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-20 right-20 w-32 h-32 bg-amber-600 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ opacity: [0.05, 0.15, 0.05] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          className="absolute bottom-20 left-20 w-40 h-40 bg-green-600 rounded-full blur-3xl"
        />
      </div>
    </section>
  );
}
