import { siteData } from "@/data/portfolio";
import SectionHeading from "./SectionHeading";
import SkillTile from "./SkillTile";

// Titles of the projects whose `tech` lists this skill.
const projectsUsing = (skill) =>
  siteData.projects.filter((p) => p.tech.includes(skill)).map((p) => p.title);

export default function Skills() {
  const levels = Object.entries(siteData.skillLevels);

  return (
    <section id="skills" className="py-24 sm:py-28 bg-[#111113]">
      <div className="max-w-5xl mx-auto px-6">
        <SectionHeading
          eyebrow="Tech Stack"
          title="Skills"
          intro="Grouped by how much I actually use them. Skills with a project under them link to where I used them."
        />

        {/* Edit skills and their levels in data/portfolio.js */}
        <div className="space-y-10">
          {levels.map(([id, title], i) => (
            <div key={id}>
              <h3 className="flex items-center gap-3 mb-4 text-[11px] font-semibold text-amber-400 uppercase tracking-[0.2em] font-mono">
                <SignalBars filled={levels.length - i} total={levels.length} />
                {title}
              </h3>
              <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
                {siteData.skills
                  .filter((skill) => skill.level === id)
                  .map((skill) => (
                    <li key={skill.name}>
                      <SkillTile name={skill.name} projects={projectsUsing(skill.name)} />
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Three bars like a signal meter: more filled bars, more use.
function SignalBars({ filled, total }) {
  return (
    <span className="flex h-3.5 items-end gap-[3px]" aria-hidden="true">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`w-[3px] rounded-sm ${i < filled ? "bg-amber-500" : "bg-[#3f3f46]"}`}
          style={{ height: `${((i + 1) / total) * 100}%` }}
        />
      ))}
    </span>
  );
}
