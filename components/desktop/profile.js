import { siteData } from "@/data/portfolio";

// Desktop content is derived from data/portfolio.js — edit that file, not this one.
const { name, hero, about, projects, skills, contact } = siteData;

export const PROFILE = {
  name,
  initials: name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .toUpperCase(),
  handle: name.split(/\s+/)[0].toLowerCase(),
  greeting: hero.greeting,
  role: hero.roleLeft,
  goal: hero.roleRight,
  bio: about.paragraphs,
  facts: about.info.filter((fact) => fact.label !== "Name"),
  contactIntro: contact.intro,
  email: contact.email,
  github: contact.github,
  linkedin: contact.linkedin,
  projects,
  skills,
  homepage: "/",
};
