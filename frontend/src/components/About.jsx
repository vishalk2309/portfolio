import { motion } from "framer-motion";
import OrbitPhoto from "./OrbitPhoto";
import { LeetCodeCard, GfgCard, GitHubCard } from "./StatCards";
import ContributionHeatmap from "./ContributionHeatmap";
import SectionHeading from "./SectionHeading";
import ResumeDownload from "./ResumeDownload";
import { useContent } from "../lib/ContentContext";

export default function About() {
  const { profile } = useContent();
  return (
    <section id="about" className="relative px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow="Get to know me" title="About Me" />

        {profile.summary && (
          <div className="mb-16">
            {/* Cognizant logo — drop the file at public/cognizant.png.
                Hides itself gracefully if the image is missing. */}
            <motion.img
              src="/cognizant.png"
              alt="Cognizant Technology Solutions"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mx-auto mb-6 h-10 w-auto sm:h-12"
            />
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mx-auto max-w-3xl text-center text-base leading-relaxed text-white/70 sm:text-lg"
            >
              {profile.summary}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex justify-center pt-4"
            >
              <ResumeDownload />
            </motion.div>
          </div>
        )}

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
