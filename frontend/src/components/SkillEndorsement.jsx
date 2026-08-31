import { useState, useEffect } from "react";
import { FiThumbsUp } from "react-icons/fi";
import { supabase } from "../lib/supabase";

export default function SkillEndorsement({ skills = [] }) {
  const [endorsements, setEndorsements] = useState({});
  const [endorsed, setEndorsed] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [visitorId, setVisitorId] = useState("");

  // Generate or retrieve visitor ID from localStorage
  useEffect(() => {
    let id = localStorage.getItem("visitor-id");
    if (!id) {
      id = `visitor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("visitor-id", id);
    }
    setVisitorId(id);
  }, []);

  // Fetch endorsement data from Supabase
  useEffect(() => {
    if (!visitorId) return;
    fetchEndorsements();
  }, [visitorId, skills]);

  const fetchEndorsements = async () => {
    try {
      if (!supabase || skills.length === 0) {
        setLoading(false);
        return;
      }

      // Get all endorsements for these skills
      const { data: allEndorsements, error } = await supabase
        .from("skill_endorsements")
        .select("skill, visitor_id")
        .in("skill", skills);

      if (error) throw error;

      // Count endorsements per skill
      const counts = {};
      const userEndorsed = new Set();

      skills.forEach((skill) => {
        counts[skill] = 0;
      });

      allEndorsements?.forEach((e) => {
        counts[e.skill] = (counts[e.skill] || 0) + 1;
        if (e.visitor_id === visitorId) {
          userEndorsed.add(e.skill);
        }
      });

      setEndorsements(counts);
      setEndorsed(userEndorsed);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch endorsements:", err);
      setLoading(false);
    }
  };

  const handleEndorse = async (skill) => {
    if (endorsed.has(skill) || !supabase) return;

    try {
      // Add endorsement to database
      const { error } = await supabase.from("skill_endorsements").insert([
        {
          skill,
          visitor_id: visitorId,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      // Update local state
      setEndorsements((prev) => ({
        ...prev,
        [skill]: (prev[skill] || 0) + 1,
      }));

      setEndorsed((prev) => new Set([...prev, skill]));

      // Remove endorsed state after 2 seconds
      setTimeout(() => {
        setEndorsed((prev) => {
          const newSet = new Set(prev);
          newSet.delete(skill);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      console.error("Failed to endorse:", err);
    }
  };

  const sortedSkills = [...skills].sort(
    (a, b) => (endorsements[b] || 0) - (endorsements[a] || 0)
  );

  if (loading) {
    return <div className="text-white/40">Loading endorsements...</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Skill Endorsements</h3>
        <p className="text-sm text-white/60 mb-6">
          Endorse skills you&apos;ve witnessed or value (One vote per visitor)
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
