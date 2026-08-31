import { useState } from "react";
import { FiThumbsUp } from "react-icons/fi";

export default function SkillEndorsement({ skills = [] }) {
  const [endorsements, setEndorsements] = useState(
    skills.reduce((acc, skill) => {
      acc[skill] = Math.floor(Math.random() * 50) + 10;
      return acc;
    }, {})
  );

  const [endorsed, setEndorsed] = useState(new Set());

  const handleEndorse = (skill) => {
    if (endorsed.has(skill)) return;

    setEndorsements((prev) => ({
      ...prev,
      [skill]: (prev[skill] || 0) + 1,
    }));

    setEndorsed((prev) => new Set([...prev, skill]));

    setTimeout(() => {
      setEndorsed((prev) => {
        const newSet = new Set(prev);
        newSet.delete(skill);
        return newSet;
      });
    }, 2000);
  };

  const sortedSkills = [...skills].sort(
    (a, b) => (endorsements[b] || 0) - (endorsements[a] || 0)
  );

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Skill Endorsements</h3>
        <p className="text-sm text-white/60 mb-6">
          Endorse skills you&apos;ve witnessed or value
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {sortedSkills.map((skill) => (
          <button
            key={skill}
            onClick={() => handleEndorse(skill)}
            disabled={endorsed.has(skill)}
            className={`glass group rounded-xl p-4 text-center transition-all hover:bg-white/10 disabled:opacity-50 disabled:cursor-default ${
              endorsed.has(skill) ? "ring-2 ring-emerald-400" : ""
            }`}
          >
            <p className="font-semibold text-white mb-2">{skill}</p>
            <div className="flex items-center justify-center gap-1.5">
              <FiThumbsUp className="text-sm text-neon-cyan" />
              <span className="text-xs font-bold text-neon-cyan">
                {endorsements[skill] || 0}
              </span>
            </div>
            {endorsed.has(skill) && (
              <p className="text-xs text-emerald-400 mt-2">✓ Endorsed</p>
            )}
          </button>
        ))}
      </div>

      <div className="text-xs text-white/40 pt-4 border-t border-white/10">
        <p>Top endorsed: {sortedSkills[0]} ({endorsements[sortedSkills[0]] || 0} endorsements)</p>
      </div>
    </div>
  );
}
