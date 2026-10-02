"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Download, ExternalLink, Info, Plus, X } from "lucide-react";
import { GitHubIcon } from "./Icons";
import { SHOW_SKILL_EVENT } from "./projectEvents";

// Streaming-service style projects: a large "billboard" for the selected
// project, and a sliding row of tiles below it to pick from.

// Lines the row up with the 64rem page container while letting it run off the
// right edge of the screen.
const GUTTER = "max(1.5rem, calc((100vw - 64rem) / 2 + 1.5rem))";

export default function ProjectSlider({ projects }) {
  const [selected, setSelected] = useState(0);
  // A skill picked in the Skills section; projects without it are dimmed.
  const [spotlight, setSpotlight] = useState(null);
  const billboardRef = useRef(null);
  const project = projects[selected];
  const usesSpotlight = (p) => !spotlight || p.tech.includes(spotlight);

  function choose(index) {
    setSelected(index);
    if (!usesSpotlight(projects[index])) setSpotlight(null);
    // On small screens the billboard may be scrolled away; bring it back.
    const box = billboardRef.current.getBoundingClientRect();
    if (box.top < 0) billboardRef.current.scrollIntoView({ block: "start" });
  }

  useEffect(() => {
    function onShowSkill(event) {
      const skill = event.detail;
      const index = projects.findIndex((p) => p.tech.includes(skill));
      if (index < 0) return;
      // Render the new billboard first so focus lands on what's on screen.
      flushSync(() => {
        setSelected(index);
        setSpotlight(skill);
      });
      billboardRef.current.scrollIntoView({ block: "start" });
      billboardRef.current.focus({ preventScroll: true });
    }
    window.addEventListener(SHOW_SKILL_EVENT, onShowSkill);
    return () => window.removeEventListener(SHOW_SKILL_EVENT, onShowSkill);
  }, [projects]);

  const filter = spotlight && (
    <span className="flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 py-0.5 pl-3 pr-1 text-xs text-amber-300">
      Using {spotlight}
      <button
        type="button"
        onClick={() => setSpotlight(null)}
        aria-label="Show all projects"
        className="grid h-5 w-5 place-items-center rounded-full hover:bg-amber-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
      >
        <X size={12} strokeWidth={2.5} />
      </button>
    </span>
  );

  return (
    <>
      <div
        ref={billboardRef}
        tabIndex={-1}
        aria-label="Selected project"
        role="region"
        className="max-w-5xl mx-auto px-6 scroll-mt-24 outline-none"
      >
        <Billboard key={selected} project={project} highlight={spotlight} />
      </div>

      <p role="status" className="sr-only">
        {spotlight ? `Showing projects that use ${spotlight}` : ""}
      </p>

      <Row title="My Projects" filter={filter}>
        {projects.map((p, i) => (
          <Tile
            key={p.title}
            project={p}
            active={i === selected}
            dimmed={!usesSpotlight(p)}
            onSelect={() => choose(i)}
          />
        ))}
        <ComingSoonTile dimmed={Boolean(spotlight)} />
      </Row>
    </>
  );
}

function Billboard({ project, highlight }) {
  const primary = project.live
    ? { label: "Open live site", href: project.live, icon: ExternalLink, external: true }
    : project.download
      ? { label: "Download", href: project.download, icon: Download, download: true }
      : null;

  return (
    <article className="relative overflow-hidden rounded-2xl border border-[#27272a] bg-[#111113] sm:min-h-[440px] anim-billboard">
      {/* Backdrop */}
      <div className="relative aspect-video sm:absolute sm:inset-y-0 sm:right-0 sm:w-[64%] sm:aspect-auto">
        {project.image && (
          <Image
            src={project.image}
            alt={`Screenshot of ${project.title}`}
            fill
            sizes="(min-width: 640px) 700px, 100vw"
            className="object-cover object-top brightness-[0.8]"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111113] via-[#111113]/20 to-transparent sm:hidden" />
        <div
          className="hidden sm:block absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, #111113 0%, #111113 22%, rgba(17,17,19,0.75) 48%, rgba(17,17,19,0.1) 85%), linear-gradient(0deg, #111113 0%, transparent 35%)",
          }}
        />
      </div>

      {/* Details */}
      <div className="relative px-6 pb-7 -mt-8 sm:mt-0 sm:py-12 sm:px-10 sm:max-w-[54%]">
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] font-mono text-amber-400 mb-3">
          <span className="inline-block h-3.5 w-1 rounded-full bg-amber-500" />
          {project.kind ?? "Project"}
        </p>
        <h3 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold tracking-tight text-white leading-[1.05] mb-4">
          {project.title}
        </h3>
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-mono text-[#a1a1aa] mb-4">
          {project.tech.map((t, i) => (
            <span key={t} className="flex items-center gap-2">
              {i > 0 && <span className="text-[#52525b]">•</span>}
              <span className={t === highlight ? "rounded bg-amber-500/15 px-1.5 py-0.5 font-semibold text-amber-300" : undefined}>
                {t}
              </span>
            </span>
          ))}
        </p>
        <p className="text-sm leading-relaxed text-[#a1a1aa] line-clamp-4 sm:line-clamp-5 mb-7">
          {project.description}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          {primary && (
            <a
              href={primary.href}
              {...(primary.external ? { target: "_blank", rel: "noopener noreferrer" } : { download: true })}
              className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-black hover:bg-white/80 transition-colors"
            >
              <primary.icon size={17} strokeWidth={2.4} />
              {primary.label}
            </a>
          )}
          {project.details && (
            <Link
              href={project.details}
              className="inline-flex items-center gap-2 rounded-md bg-white/15 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/25 transition-colors"
            >
              <Info size={17} strokeWidth={2.4} />
              Setup guide
            </Link>
          )}
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${project.title} on GitHub`}
              title="View on GitHub"
              className="grid h-10 w-10 place-items-center rounded-full border border-white/30 text-white hover:border-white hover:bg-white/10 transition-colors"
            >
              <GitHubIcon size={17} />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

function Row({ title, filter, children }) {
  const scrollerRef = useRef(null);
  const [state, setState] = useState({ page: 0, pages: 1, atStart: true, atEnd: true });

  useEffect(() => {
    const el = scrollerRef.current;
    function measure() {
      const view = el.clientWidth;
      setState({
        page: Math.round(el.scrollLeft / view),
        pages: Math.max(1, Math.ceil((el.scrollWidth - 1) / view)),
        atStart: el.scrollLeft < 4,
        atEnd: el.scrollLeft + view >= el.scrollWidth - 4,
      });
    }
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    el.addEventListener("scroll", measure, { passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", measure);
    };
  }, []);

  function slide(direction) {
    const el = scrollerRef.current;
    el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: "smooth" });
  }

  const arrow =
    "absolute inset-y-0 z-20 hidden sm:flex w-12 items-center justify-center text-white/80 hover:text-white opacity-0 group-hover/row:opacity-100 focus-visible:opacity-100 transition-opacity";

  return (
    <div className="mt-12">
      <div className="max-w-5xl mx-auto px-6 mb-3 flex items-end justify-between">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h3 className="text-lg font-bold text-[#e4e4e7]">{title}</h3>
          {filter}
        </div>
        {state.pages > 1 && (
          <div className="flex gap-1" aria-hidden="true">
            {Array.from({ length: state.pages }, (_, i) => (
              <span
                key={i}
                className={`h-0.5 w-4 rounded-full ${i === state.page ? "bg-[#e4e4e7]" : "bg-[#3f3f46]"}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="group/row relative">
        {!state.atStart && (
          <button
            type="button"
            onClick={() => slide(-1)}
            aria-label="Previous projects"
            className={`${arrow} left-0 bg-gradient-to-r from-[#0a0a0a] to-transparent`}
          >
            <ChevronLeft size={34} />
          </button>
        )}
        <ul
          ref={scrollerRef}
          className="flex gap-3 overflow-x-auto snap-x snap-mandatory py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ paddingInline: GUTTER, scrollPaddingInline: GUTTER }}
        >
          {children}
        </ul>
        {!state.atEnd && (
          <button
            type="button"
            onClick={() => slide(1)}
            aria-label="More projects"
            className={`${arrow} right-0 bg-gradient-to-l from-[#0a0a0a] to-transparent`}
          >
            <ChevronRight size={34} />
          </button>
        )}
      </div>
    </div>
  );
}

const TILE = "snap-start shrink-0 w-[78vw] sm:w-[calc((min(100vw,64rem)-3rem-1.5rem)/3)]";

function Tile({ project, active, dimmed, onSelect }) {
  return (
    <li className={`${TILE} transition-[opacity,filter] duration-300 ${dimmed ? "opacity-35 grayscale hover:opacity-100 hover:grayscale-0" : ""}`}>
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={active}
        aria-label={`Show ${project.title}`}
        className={`group/tile relative block w-full aspect-video overflow-hidden rounded-lg bg-[#18181b] text-left ring-2 transition-[transform,box-shadow] duration-300 hover:scale-[1.04] hover:shadow-2xl hover:shadow-black/60 focus-visible:outline-none focus-visible:ring-amber-400 ${
          active ? "ring-amber-500" : "ring-transparent"
        }`}
      >
        {project.image && (
          <Image
            src={project.image}
            alt=""
            fill
            sizes="(min-width: 640px) 330px, 78vw"
            className="object-cover object-top transition-transform duration-500 group-hover/tile:scale-105"
          />
        )}
        <span className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        <span className="absolute inset-x-0 bottom-0 p-3.5">
          <span className="block text-[10px] font-mono uppercase tracking-[0.18em] text-amber-400 mb-1">
            {project.kind ?? "Project"}
          </span>
          <span className="block text-sm sm:text-base font-bold text-white leading-tight">{project.title}</span>
        </span>
        {active && (
          <span className="absolute top-2.5 left-2.5 rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black">
            Now showing
          </span>
        )}
      </button>
    </li>
  );
}

function ComingSoonTile({ dimmed }) {
  return (
    <li className={`${TILE} transition-opacity duration-300 ${dimmed ? "opacity-35" : ""}`}>
      <div className="relative flex w-full aspect-video flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[#3f3f46] bg-[#111113] text-center">
        <span className="grid h-10 w-10 place-items-center rounded-full border border-[#3f3f46] text-[#71717a]">
          <Plus size={18} />
        </span>
        <span className="text-sm font-semibold text-[#a1a1aa]">Next project</span>
        <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-amber-400/80">Coming soon</span>
      </div>
    </li>
  );
}
