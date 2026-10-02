"use client";

import { useState } from "react";
import { Icon } from "./icons";
import s from "./desktop.module.css";

// Google's embeddable mode (igu=1) is the one Google page that may be shown
// inside a frame, so it doubles as the home page and the search engine.
const GOOGLE_HOME = "https://www.google.com/webhp?igu=1";
const googleSearch = (q) => `https://www.google.com/search?igu=1&q=${encodeURIComponent(q)}`;

// Pages that refuse to load inside a frame open in a new tab instead.
const FRAME_BLOCKED = /(^|\.)(github\.com|linkedin\.com|duckduckgo\.com)$/i;

function bookmarksFor(profile) {
  const marks = [
    { label: "Google", url: GOOGLE_HOME },
    { label: "Portfolio", url: profile.homepage },
    ...profile.projects.flatMap((p) => [
      p.details && { label: p.title, url: p.details },
      p.live && { label: p.title, url: p.live },
    ]),
    { label: "GitHub", url: profile.github.url },
    { label: "LinkedIn", url: profile.linkedin.url },
  ];
  return marks.filter(Boolean);
}

// Turn what was typed into a URL; anything else becomes a Google search.
function toUrl(input) {
  const text = input.trim();
  if (text.startsWith("/")) return text;
  if (/^https?:\/\//i.test(text)) return text;
  if (!/\s/.test(text) && /\.[a-z]{2,}(\/|$)/i.test(text)) return `https://${text}`;
  return googleSearch(text);
}

function parse(url) {
  try {
    return new URL(url, window.location.href);
  } catch {
    return null;
  }
}

// Plain google.com pages are blocked in frames; their embeddable twin isn't.
function frameable(url) {
  const u = parse(url);
  if (!u || !/(^|\.)google\.com$/i.test(u.hostname) || u.searchParams.has("igu")) return url;
  u.searchParams.set("igu", "1");
  return u.href;
}

function blocksFraming(url) {
  const u = parse(url);
  return Boolean(u && FRAME_BLOCKED.test(u.hostname));
}

// What the address bar shows: the URL without the embedding flag.
function displayUrl(url) {
  const u = parse(url);
  if (!u || !u.searchParams.has("igu")) return url;
  u.searchParams.delete("igu");
  return u.pathname === "/webhp" && !u.search ? "google.com" : u.href;
}

const openTab = (url) => window.open(url, "_blank", "noopener,noreferrer");

export default function BrowserApp({ profile }) {
  const [history, setHistory] = useState({ stack: [GOOGLE_HOME], index: 0 });
  const [address, setAddress] = useState(() => displayUrl(GOOGLE_HOME));
  const [reloadKey, setReloadKey] = useState(0);
  const current = history.stack[history.index];
  const bookmarks = bookmarksFor(profile);

  function navigate(target) {
    const url = frameable(target);
    if (blocksFraming(url)) {
      openTab(url);
      return;
    }
    setHistory((h) => {
      const stack = [...h.stack.slice(0, h.index + 1), url];
      return { stack, index: stack.length - 1 };
    });
    setAddress(displayUrl(url));
  }

  function go(delta) {
    const index = history.index + delta;
    if (index < 0 || index >= history.stack.length) return;
    setHistory((h) => ({ ...h, index }));
    setAddress(displayUrl(history.stack[index]));
  }

  function submit(e) {
    e.preventDefault();
    if (address.trim()) navigate(toUrl(address));
  }

  return (
    <div className={s.browser}>
      <form className={s.browserBar} onSubmit={submit} role="search">
        <button type="button" className={s.iconBtn} aria-label="Back" disabled={history.index === 0} onClick={() => go(-1)}>
          <Icon name="back" />
        </button>
        <button
          type="button"
          className={s.iconBtn}
          aria-label="Forward"
          disabled={history.index === history.stack.length - 1}
          onClick={() => go(1)}
        >
          <Icon name="forward" />
        </button>
        <button type="button" className={s.iconBtn} aria-label="Reload" onClick={() => setReloadKey((k) => k + 1)}>
          <Icon name="reload" />
        </button>
        <button type="button" className={s.iconBtn} aria-label="Home" onClick={() => navigate(GOOGLE_HOME)}>
          <Icon name="home" />
        </button>
        <input
          className={s.addressInput}
          type="text"
          inputMode="url"
          value={address}
          placeholder="Search Google or type a URL"
          aria-label="Address"
          onChange={(e) => setAddress(e.target.value)}
          onFocus={(e) => e.target.select()}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          data-autofocus=""
        />
        <button
          type="button"
          className={s.iconBtn}
          aria-label="Open in new tab"
          onClick={() => openTab(displayUrl(current))}
        >
          <Icon name="external" />
        </button>
      </form>

      <nav className={s.bookmarkBar} aria-label="Bookmarks">
        {bookmarks.map((mark) => (
          <button key={mark.url} type="button" onClick={() => navigate(mark.url)} title={displayUrl(mark.url)}>
            <span className={s.favicon} aria-hidden="true">
              {mark.label[0]}
            </span>
            {mark.label}
          </button>
        ))}
      </nav>

      <iframe
        key={`${history.index}-${reloadKey}`}
        className={s.browserFrame}
        src={current}
        title="Browser page"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
