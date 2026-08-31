import { useEffect, useState } from "react";

export default function GitHubHeatmap({ username = "vishal-works" }) {
  const [contributions, setContributions] = useState([]);
  const [stats, setStats] = useState({ totalContributions: 0, currentStreak: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGitHubData();
  }, []);

  const fetchGitHubData = async () => {
    try {
      const response = await fetch(`https://api.github.com/users/${username}`);
      if (!response.ok) throw new Error("Failed to fetch GitHub data");

      const data = await response.json();
      const totalContributions = data.public_repos + data.followers;

      setStats({
        totalContributions,
        currentStreak: 0,
      });

      const recentActivity = await fetchRecentCommits(username);
      setContributions(recentActivity);
      setLoading(false);
    } catch (error) {
      console.error("GitHub fetch error:", error);
      setLoading(false);
    }
  };

  const fetchRecentCommits = async (user) => {
    try {
      const response = await fetch(
        `https://api.github.com/users/${user}/repos?sort=updated&per_page=30`
      );
      const repos = await response.json();

      const contributionDays = [];
      const dayMap = new Map();

      repos.forEach((repo) => {
        const date = new Date(repo.pushed_at);
        const dateStr = date.toISOString().split("T")[0];

        dayMap.set(dateStr, (dayMap.get(dateStr) || 0) + 1);
      });

      const today = new Date();
      for (let i = 0; i < 365; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];

        contributionDays.push({
          date: dateStr,
          count: dayMap.get(dateStr) || 0,
        });
      }

      return contributionDays.reverse();
    } catch (error) {
      console.error("Failed to fetch commits:", error);
      return [];
    }
  };

  if (loading) {
    return (
      <div className="glass rounded-2xl p-6 animate-pulse">
        <div className="h-8 bg-white/10 rounded w-1/3 mb-6"></div>
        <div className="h-40 bg-white/10 rounded"></div>
      </div>
    );
  }

  const getColor = (count) => {
    if (count === 0) return "bg-white/5";
    if (count < 3) return "bg-green-900/40";
    if (count < 6) return "bg-green-700/60";
    if (count < 10) return "bg-green-500/80";
    return "bg-green-400";
  };

  const weeks = [];
  for (let i = 0; i < contributions.length; i += 7) {
    weeks.push(contributions.slice(i, i + 7));
  }

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">GitHub Activity</h3>
        <span className="text-sm text-neon-cyan">{stats.totalContributions} contributions</span>
      </div>

      <div className="overflow-x-auto">
        <div className="flex gap-1 pb-4">
          {weeks.slice(-52).map((week, weekIdx) => (
            <div key={weekIdx} className="flex flex-col gap-1">
              {week.map((day, dayIdx) => (
                <div
                  key={dayIdx}
                  className={`w-3 h-3 rounded-sm ${getColor(day.count)} transition-all hover:scale-150 cursor-pointer`}
                  title={`${day.date}: ${day.count} contributions`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-white/60">
        <span>Last year activity</span>
        <div className="flex gap-2 items-center">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 3, 6, 10].map((level) => (
              <div
                key={level}
                className={`w-2 h-2 rounded-sm ${getColor(level + 1)}`}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
