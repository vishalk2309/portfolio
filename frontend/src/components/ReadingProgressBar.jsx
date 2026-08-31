import { useReadingProgress } from "../hooks/useReadingProgress";

export default function ReadingProgressBar() {
  const progress = useReadingProgress();

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-white/10 z-50">
      <div
        className="h-full bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-cyan transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
