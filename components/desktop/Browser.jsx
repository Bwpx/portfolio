"use client";

import { useState } from "react";
import { Icon } from "./icons";
import s from "./desktop.module.css";

const HOME = "home:";

// Pages that refuse to load inside a frame open in a new tab instead.
const FRAME_BLOCKED = /(^|\.)(github\.com|linkedin\.com|google\.com|duckduckgo\.com)$/i;

function bookmarksFor(profile) {
  const marks = [
    { label: "Portfolio", url: profile.homepage, note: "The classic one-page site" },
    ...profile.projects.flatMap((p) => [
      p.details && { label: p.title, url: p.details, note: "Setup guide" },
      p.live && { label: p.title, url: p.live, note: "Live site" },
    ]),
    { label: "GitHub", url: profile.github.url, note: "Opens in a new tab" },
    { label: "LinkedIn", url: profile.linkedin.url, note: "Opens in a new tab" },
  ];
  return marks.filter(Boolean);
}

// Turn what was typed into a URL, or null for a search.
function toUrl(input) {
  const text = input.trim();
  if (!text) return null;
  if (text.startsWith("/")) return text;
  if (/^https?:\/\//i.test(text)) return text;
  if (!/\s/.test(text) && /\.[a-z]{2,}(\/|$)/i.test(text)) return `https://${text}`;
  return null;
}

function blocksFraming(url) {
  try {
    return FRAME_BLOCKED.test(new URL(url, window.location.href).hostname);
  } catch {
    return false;
  }
}

const openTab = (url) => window.open(url, "_blank", "noopener,noreferrer");

export default function BrowserApp({ profile }) {
  const [history, setHistory] = useState({ stack: [HOME], index: 0 });
  const [address, setAddress] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const current = history.stack[history.index];
  const bookmarks = bookmarksFor(profile);

  function show(url) {
    setHistory((h) => {
      const stack = [...h.stack.slice(0, h.index + 1), url];
      return { stack, index: stack.length - 1 };
    });
    setAddress(url === HOME ? "" : url);
  }

  function navigate(url) {
    if (url !== HOME && blocksFraming(url)) openTab(url);
    else show(url);
  }

  function go(delta) {
    const index = history.index + delta;
    if (index < 0 || index >= history.stack.length) return;
    setHistory((h) => ({ ...h, index }));
    const url = history.stack[index];
    setAddress(url === HOME ? "" : url);
  }

  function submit(e) {
    e.preventDefault();
    const url = toUrl(address);
    if (url) navigate(url);
    else if (address.trim()) openTab(`https://duckduckgo.com/?q=${encodeURIComponent(address.trim())}`);
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
        <button type="button" className={s.iconBtn} aria-label="Start page" onClick={() => navigate(HOME)}>
          <Icon name="home" />
        </button>
        <input
          className={s.addressInput}
          type="text"
          inputMode="url"
          value={address}
          placeholder="Search or enter address"
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
          disabled={current === HOME}
          onClick={() => openTab(current)}
        >
          <Icon name="external" />
        </button>
      </form>

      {current === HOME ? (
        <div className={s.startPage}>
          <p className={s.eyebrow}>Start page</p>
          <h3>Where to?</h3>
          <ul className={s.bookmarks}>
            {bookmarks.map((mark) => (
              <li key={mark.url}>
                <button type="button" onClick={() => navigate(mark.url)}>
                  <span className={s.favicon} aria-hidden="true">
                    {mark.label[0]}
                  </span>
                  <span>
                    <strong>{mark.label}</strong>
                    <small>{mark.note}</small>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p className={s.browserHint}>
            Searches open DuckDuckGo in a new tab. Some sites don&apos;t allow being shown inside
            another page; use the ↗ button to open the current page in a real tab.
          </p>
        </div>
      ) : (
        <iframe
          key={`${history.index}-${reloadKey}`}
          className={s.browserFrame}
          src={current}
          title="Browser page"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
          referrerPolicy="no-referrer"
        />
      )}
    </div>
  );
}
