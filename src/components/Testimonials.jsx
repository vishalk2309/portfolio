import SectionHeading from "./SectionHeading";
import { useContent } from "../lib/ContentContext";

function Card({ t }) {
  return (
    <div className="glass mx-3 flex w-80 shrink-0 flex-col justify-between rounded-3xl p-6">
      <p className="text-white/75">&ldquo;{t.message}&rdquo;</p>
      <div className="mt-5 flex items-center justify-between">
        <span className="font-semibold text-white">{t.name}</span>
        {t.date && <span className="text-xs text-white/40">{t.date}</span>}
      </div>
    </div>
  );
}

/** "What people say" — auto-scrolling marquee (3+), or a static row for 1–2. */
export default function Testimonials() {
  const { testimonials } = useContent();
  if (!testimonials || testimonials.length === 0) return null;

  const header = (
    <div className="mx-auto mb-14 max-w-6xl px-6">
      <SectionHeading eyebrow="Testimonials" title="What People Say" />
    </div>
  );

  // Too few to scroll meaningfully → show them centered and static.
  if (testimonials.length < 3) {
    return (
      <section id="testimonials" className="relative overflow-hidden py-24">
        {header}
        <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-6 px-6">
          {testimonials.map((t, i) => (
            <Card key={i} t={t} />
          ))}
        </div>
      </section>
    );
  }

  // Duplicate the list so the scroll can loop seamlessly.
  const loop = [...testimonials, ...testimonials];

  return (
    <section id="testimonials" className="relative overflow-hidden py-24">
      {header}
      {/* Marquee — pauses on hover; edges fade out. */}
      <div className="group relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div className="flex animate-marquee group-hover:[animation-play-state:paused]">
          {loop.map((t, i) => (
            <Card key={i} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
