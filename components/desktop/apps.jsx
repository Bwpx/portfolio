"use client";

import { useEffect, useRef, useState } from "react";
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

export function ProjectsApp({ profile }) {
  return (
    <>
      <p className={s.eyebrow}>My Work</p>
      <h3 style={{ marginBottom: 16 }}>Projects</h3>
      {profile.projects.map((project) => (
        <article key={project.title} className={s.project}>
          <h4>{project.title}</h4>
          <p>{project.description}</p>
          <ul className={s.chips} aria-label="Tech stack">
            {project.tech.map((tech) => (
              <li key={tech} className={s.chip}>
                {tech}
              </li>
            ))}
          </ul>
          <div className={s.links}>
            {project.details && (
              <a className={`${s.btn} ${s.btnPrimary}`} href={project.details}>
                <Icon name="doc" />
                Setup guide
              </a>
            )}
            {project.live && (
              <ExternalButton href={project.live} icon="external">
                Live site
              </ExternalButton>
            )}
            {project.download && (
              <a className={s.btn} href={project.download} download>
                <Icon name="download" />
                Download
              </a>
            )}
            {project.github && (
              <ExternalButton href={project.github} icon="github">
                GitHub
              </ExternalButton>
            )}
          </div>
        </article>
      ))}
    </>
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
