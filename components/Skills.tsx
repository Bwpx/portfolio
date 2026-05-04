import { siteData } from "@/data/portfolio";
import SectionHeading from "./SectionHeading";

export default function Skills() {
  return (
    <section id="skills" className="py-24 sm:py-28 bg-[#111113]">
      <div className="max-w-5xl mx-auto px-6">
        <SectionHeading eyebrow="Tech Stack" title="Skills" />

        {/* Groups — edit categories and items in data/portfolio.ts */}
        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
          {Object.entries(siteData.skills).map(([category, items]) => (
            <SkillGroup key={category} category={category} items={items} />
          ))}
        </div>
      </div>
    </section>
  );
}

function SkillGroup({
  category,
  items,
}: {
  category: string;
  items: string[];
}) {
  return (
    <div className="rounded-xl border border-[#27272a] bg-[#18181b] p-6 hover:border-amber-500/30 transition-colors duration-300">
      <h3 className="text-[11px] font-semibold text-amber-400 uppercase tracking-[0.2em] mb-5 font-mono">
        {category}
      </h3>
      <div className="flex flex-wrap gap-2">
        {items.map((skill) => (
          <span
            key={skill}
            className="text-sm text-[#a1a1aa] bg-[#27272a] border border-[#3f3f46] px-3 py-1.5 rounded-lg hover:border-amber-500/40 hover:text-[#e4e4e7] transition-all duration-200 cursor-default"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}
