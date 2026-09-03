import { FiClock, FiEye, FiMessageCircle } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";

export default function BlogPostStats({ post, views = 0, commentCount = 0 }) {
  const calculateReadingTime = (content) => {
    if (!content) return 1;
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  };

  const readingTime = calculateReadingTime(post.content || post.excerpt);

  const stats = [
    {
      icon: FiClock,
      label: "Reading time",
      value: `${readingTime} min read`,
      color: "text-neon-cyan",
    },
    {
      icon: FiEye,
      label: "Views",
      value: views.toLocaleString(),
      color: "text-neon-purple",
    },
    {
      icon: FaHeart,
      label: "Likes",
      value: (post.likes || 0).toLocaleString(),
      color: "text-rose-400",
    },
    {
      icon: FiMessageCircle,
      label: "Comments",
      value: commentCount.toLocaleString(),
      color: "text-emerald-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {stats.map(({ icon: Icon, label, value, color }) => (
        <div
          key={label}
          className="glass rounded-xl p-4 text-center hover:bg-white/10 transition-all"
        >
          <Icon className={`mx-auto mb-2 ${color} text-lg`} />
          <p className="text-xs text-white/60 mb-1">{label}</p>
          <p className="font-semibold text-white">{value}</p>
        </div>
      ))}
    </div>
  );
}
