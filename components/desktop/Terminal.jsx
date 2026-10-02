"use client";

import { Fragment, useEffect, useId, useRef, useState } from "react";
import s from "./desktop.module.css";

const FILES = {
  "about.txt": "about",
  "projects/": "projects",
  "skills.txt": "skills",
  "contact.txt": "contact",
};

const OPENABLE = ["about", "projects", "skills", "contact"];

const span = (cls, text) => <span className={s[cls]}>{text}</span>;
const extLink = (href, text) => (
  <a href={href} target="_blank" rel="noopener noreferrer">
    {text}
  </a>
);

export default function Terminal({ profile, openApp, theme, setTheme, onExit }) {
  const prompt = `${profile.handle}@portfolio ~ $`;
  const inputId = useId();
  const inputRef = useRef(null);
  const nextLineId = useRef(3);
  const history = useRef([]);
  const historyIndex = useRef(0);
  const [value, setValue] = useState("");
  const [lines, setLines] = useState(() => [
    { id: 0, parts: [span("acc", `Welcome to ${profile.name}'s desktop.`)] },
    { id: 1, parts: [span("dim", "Type 'help' to see what you can do.")] },
    { id: 2, parts: [""] },
  ]);

  useEffect(() => {
    inputRef.current?.scrollIntoView({ block: "nearest" });
  }, [lines]);

  function run(raw) {
    const line = raw.trim();
    const out = [];
    const print = (...parts) => out.push(parts);
    let cleared = false;

    print(span("acc", `${prompt} `), line);

    const commands = {
      help: {
        desc: "list commands",
        run() {
          print(span("acc", "Available commands:"));
          Object.entries(commands).forEach(([name, cmd]) =>
            print(`  ${name.padEnd(12)}`, span("dim", cmd.desc))
          );
        },
      },
      whoami: {
        desc: "who is this?",
        run: () => print(`${profile.name} — ${profile.role}, ${profile.goal}.`),
      },
      about: {
        desc: "short bio",
        run() {
          profile.bio.forEach((p, i) => {
            if (i) print("");
            print(p);
          });
        },
      },
      projects: {
        desc: "list projects",
        run() {
          profile.projects.forEach((p, i) => {
            print(span("acc", `${i + 1}. ${p.title}`), span("dim", `  [${p.tech.join(", ")}]`));
            const links = [];
            if (p.details) links.push(<a href={p.details}>guide</a>);
            if (p.live) links.push(extLink(p.live, "live"));
            if (p.github) links.push(extLink(p.github, "github"));
            print(
              "   ",
              ...links.flatMap((l, j) => (j ? [span("dim", " · "), l] : [l]))
            );
          });
          print(span("dim", "Tip: 'open projects' shows the full write-ups."));
        },
      },
      skills: {
        desc: "tech stack",
        run() {
          Object.entries(profile.skills).forEach(([cat, items]) =>
            print(span("acc", `${cat}: `), items.join(", "))
          );
        },
      },
      contact: {
        desc: "how to reach me",
        run() {
          print("email     ", <a href={`mailto:${profile.email}`}>{profile.email}</a>);
          print("github    ", extLink(profile.github.url, profile.github.url.replace("https://", "")));
          print("linkedin  ", extLink(profile.linkedin.url, profile.linkedin.url.replace("https://", "")));
        },
      },
      open: {
        desc: "open <about|projects|skills|contact>",
        run(args) {
          const id = (args[0] || "").toLowerCase().replace(/\/$/, "");
          if (OPENABLE.includes(id)) {
            openApp(id);
            print(span("dim", `Opening ${id}…`));
          } else {
            print(span("err", `open: unknown app '${args[0] || ""}'.`), ` Try: ${OPENABLE.join(", ")}`);
          }
        },
      },
      ls: { desc: "list files", run: () => print(Object.keys(FILES).join("   ")) },
      cat: {
        desc: "cat <file>",
        run(args) {
          const target = FILES[args[0]];
          if (target) commands[target].run([]);
          else print(span("err", `cat: ${args[0] || ""}: No such file`));
        },
      },
      theme: {
        desc: "theme [light|dark]",
        run(args) {
          const next =
            args[0] === "light" || args[0] === "dark" ? args[0] : theme === "dark" ? "light" : "dark";
          setTheme(next);
          print(`Theme set to ${next}.`);
        },
      },
      date: { desc: "current date and time", run: () => print(new Date().toString()) },
      echo: { desc: "echo <text>", run: (args) => print(args.join(" ")) },
      history: {
        desc: "command history",
        run() {
          history.current.forEach((cmd, i) => print(span("dim", `${String(i + 1).padStart(3)}  `), cmd));
        },
      },
      clear: {
        desc: "clear the screen",
        run() {
          cleared = true;
        },
      },
      home: {
        desc: "go to the main site",
        run() {
          print("Leaving the desktop…");
          window.location.assign(profile.homepage);
        },
      },
      exit: { desc: "close the terminal", run: () => onExit() },
    };

    if (line) {
      history.current.push(line);
      historyIndex.current = history.current.length;
      const [name, ...args] = line.split(/\s+/);
      const cmd = commands[name.toLowerCase()];
      if (name.toLowerCase() === "sudo") print(span("err", "Permission denied."), " Nice try though.");
      else if (cmd) cmd.run(args);
      else print(span("err", `command not found: ${name}`), span("dim", "  (type 'help')"));
    }

    if (cleared) {
      setLines([]);
      return;
    }
    const withIds = out.map((parts) => ({ id: nextLineId.current++, parts }));
    setLines((prev) => [...prev, ...withIds]);
  }

  function handleKeyDown(e) {
    const past = history.current;
    if (e.key === "ArrowUp" && past.length) {
      e.preventDefault();
      historyIndex.current = Math.max(0, historyIndex.current - 1);
      setValue(past[historyIndex.current]);
    } else if (e.key === "ArrowDown" && past.length) {
      e.preventDefault();
      historyIndex.current = Math.min(past.length, historyIndex.current + 1);
      setValue(past[historyIndex.current] ?? "");
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  }

  return (
    <div
      style={{ minHeight: "100%" }}
      onClick={() => {
        if (!String(window.getSelection())) inputRef.current?.focus();
      }}
    >
      <div className={s.termOut} role="log" aria-live="polite" aria-label="Terminal output">
        {lines.map((line) => (
          <p key={line.id}>
            {line.parts.map((part, i) => (
              <Fragment key={i}>{part}</Fragment>
            ))}
          </p>
        ))}
      </div>
      <form
        className={s.termLine}
        onSubmit={(e) => {
          e.preventDefault();
          run(value);
          setValue("");
        }}
      >
        <label className={s.prompt} htmlFor={inputId}>
          {prompt}
        </label>
        <input
          ref={inputRef}
          id={inputId}
          className={s.termInput}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          data-autofocus=""
        />
      </form>
    </div>
  );
}
