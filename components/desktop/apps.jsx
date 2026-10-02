"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Icon } from "./icons";
import s from "./desktop.module.css";

function ExternalButton({ href, icon, children }) {
  return (
    <a className={s.btn} href={href} target="_blank" rel="noopener noreferrer">
      <Icon name={icon} />
      {children}
    </a>
  );
}

export function AboutApp({ profile, openApp }) {
  return (
    <>
      <div className={s.profileHead}>
        <div className={s.avatar} aria-hidden="true">
          {profile.initials}
        </div>
        <div>
          <p className={s.eyebrow}>{profile.greeting}</p>
          <h3>{profile.name}</h3>
          <p className={s.role}>
            {profile.role} · <strong>{profile.goal}</strong>
          </p>
        </div>
      </div>
      {profile.bio.map((paragraph, i) => (
        <p key={i} className={i === 0 ? s.lead : undefined}>
          {paragraph}
        </p>
      ))}
      <dl className={s.facts}>
        {profile.facts.map((fact) => (
          <div key={fact.label}>
            <dt>{fact.label}</dt>
            <dd>{fact.value}</dd>
          </div>
        ))}
      </dl>
      <div className={s.btnRow}>
        <button
          type="button"
          className={`${s.btn} ${s.btnPrimary}`}
          onClick={() => openApp("projects")}
        >
          View projects
        </button>
        <button type="button" className={s.btn} onClick={() => openApp("contact")}>
          Contact me
        </button>
      </div>
    </>
  );
}

// A sidebar of project screenshots and a detail pane for the one picked.
// Web apps and setup guides open in the desktop's own Browser window.
export function ProjectsApp({ profile, openApp }) {
  const [current, setCurrent] = useState(0);
  const project = profile.projects[current];

  return (
    <div className={s.projects}>
      <div className={s.projLayout}>
        <nav className={s.projSide} aria-label="Projects">
          <p className={s.projSideHead}>
            Projects <span>{profile.projects.length}</span>
          </p>
          <ul className={s.projList}>
            {profile.projects.map((p, i) => (
              <li key={p.title}>
                <button
                  type="button"
                  aria-current={i === current || undefined}
                  onClick={() => setCurrent(i)}
                >
                  <span className={s.projThumb}>
                    {p.image && <Image src={p.image} alt="" fill sizes="190px" />}
                  </span>
                  <strong>{p.title}</strong>
                  <small>{p.kind ?? "Project"}</small>
                </button>
              </li>
            ))}
          </ul>
          <p className={s.projSoon}>More on the way</p>
        </nav>

        <ProjectDetail key={project.title} project={project} openApp={openApp} />
      </div>
    </div>
  );
}

// Laid out like an app store page: name and actions first, then the
// screenshot and description.
function ProjectDetail({ project, openApp }) {
  return (
    <article className={s.projDetail}>
      <p className={s.eyebrow}>{project.kind ?? "Project"}</p>
      <h3>{project.title}</h3>
      <ul className={s.chips} aria-label="Tech stack">
        {project.tech.map((tech) => (
          <li key={tech} className={s.chip}>
            {tech}
          </li>
        ))}
      </ul>
      <div className={s.links}>
        {project.live && (
          <button
            type="button"
            className={`${s.btn} ${s.btnPrimary}`}
            onClick={() => openApp("browser", { url: project.live })}
          >
            <Icon name="browser" />
            Try it here
          </button>
        )}
        {project.download && (
          <a
            className={`${s.btn} ${project.live ? "" : s.btnPrimary}`}
            href={project.download}
            download
          >
            <Icon name="download" />
            Download
          </a>
        )}
        {project.details && (
          <button type="button" className={s.btn} onClick={() => openApp("browser", { url: project.details })}>
            <Icon name="doc" />
            Setup guide
          </button>
        )}
        {project.live && (
          <ExternalButton href={project.live} icon="external">
            New tab
          </ExternalButton>
        )}
        {project.github && (
          <ExternalButton href={project.github} icon="github">
            GitHub
          </ExternalButton>
        )}
      </div>
      {project.image && (
        <div className={s.projShot}>
          <Image
            src={project.image}
            alt={`Screenshot of ${project.title}`}
            fill
            sizes="(max-width: 720px) 100vw, 560px"
          />
        </div>
      )}
      <p>{project.description}</p>
    </article>
  );
}

export function SkillsApp({ profile }) {
  return (
    <>
      <p className={s.eyebrow}>Tech Stack</p>
      <h3 style={{ marginBottom: 18 }}>Skills</h3>
      {Object.entries(profile.skills).map(([category, items]) => (
        <section key={category} className={s.skillGroup}>
          <h4>{category}</h4>
          <ul className={s.chips}>
            {items.map((skill) => (
              <li key={skill} className={s.skill}>
                {skill}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.cssText = "position:fixed;opacity:0";
  document.body.append(area);
  area.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  area.remove();
  return ok;
}

export function ContactApp({ profile }) {
  const [copyState, setCopyState] = useState("idle");
  const resetTimer = useRef(null);

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  async function handleCopy() {
    const ok = await copyText(profile.email);
    setCopyState(ok ? "copied" : "failed");
    clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopyState("idle"), 1600);
  }

  const rows = [
    {
      icon: "contact",
      label: "Email",
      link: <a href={`mailto:${profile.email}`}>{profile.email}</a>,
      extra: (
        <button type="button" className={`${s.btn} ${s.copyBtn}`} onClick={handleCopy}>
          {copyState === "copied" ? "Copied" : copyState === "failed" ? "Copy failed" : "Copy"}
        </button>
      ),
    },
    {
      icon: "github",
      label: "GitHub",
      link: (
        <a href={profile.github.url} target="_blank" rel="noopener noreferrer">
          {profile.github.label}
        </a>
      ),
    },
    {
      icon: "linkedin",
      label: "LinkedIn",
      link: (
        <a href={profile.linkedin.url} target="_blank" rel="noopener noreferrer">
          {profile.linkedin.label}
        </a>
      ),
    },
  ];

  return (
    <>
      <p className={s.eyebrow}>Get In Touch</p>
      <h3 style={{ marginBottom: 10 }}>Contact</h3>
      <p>{profile.contactIntro}</p>
      <ul className={s.contactList}>
        {rows.map((row) => (
          <li key={row.label} className={s.contactRow}>
            <span className={s.ico}>
              <Icon name={row.icon} />
            </span>
            <div className={s.meta}>
              <div className={s.label}>{row.label}</div>
              {row.link}
            </div>
            {row.extra}
          </li>
        ))}
      </ul>
      <span className={s.srOnly} aria-live="polite">
        {copyState === "copied"
          ? "Email address copied"
          : copyState === "failed"
            ? "Could not copy email address"
            : ""}
      </span>
    </>
  );
}

// A one-page resume built from the same portfolio data; printable on its own.
export function ResumeApp({ profile }) {
  const fact = (label) => profile.facts.find((f) => f.label === label)?.value;
  const location = fact("Location");
  return (
    <>
      <div className={s.resumeBar}>
        <button type="button" className={`${s.btn} ${s.btnPrimary}`} onClick={() => window.print()}>
          <Icon name="download" />
          Print / Save as PDF
        </button>
      </div>
      <article className={s.resume} data-print-root="">
        <header className={s.resumeHead}>
          <h3>{profile.name}</h3>
          <p className={s.resumeRole}>
            {profile.role} · {profile.goal}
          </p>
          <p className={s.resumeContact}>
            {location && <span>{location}</span>}
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
            <a href={profile.github.url} target="_blank" rel="noopener noreferrer">
              {profile.github.url.replace("https://", "")}
            </a>
            <a href={profile.linkedin.url} target="_blank" rel="noopener noreferrer">
              {profile.linkedin.url.replace("https://", "")}
            </a>
          </p>
        </header>

        <section>
          <h4>Summary</h4>
          <p>{profile.bio[0]}</p>
        </section>

        <section>
          <h4>Education</h4>
          <div className={s.resumeItem}>
            <strong>{fact("Education")}</strong>
            {fact("Concentration") && <span>Concentration: {fact("Concentration")}</span>}
          </div>
        </section>

        <section>
          <h4>Projects</h4>
          {profile.projects.map((project) => (
            <div key={project.title} className={s.resumeItem}>
              <strong>{project.title}</strong>
              <span className={s.resumeTech}>{project.tech.join(" · ")}</span>
              <p>{project.description}</p>
            </div>
          ))}
        </section>

        <section>
          <h4>Skills</h4>
          <dl className={s.resumeSkills}>
            {Object.entries(profile.skills).map(([category, items]) => (
              <div key={category}>
                <dt>{category}</dt>
                <dd>{items.join(", ")}</dd>
              </div>
            ))}
          </dl>
        </section>
      </article>
    </>
  );
}
