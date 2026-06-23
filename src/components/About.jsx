import OrbitPhoto from "./OrbitPhoto";
import { LeetCodeCard, GfgCard, GitHubCard } from "./StatCards";
import ContributionHeatmap from "./ContributionHeatmap";

export default function About() {
  return (
    <section id="about" className="relative px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-start gap-12 lg:grid-cols-2">
          {/* Left: orbiting photo */}
          <div className="lg:sticky lg:top-28">
            <OrbitPhoto />
          </div>

          {/* Right: stat cards */}
          <div className="space-y-8">
            <LeetCodeCard />
            <GfgCard />
            <GitHubCard />
          </div>
        </div>

        {/* Full-width live contribution heatmap */}
        <div className="mt-8">
          <ContributionHeatmap />
        </div>
      </div>
    </section>
  );
}
