import { Link } from "react-router-dom";
import SectionHeading from "./SectionHeading";
import JobUpdateCard from "./JobUpdateCard";
import { useJobUpdates } from "../hooks/useJobUpdates";

export default function JobUpdatesSection() {
  const { updates, status } = useJobUpdates();

  // Nothing published yet (or Supabase unavailable) — hide the section.
  if (status !== "ready" || !updates || updates.length === 0) return null;

  const recent = updates.slice(0, 3);

  return (
    <section id="jobs" className="relative px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow="Career" title="Job Updates" />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recent.map((update) => (
            <JobUpdateCard key={update.id} update={update} />
          ))}
        </div>

        {updates.length > recent.length && (
          <div className="mt-10 text-center">
            <Link
              to="/jobs"
              className="inline-block rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition-transform hover:scale-105"
            >
              View all updates →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
