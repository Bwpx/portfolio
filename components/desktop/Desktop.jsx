"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Window, { isSheet } from "./Window";
import Terminal from "./Terminal";
import { AboutApp, ContactApp, ProjectsApp, SkillsApp } from "./apps";
import { Icon } from "./icons";
import { PROFILE } from "./profile";
import { THEME_SCRIPT, ensureTheme, setTheme, useTheme } from "./theme";
import s from "./desktop.module.css";

// w/h: preferred size; x/y: preferred position as a fraction of the screen.
const APPS = {
  about: { title: "About", tile: "linear-gradient(135deg,#f59e0b,#ea580c)", w: 560, h: 600, x: 0.1, y: 0.06, Component: AboutApp },
  projects: { title: "Projects", tile: "linear-gradient(135deg,#38bdf8,#4f46e5)", w: 640, h: 540, x: 0.4, y: 0.1, Component: ProjectsApp },
  skills: { title: "Skills", tile: "linear-gradient(135deg,#34d399,#0d9488)", w: 480, h: 400, x: 0.18, y: 0.3, Component: SkillsApp },
  contact: { title: "Contact", tile: "linear-gradient(135deg,#fb7185,#db2777)", w: 460, h: 420, x: 0.56, y: 0.26, Component: ContactApp },
  terminal: { title: "Terminal", tile: "linear-gradient(135deg,#3f3f46,#18181b)", w: 620, h: 400, x: 0.32, y: 0.38, Component: Terminal },
};
const DOCK_ORDER = ["about", "projects", "skills", "contact", "terminal"];

const cx = (...names) => names.filter(Boolean).join(" ");
const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const frontmost = (list) => list.reduce((top, w) => (!top || w.z > top.z ? w : top), null);

// Menu bar clock, kept outside React state so it never mismatches on hydration.
let clockFormat;
function readClock() {
  clockFormat ??= new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  return clockFormat.format(new Date());
}
function subscribeClock(onChange) {
  const timer = setInterval(onChange, 15000);
  return () => clearInterval(timer);
}

export default function Desktop() {
  // Each window: { id, z, minimized, zoomed, phase: "open" | "closing" | "minimizing" }
  const [wins, setWins] = useState([]);
  const [focusRequest, setFocusRequest] = useState({ id: null, n: 0 });
  const [menuOpen, setMenuOpen] = useState(false);
  const theme = useTheme();
  const clock = useSyncExternalStore(subscribeClock, readClock, () => "");
  const zTop = useRef(10);
  const dockRefs = useRef({});
  const sysBtnRef = useRef(null);
  const menuRef = useRef(null);

  const visible = wins.filter((w) => !w.minimized && w.phase === "open");
  const front = frontmost(visible);

  const requestFocus = (id) => setFocusRequest((f) => ({ id, n: f.n + 1 }));

  function bringToFront(id) {
    const z = ++zTop.current;
    setWins((ws) => ws.map((w) => (w.id === id ? { ...w, z } : w)));
  }

  function openApp(id) {
    const z = ++zTop.current;
    setWins((ws) => {
      const existing = ws.find((w) => w.id === id);
      if (!existing) return [...ws, { id, z, minimized: false, zoomed: false, phase: "open" }];
      if (existing.phase === "closing") return ws;
      return ws.map((w) => (w.id === id ? { ...w, z, minimized: false, phase: "open" } : w));
    });
    requestFocus(id);
  }

  // After a window goes away, focus the next window, or its dock icon.
  function focusAfterLeaving(id) {
    const next = frontmost(visible.filter((w) => w.id !== id));
    if (next) requestFocus(next.id);
    else dockRefs.current[id]?.focus();
  }

  function closeWin(id) {
    const instant = reduceMotion();
    setWins((ws) =>
      instant
        ? ws.filter((w) => w.id !== id)
        : ws.map((w) => (w.id === id ? { ...w, phase: "closing" } : w))
    );
    focusAfterLeaving(id);
  }

  function minimizeWin(id) {
    const instant = reduceMotion();
    setWins((ws) =>
      ws.map((w) =>
        w.id !== id || w.minimized
          ? w
          : instant
            ? { ...w, minimized: true }
            : { ...w, phase: "minimizing" }
      )
    );
    focusAfterLeaving(id);
  }

  function toggleZoom(id) {
    if (isSheet()) return;
    setWins((ws) => ws.map((w) => (w.id === id ? { ...w, zoomed: !w.zoomed } : w)));
  }

  function closeAll() {
    const instant = reduceMotion();
    setWins((ws) =>
      instant ? [] : ws.filter((w) => !w.minimized).map((w) => ({ ...w, phase: "closing" }))
    );
    sysBtnRef.current?.focus();
  }

  const handleClosed = useCallback((id) => {
    setWins((ws) => ws.filter((w) => w.id !== id));
  }, []);

  const handleMinimized = useCallback((id) => {
    setWins((ws) =>
      ws.map((w) =>
        w.id === id && w.phase === "minimizing" ? { ...w, minimized: true, phase: "open" } : w
      )
    );
  }, []);

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  // ── System menu ──────────────────────────────────────────────────────────
  const menuItems = () => Array.from(menuRef.current.querySelectorAll('[role="menuitem"]'));

  function openMenuAndFocus() {
    setMenuOpen(true);
    requestAnimationFrame(() => menuItems()[0]?.focus());
  }

  function runMenuAction(action) {
    setMenuOpen(false);
    action();
  }

  function handleMenuKeyDown(e) {
    const items = menuItems();
    const i = items.indexOf(document.activeElement);
    const go = (n) => {
      e.preventDefault();
      items[(n + items.length) % items.length].focus();
    };
    if (e.key === "ArrowDown") go(i + 1);
    else if (e.key === "ArrowUp") go(i - 1);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(items.length - 1);
    else if (e.key === "Tab") setMenuOpen(false);
  }

  // ── Global listeners ─────────────────────────────────────────────────────
  // Escape closes the menu first, then the front window.
  const onKeyDown = useEffectEvent((e) => {
    if (e.key !== "Escape" || e.defaultPrevented) return;
    if (menuOpen) {
      e.preventDefault();
      setMenuOpen(false);
      sysBtnRef.current?.focus();
    } else if (front) {
      e.preventDefault();
      closeWin(front.id);
    }
  });

  const onPointerDown = useEffectEvent((e) => {
    if (menuOpen && !menuRef.current.contains(e.target) && !sysBtnRef.current.contains(e.target)) {
      setMenuOpen(false);
    }
  });

  const boot = useEffectEvent(() => {
    // Deep links like /desktop/#projects open that window on load.
    const fromHash = window.location.hash.slice(1).toLowerCase();
    if (APPS[fromHash]) openApp(fromHash);
    else if (!isSheet()) openApp("about");
  });

  useEffect(() => {
    const keyHandler = (e) => onKeyDown(e);
    const pointerHandler = (e) => onPointerDown(e);
    document.addEventListener("keydown", keyHandler);
    document.addEventListener("pointerdown", pointerHandler);
    return () => {
      document.removeEventListener("keydown", keyHandler);
      document.removeEventListener("pointerdown", pointerHandler);
    };
  }, []);

  useEffect(() => {
    ensureTheme();
    const frame = requestAnimationFrame(() => boot());
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className={s.desk} data-desk-root="" suppressHydrationWarning>
      <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      <div className={s.wallpaper} aria-hidden="true" />

      <header className={s.menubar}>
        <button
          ref={sysBtnRef}
          id="desk-sys-btn"
          type="button"
          className={cx(s.menubarBtn, s.monogram)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-controls="desk-sys-menu"
          aria-label="System menu"
          onClick={() => setMenuOpen((open) => !open)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              openMenuAndFocus();
            }
          }}
        >
          <span>{"<"}</span>mg<span>{" />"}</span>
        </button>
        <span className={s.activeApp} aria-live="polite">
          {front ? APPS[front.id].title : "Desktop"}
        </span>
        <span className={s.spacer} />
        <button
          type="button"
          className={s.menubarBtn}
          aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
          onClick={toggleTheme}
        >
          {theme && <Icon name={theme === "dark" ? "sun" : "moon"} />}
        </button>
        <span className={s.clock}>{clock}</span>
      </header>

      <div
        ref={menuRef}
        id="desk-sys-menu"
        className={s.sysMenu}
        role="menu"
        aria-labelledby="desk-sys-btn"
        hidden={!menuOpen}
        onKeyDown={handleMenuKeyDown}
      >
        <button type="button" role="menuitem" onClick={() => runMenuAction(() => openApp("about"))}>
          About {PROFILE.name.split(" ")[0]}
        </button>
        <button type="button" role="menuitem" onClick={() => runMenuAction(() => openApp("terminal"))}>
          Open Terminal
        </button>
        <button
          type="button"
          role="menuitem"
          onClick={() =>
            runMenuAction(() => {
              toggleTheme();
              sysBtnRef.current?.focus();
            })
          }
        >
          Toggle light/dark
        </button>
        <button type="button" role="menuitem" onClick={() => runMenuAction(closeAll)}>
          Close all windows
        </button>
        <hr role="separator" />
        <Link role="menuitem" href={PROFILE.homepage} prefetch={false}>
          Back to main site <kbd>↩</kbd>
        </Link>
      </div>

      <main aria-label="Desktop">
        <h1 className={s.srOnly}>{PROFILE.name} — interactive desktop portfolio</h1>
        {wins.map((w) => {
          const app = APPS[w.id];
          const App = app.Component;
          return (
            <Window
              key={w.id}
              app={app}
              win={w}
              active={front?.id === w.id}
              focusSignal={focusRequest.id === w.id ? focusRequest.n : 0}
              onActivate={bringToFront}
              onClose={closeWin}
              onMinimize={minimizeWin}
              onZoom={toggleZoom}
              onClosed={handleClosed}
              onMinimized={handleMinimized}
            >
              {w.id === "terminal" ? (
                <Terminal
                  profile={PROFILE}
                  openApp={openApp}
                  theme={theme}
                  setTheme={setTheme}
                  onExit={() => closeWin("terminal")}
                />
              ) : (
                <App profile={PROFILE} openApp={openApp} />
              )}
            </Window>
          );
        })}
      </main>

      <nav className={s.dock} aria-label="Dock">
        {DOCK_ORDER.map((id) => {
          const app = APPS[id];
          const w = wins.find((win) => win.id === id && win.phase !== "closing");
          const status = w ? (w.minimized ? " (minimized)" : " (open)") : "";
          return (
            <button
              key={id}
              ref={(el) => {
                dockRefs.current[id] = el;
              }}
              type="button"
              className={cx(s.dockItem, w && s.isRunning)}
              data-app={id}
              aria-label={app.title + status}
              onClick={() => openApp(id)}
            >
              <span className={s.appIcon} style={{ "--tile": app.tile }}>
                <Icon name={id} />
              </span>
              <span className={s.dockLabel} aria-hidden="true">
                {app.title}
              </span>
            </button>
          );
        })}
        <span className={s.dockSep} aria-hidden="true" />
        <Link
          className={s.dockItem}
          href={PROFILE.homepage}
          prefetch={false}
          aria-label="Main site"
        >
          <span className={s.appIcon} style={{ "--tile": "linear-gradient(135deg,#71717a,#3f3f46)" }}>
            <Icon name="home" />
          </span>
          <span className={s.dockLabel} aria-hidden="true">
            Main site
          </span>
        </Link>
      </nav>
    </div>
  );
}
