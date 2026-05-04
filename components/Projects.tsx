import Link from "next/link";
import { Download, ExternalLink, FolderOpen } from "lucide-react";
import { GitHubIcon } from "./Icons";
import { siteData } from "@/data/portfolio";
import SectionHeading from "./SectionHeading";

type Project = (typeof siteData.projects)[number];

export default function Projects() {
  return (
    <section id="projects" className="py-24 sm:py-28 bg-[#0a0a0a]">
      <div className="max-w-5xl mx-auto px-6">
        <SectionHeading eyebrow="My Work" title="Projects" />

        {/* Grid — add new projects to siteData.projects in data/portfolio.ts */}
        <div className="grid gap-5 sm:grid-cols-2">
          {siteData.projects.map((project, i) => (
            <ProjectCard key={i} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const p = project as Project & { download?: string; details?: string };
  // Card-wide click target priority: details page > live URL.
  const cardHref = p.details ?? p.live;
  const cardIsInternal = !!p.details;

  return (
    <article className="group relative flex flex-col bg-[#18181b] border border-[#27272a] rounded-xl p-6 hover:border-amber-500/40 hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-300">
      {cardHref &&
        (cardIsInternal ? (
          <Link
            href={cardHref}
            aria-label={`${project.title} — view setup guide`}
            className="absolute inset-0 rounded-xl z-10"
          />
        ) : (
          <a
            href={cardHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${project.title} — open live site`}
            className="absolute inset-0 rounded-xl z-10"
          />
        ))}

      <div className="flex items-start justify-between mb-5">
        <FolderOpen size={24} className="text-amber-500 shrink-0" />
        <div className="flex items-center gap-3 relative z-20">
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub repository"
              className="text-[#71717a] hover:text-[#e4e4e7] transition-colors duration-200"
            >
              <GitHubIcon size={17} />
            </a>
          )}
          {p.download && (
            <a
              href={p.download}
              download
              aria-label="Download executable"
              className="text-[#71717a] hover:text-amber-400 transition-colors duration-200"
            >
              <Download size={17} />
            </a>
          )}
          {project.live && (
            <a
              href={project.live}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Live site"
              className="text-[#71717a] hover:text-[#e4e4e7] transition-colors duration-200"
            >
              <ExternalLink size={17} />
            </a>
          )}
        </div>
      </div>

      <h3 className="text-[#e4e4e7] font-semibold text-base mb-3 leading-snug group-hover:text-amber-400 transition-colors duration-200">
        {project.title}
      </h3>

      <p className="text-[#71717a] text-sm leading-relaxed mb-6 flex-1">
        {project.description}
      </p>

      <div className="flex flex-wrap items-center gap-2 mt-auto">
        {project.tech.map((t) => (
          <span
            key={t}
            className="text-xs text-amber-400 bg-amber-500/8 border border-amber-500/20 px-2.5 py-1 rounded-full font-mono"
          >
            {t}
          </span>
        ))}
        {p.details && (
          <span className="ml-auto text-xs text-amber-400 font-mono group-hover:translate-x-0.5 transition-transform duration-200">
            Setup guide →
          </span>
        )}
      </div>
    </article>
  );
}
