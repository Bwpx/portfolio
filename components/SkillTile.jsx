"use client";

import { showProjectsUsing } from "./projectEvents";
import SkillIcon, { skillColor } from "./SkillIcons";

// One skill: its logo (grey until hovered, then in brand colour; always in
// colour on touch screens) and, when a project uses it, a link to that project.
export default function SkillTile({ name, projects }) {
  const linked = projects.length > 0;
  const base =
    "group flex h-full w-full min-h-[60px] items-center gap-2.5 sm:gap-3 rounded-lg border border-[#27272a] bg-[#18181b] px-2.5 sm:px-3 py-2.5 text-left transition-colors duration-200";

  const body = (
    <>
      <span
        className="grid h-8 w-8 sm:h-9 sm:w-9 shrink-0 place-items-center rounded-md bg-[#0f0f11] text-[#71717a] transition-colors duration-200 group-hover:text-[var(--brand)] group-focus-visible:text-[var(--brand)] [@media(hover:none)]:text-[var(--brand)]"
        style={{ "--brand": skillColor(name) }}
      >
        <SkillIcon name={name} />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[13px] sm:text-sm font-semibold text-[#e4e4e7]">{name}</span>
        {linked && (
          <span className="mt-0.5 block text-[11px] leading-snug text-amber-400/90 group-hover:text-amber-300">
            <span className="sr-only">used in </span>
            {projects.length === 1 ? projects[0] : `${projects.length} projects`}{" "}
            <span aria-hidden="true" className="inline-block transition-transform duration-200 group-hover:translate-x-0.5">
              →
            </span>
          </span>
        )}
      </span>
    </>
  );

  if (!linked) return <div className={base}>{body}</div>;

  return (
    <button
      type="button"
      onClick={() => showProjectsUsing(name)}
      title={`See ${projects.join(", ")}`}
      className={`${base} cursor-pointer hover:border-amber-500/40 hover:bg-[#1c1c20] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400`}
    >
      {body}
    </button>
  );
}
