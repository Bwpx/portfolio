import { siteData } from "@/data/portfolio";
import SectionHeading from "./SectionHeading";
import ProjectSlider from "./ProjectSlider";

export default function Projects() {
  return (
    <section id="projects" className="py-24 sm:py-28 bg-[#0a0a0a] overflow-hidden">
      <div className="max-w-5xl mx-auto px-6">
        <SectionHeading eyebrow="My Work" title="Projects" />
      </div>

      {/* Add new projects to siteData.projects in data/portfolio.js */}
      <ProjectSlider projects={siteData.projects} />
    </section>
  );
}
