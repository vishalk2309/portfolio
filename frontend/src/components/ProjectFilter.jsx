import { useState, useMemo } from "react";
import { FiX } from "react-icons/fi";

export default function ProjectFilter({ projects, onFilter, children }) {
  const [selectedTechs, setSelectedTechs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const allTechs = useMemo(() => {
    const techs = new Set();
    projects.forEach((project) => {
      if (project.technologies) {
        Array.isArray(project.technologies)
          ? project.technologies.forEach((t) => techs.add(t))
          : techs.add(project.technologies);
      }
    });
    return Array.from(techs).sort();
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        searchTerm === "" ||
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.description || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesTech =
        selectedTechs.length === 0 ||
        selectedTechs.some((tech) => {
          const projectTechs = Array.isArray(project.technologies)
            ? project.technologies
            : [project.technologies];
          return projectTechs.includes(tech);
        });

      return matchesSearch && matchesTech;
    });
  }, [projects, searchTerm, selectedTechs]);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-full border border-white/15 bg-white/5 px-5 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-neon-cyan/50"
        />

        {allTechs.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {allTechs.map((tech) => (
              <button
                key={tech}
                onClick={() =>
                  setSelectedTechs((prev) =>
                    prev.includes(tech)
                      ? prev.filter((t) => t !== tech)
                      : [...prev, tech]
                  )
                }
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  selectedTechs.includes(tech)
                    ? "bg-neon-cyan text-[rgb(var(--c-base))]"
                    : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10"
                }`}
              >
                {tech}
              </button>
            ))}

            {(selectedTechs.length > 0 || searchTerm) && (
              <button
                onClick={() => {
                  setSelectedTechs([]);
                  setSearchTerm("");
                }}
                className="rounded-full px-4 py-2 text-sm text-white/40 hover:text-white flex items-center gap-2"
              >
                <FiX size={16} />
                Reset
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-white/60">
          {filteredProjects.length} of {projects.length} projects
        </p>
      </div>

      {children(filteredProjects)}

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-white/40">
            No projects match your filter. Try different keywords.
          </p>
        </div>
      )}
    </div>
  );
}
