import { ACCENTS, useAccent } from "../theme";

/** Row of accent swatches; the active one gets a white ring. */
export default function AccentDots({ size = 18 }) {
  const [accent, setAccent] = useAccent();

  return (
    <div className="flex items-center gap-2">
      {Object.entries(ACCENTS).map(([key, a]) => (
        <button
          key={key}
          onClick={() => setAccent(key)}
          aria-label={`${a.label} accent`}
          title={a.label}
          className={`rounded-full transition-transform hover:scale-125 ${
            accent === key ? "ring-2 ring-white ring-offset-2 ring-offset-base" : ""
          }`}
          style={{
            width: size,
            height: size,
            background: `linear-gradient(135deg, ${a.from}, ${a.to})`,
          }}
        />
      ))}
    </div>
  );
}
